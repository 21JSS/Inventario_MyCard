<?php
$required_role_max = 2; // Solo el Administrador y Tecnico pueden borrar equipos
require_once 'check_session.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$equipo_id = $_POST['id'] ?? '';

if (empty($equipo_id)) {
    echo json_encode(['success' => false, 'error' => 'ID de equipo requerido']);
    exit;
}

// 1. Obtener detalles del equipo antes de borrar para auditoria (por si acaso).
$sql = "SELECT id, nombre, encargado FROM equipos_pc WHERE id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $equipo_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'error' => 'Equipo no encontrado en la base de datos']);
    exit;
}

$equipo = $result->fetch_assoc();
$equipo_nombre = $equipo['nombre'];

// 2. Ejecutar la eliminación
$sql_delete = "DELETE FROM equipos_pc WHERE id = ?";
$stmt_delete = $conexion->prepare($sql_delete);
$stmt_delete->bind_param("i", $equipo_id);

if ($stmt_delete->execute()) {
    // 3. Registrar el borrado en logs_auditoria
    $accion_log = "ELIMINAR_EQUIPO";
    $detalle_log = "Se ha eliminado permanentemente el equipo ID: {$equipo_id} ({$equipo_nombre})";
    $sql_log = "INSERT INTO logs_auditoria (usuario_id, accion, equipo_id, detalles) VALUES (?, ?, ?, ?)";
    $stmt_log = $conexion->prepare($sql_log);
    
    // equipo_id quedará registrado pero el target ya no existirá, pero dejare el target por si es importante a futuro
    $stmt_log->bind_param("isis", $_SESSION['user_id'], $accion_log, $equipo_id, $detalle_log);
    $stmt_log->execute();

    echo json_encode([
        'success' => true,
        'mensaje' => 'El equipo ha sido eliminado de forma exitosa.'
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al eliminar el equipo: ' . $conexion->error]);
}

$conexion->close();
?>
