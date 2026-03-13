<?php
session_start();
header('Content-type:application/json');
header('Access-Control-Allow-Origin:*');

require_once 'db.php';

$admin_user = "mycard";
$admin_pass = "mc2026";

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if ($username === $admin_user && $password === $admin_pass) {
    $_SESSION['admin_logged'] = true;
    echo json_encode(['success'=>true]);
} else {
    echo json_encode(['success'=>false, 'error' => 'Credenciales incorrectas ☠️']);
}
    
    // es un paso temporal que al poner las credenciales correctas genera un pase oficial para entrar al sistema
?>
