<?php
session_start();
header('Content-type:application/json');
header('Access-Control-Allow-Origin:*');

require_once 'db.php';

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'error' => 'Faltan credenciales']);
    exit;
}

$sql = "SELECT id, username, password_hash, rol_id, estatus FROM usuarios WHERE username = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    
    if ((int)$user['estatus'] !== 1) {
        echo json_encode(['success' => false, 'error' => 'Usuario suspendido']);
        exit;
    }

    if (password_verify($password, $user['password_hash'])) {
        // Autenticación correcta
        $_SESSION['admin_logged'] = true; // Variable retrocompatibilidad
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['rol_id'] = (int)$user['rol_id'];
        
        // Opcional: Registrar Log de Login
        require_once 'validator_ip.php'; // Usa la misma convención
        $sql_log = "INSERT INTO logs_auditoria (usuario_id, accion, detalles) VALUES (?, 'LOGIN', 'Inicio de sesión en el sistema')";
        $stmt_log = $conexion->prepare($sql_log);
        $stmt_log->bind_param("i", $user['id']);
        $stmt_log->execute();

        echo json_encode(['success' => true, 'rol_id' => $user['rol_id']]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Contraseña incorrecta']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
}
?>
