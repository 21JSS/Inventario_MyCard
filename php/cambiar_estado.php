<?php
$required_role_max = 2; // Solo Admin (1) o Tecnico (2)
require_once 'check_session.php';
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
    require_once 'validator_ip.php';
    $validacion = ValidatorIP::validarAsignacionIP($conexion, $ip_asignada, $departamento, $equipo_id);
    if (!$validacion['success']) {
        echo json_encode(['success' => false, 'error' => $validacion['error']]);
        exit;
    }
    $ip_final = $validacion['ip'] ?? null;

    $sql_update = "UPDATE equipos_pc SET estado = ?, nota_estado = ?, descripcion_equipo = ?, encargado = ?, departamento = ?, area = ?, ip_asignada = ? WHERE id = ?";
    $stmt_update = $conexion->prepare($sql_update);
    $stmt_update->bind_param("issssssi", $nuevo_estado, $nota, $descripcion_equipo, $encargado, $departamento, $area, $ip_final, $equipo_id);
}

if ($stmt_update->execute()) {
    // Registro en auditoría
    $str_estado = ($nuevo_estado === 1) ? "DISPONIBLE" : "OCUPADO";
    $accion_log = "CAMBIO_ESTADO";
    $detalle_log = "Equipo {$equipo_id} cambió estado a: $str_estado";
    $sql_log = "INSERT INTO logs_auditoria (usuario_id, accion, equipo_id, detalles) VALUES (?, ?, ?, ?)";
    $stmt_log = $conexion->prepare($sql_log);
    $stmt_log->bind_param("isis", $_SESSION['user_id'], $accion_log, $equipo_id, $detalle_log);
    $stmt_log->execute();

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