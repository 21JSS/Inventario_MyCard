<?php
// Solo el adminisrador  puede editar usuarios
$required_role_max = 1;
require_once 'check_session.php';
require_once 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$datos = json_decode(file_get_contents('php://input'), true);

$id     = (int)($datos['id'] ?? 0);
$nombre = trim($datos['nombre_completo'] ?? '');
$rol_id = (int)($datos['rol_id'] ?? 0);
$estatus= (int)($datos['estatus'] ?? 1);
$nueva_password = trim($datos['password'] ?? '');

if ($id <= 0 || empty($nombre) || $rol_id < 1) {
    echo json_encode(['success' => false, 'error' => 'Datos de edición inválidos.']);
    exit;
}

// Si mandó contraseña nueva, actualizar también el hash
if (!empty($nueva_password)) {
    $password_hash = password_hash($nueva_password, PASSWORD_BCRYPT);
    $stmt = $conexion->prepare(
        "UPDATE usuarios SET nombre_completo = ?, rol_id = ?, estatus = ?, password_hash = ? WHERE id = ?"
    );
    $stmt->bind_param("sisis", $nombre, $rol_id, $estatus, $password_hash, $id);
} else {
    $stmt = $conexion->prepare(
        "UPDATE usuarios SET nombre_completo = ?, rol_id = ?, estatus = ? WHERE id = ?"
    );
    $stmt->bind_param("siii", $nombre, $rol_id, $estatus, $id);
}

if ($stmt->execute()) {
    // Registrar en auditoría
    $admin_id = $_SESSION['user_id'];
    $roles_map = [1 => 'Administrador', 2 => 'Técnico de Sistemas', 3 => 'Usuario de Consulta', 4 => 'Auditor / Supervisor'];
    $rol_nombre = $roles_map[$rol_id] ?? 'Desconocido';
    $detalle  = "Administrador editó al usuario ID $id. Nuevo rol de: $rol_nombre, Estatus: $estatus.";
    $log = $conexion->prepare("INSERT INTO logs_auditoria (usuario_id, accion, detalles) VALUES (?, 'EDITAR_USUARIO', ?)");
    $log->bind_param("is", $admin_id, $detalle);
    $log->execute();

    echo json_encode(['success' => true, 'message' => 'Usuario actualizado correctamente.']);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al actualizar: ' . $conexion->error]);
}
?>
