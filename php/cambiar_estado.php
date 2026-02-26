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
$estado_actual = $equipo['estado'];

$nuevo_estado = ($estado_actual === 'disponible') ? 'ocupada' : 'disponible';

// Si el nuevo estado es disponible, borramos la nota, el encargado, departamento y la IP
if ($nuevo_estado === 'disponible') {
    $nota = null;
    $sql_update = "UPDATE equipos_pc SET estado = ?, nota_estado = ?, encargado = '', departamento = '', area = '', ip_asignada = NULL WHERE id = ?";
    $stmt_update = $conexion->prepare($sql_update);
    $stmt_update->bind_param("ssi", $nuevo_estado, $nota, $equipo_id);
} else {
    // Si pasa a ocupada, actualizamos el estado, la nota, descripcion, encargado, departamento, area e IP
    // Si ip_asignada es cadena vacía, guardamos NULL
    $ip_final = (!empty($ip_asignada)) ? $ip_asignada : null;
    $sql_update = "UPDATE equipos_pc SET estado = ?, nota_estado = ?, descripcion_equipo = ?, encargado = ?, departamento = ?, area = ?, ip_asignada = ? WHERE id = ?";
    $stmt_update = $conexion->prepare($sql_update);
    $stmt_update->bind_param("sssssssi", $nuevo_estado, $nota, $descripcion_equipo, $encargado, $departamento, $area, $ip_final, $equipo_id);
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