<?php
// Solo Admin (1) puede eliminar usuarios
$required_role_max = 1;
require_once 'check_session.php';
require_once 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$datos = json_decode(file_get_contents('php://input'), true);
$id = (int)($datos['id'] ?? 0);

if ($id <= 0) {
    echo json_encode(['success' => false, 'error' => 'ID de usuario inválido.']);
    exit;
}

// Prevenir que el Admin se borre a sí mismo
if ($id === (int)$_SESSION['user_id']) {
    echo json_encode(['success' => false, 'error' => 'No puedes eliminar tu propia cuenta de administrador.']);
    exit;
}

// Obtener username para el log antes de borrar
$info = $conexion->prepare("SELECT username FROM usuarios WHERE id = ?");
$info->bind_param("i", $id);
$info->execute();
$info->bind_result($username_borrado);
$info->fetch();
$info->close();

$stmt = $conexion->prepare("DELETE FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    // Registrar en auditoría
    $admin_id = $_SESSION['user_id'];
    $detalle  = "Administrador eliminó permanentemente al usuario '$username_borrado' (ID: $id).";
    $log = $conexion->prepare("INSERT INTO logs_auditoria (usuario_id, accion, detalles) VALUES (?, 'ELIMINAR_USUARIO', ?)");
    $log->bind_param("is", $admin_id, $detalle);
    $log->execute();

    echo json_encode(['success' => true, 'message' => "Usuario '$username_borrado' eliminado del sistema."]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al eliminar: ' . $conexion->error]);
}
?>
