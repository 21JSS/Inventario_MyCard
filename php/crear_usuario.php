<?php
// Solo Admin (1) puede crear usuarios
$required_role_max = 1;
require_once 'check_session.php';
require_once 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$datos = json_decode(file_get_contents('php://input'), true);

$nombre    = trim($datos['nombre_completo'] ?? '');
$username  = trim($datos['username'] ?? '');
$password  = trim($datos['password'] ?? '');
$rol_id    = (int)($datos['rol_id'] ?? 0);

if (empty($nombre) || empty($username) || empty($password) || $rol_id < 1) {
    echo json_encode(['success' => false, 'error' => 'Todos los campos son requeridos.']);
    exit;
}

// Verificar que el username no exista ya
$check = $conexion->prepare("SELECT id FROM usuarios WHERE username = ?");
$check->bind_param("s", $username);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    echo json_encode(['success' => false, 'error' => 'Ese nombre de usuario ya está en uso.']);
    exit;
}

// Encriptar contraseña con Bcrypt
$password_hash = password_hash($password, PASSWORD_BCRYPT);
$estatus = 1;

$stmt = $conexion->prepare(
    "INSERT INTO usuarios (nombre_completo, username, password_hash, rol_id, estatus) VALUES (?, ?, ?, ?, ?)"
);
$stmt->bind_param("sssii", $nombre, $username, $password_hash, $rol_id, $estatus);

if ($stmt->execute()) {
    $nuevo_id = $stmt->insert_id;

    // Registrar en auditoría
    $admin_id = $_SESSION['user_id'];
    $roles_map = [1 => 'Administrador', 2 => 'Técnico de Sistemas', 3 => 'Usuario de Consulta', 4 => 'Auditor / Supervisor'];
    $rol_nombre = $roles_map[$rol_id] ?? 'Desconocido';
    $detalle  = "Administrador creó al usuario '$username' con rol de: $rol_nombre.";
    $log = $conexion->prepare("INSERT INTO logs_auditoria (usuario_id, accion, detalles) VALUES (?, 'CREAR_USUARIO', ?)");
    $log->bind_param("is", $admin_id, $detalle);
    $log->execute();

    echo json_encode(['success' => true, 'message' => 'Usuario creado exitosamente.', 'id' => $nuevo_id]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al crear usuario: ' . $conexion->error]);
}
?>
