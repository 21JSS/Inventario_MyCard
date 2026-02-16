<?php
// Configuración de la base de datos
$host = "localhost";
$usuario = "root";
$password = "";
$base_de_datos = "inventario_mycard";

// Crear la conexión
$conexion = new mysqli($host, $usuario, $password, $base_de_datos);

// Verificar si hubo un error
if ($conexion->connect_error) {
    // Si es una petición API, devolver JSON, si no, un mensaje simple
    if (strpos($_SERVER['PHP_SELF'], '.php') !== false && !isset($is_cli)) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Error de conexión: ' . $conexion->connect_error]);
        exit;
    } else {
        die("Error de conexión: " . $conexion->connect_error);
    }
}

// Configurar charset a utf8mb4
$conexion->set_charset("utf8mb4");
?>
