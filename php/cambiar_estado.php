<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');


require_once 'db.php';


$equipo_id = $_POST['id'] ?? '';
$nota = $_POST['nota'] ?? null;
$descripcion_equipo = $_POST['descripcion_equipo'] ?? null;
$encargado = $_POST['encargado'] ?? null;
$departamento= $_POST['departamento'] ?? null;
$area = $_POST['area'] ?? null;
$ip_asignada = $_POST['ip_asignada'] ?? null;

if (empty($equipo_id)) {
    echo json_encode(['success' => false, 'error' => 'ID de equipo requerido']);
    exit;
}

#Obtener estado actual del equipo
$sql = "SELECT estado FROM equipos_pc WHERE id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $equipo_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'error' => 'Equipo no encontrado']);
    exit;
}

$equipo = $result->fetch_assoc();
$estado_actual = (int)$equipo['estado'];

$nuevo_estado = ($estado_actual === 1) ? 0 : 1;

// Si el nuevo estado es disponible (1), borramos la nota, el encargado, departamento y la IP
if ($nuevo_estado === 1) {
    $nota = null;
    $sql_update = "UPDATE equipos_pc SET estado = ?, nota_estado = ?, encargado = '', departamento = NULL, area = NULL, ip_asignada = NULL WHERE id = ?";
    $stmt_update = $conexion->prepare($sql_update);
    $stmt_update->bind_param("isi", $nuevo_estado, $nota, $equipo_id);
} else {
    // Si pasa a ocupada, actualizamos 
    $ip_final = (!empty($ip_asignada)) ? $ip_asignada : null;

    // Validar que la IP no esté repetida 
    if ($ip_final !== null) {
        $sql_check = "SELECT id FROM equipos_pc WHERE ip_asignada = ? AND id != ?";
        $stmt_check = $conexion->prepare($sql_check);
        $stmt_check->bind_param("si", $ip_final, $equipo_id);
        $stmt_check->execute();
        $resultado_check = $stmt_check->get_result();

        if ($resultado_check->num_rows > 0) {
            echo json_encode(['success' => false, 'error' => 'La IP ' . $ip_final . ' ya está asignada a otro equipo']);
            exit;
        }

        // Validar que la IP esté dentro del rango del departamento
        $sql_rango = "SELECT ip_inicio, ip_fin, nombre FROM departamentos WHERE id = ?";
        $stmt_rango = $conexion->prepare($sql_rango);
        $stmt_rango->bind_param("i", $departamento);
        $stmt_rango->execute();
        $rango = $stmt_rango->get_result()->fetch_assoc();

        if ($rango) {
            $ip_num = ip2long($ip_final);
            $rango_inicio = ip2long($rango['ip_inicio']);
            $rango_fin = ip2long($rango['ip_fin']);

            if ($ip_num < $rango_inicio || $ip_num > $rango_fin) {
                echo json_encode(['success' => false, 'error' => 'La IP ' . $ip_final . ' no pertenece al rango del departamento ' . $rango['nombre'] . ' (' . $rango['ip_inicio'] . ' - ' . $rango['ip_fin'] . ')']);
                exit;
            }
        }
    }

    $sql_update = "UPDATE equipos_pc SET estado = ?, nota_estado = ?, descripcion_equipo = ?, encargado = ?, departamento = ?, area = ?, ip_asignada = ? WHERE id = ?";
    $stmt_update = $conexion->prepare($sql_update);
    $stmt_update->bind_param("issssssi", $nuevo_estado, $nota, $descripcion_equipo, $encargado, $departamento, $area, $ip_final, $equipo_id);
}

if ($stmt_update->execute()) {
    echo json_encode([
        'success' => true,
        'nuevo_estado' => $nuevo_estado,
        'mensaje' => 'Estado actualizado correctamente'
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al actualizar estado']);
}

$conexion->close();
?>