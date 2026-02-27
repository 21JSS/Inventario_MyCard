<?php
$host = "localhost";
$usuario = "root";
$password = "";
$base_de_datos = "inventario_mycard";

$conexion = new mysqli($host, $usuario, $password, $base_de_datos);

if ($conexion->connect_error) {
    
    if (strpos($_SERVER['PHP_SELF'], '.php') !== false && !isset($is_cli)) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Error de conexión: ' . $conexion->connect_error]);
        exit;
    } else {
        die("Error de conexión: " . $conexion->connect_error);
    }
}

$conexion->set_charset("utf8mb4");
?>