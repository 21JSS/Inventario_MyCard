<?php
header('Content-type:application/json');
header('Access-Control-Allow-Origin:*');

require_once 'db.php';

$admin_user = "adminmycard";
$admin_pass = "mycard2026";

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if ($username === $admin_user && $password === $admin_pass) {
    echo json_encode(['success'=>true]);
}else{
    echo json_encode(['success'=>false, 'error' => 'Credenciales incorrectas ☠️']);
}
?>