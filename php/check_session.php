<?php
session_start();

// Si no existe la variable de sesión, denegamos el acceso
if (!isset($_SESSION['admin_logged']) || $_SESSION['admin_logged'] !== true) {
    header('Content-Type: application/json');//manda un formato de error 
    http_response_code(401); // No autorizado
    echo json_encode([
        'success' => false, 
        'error' => 'Acceso denegado. Debes iniciar sesión para realizar esta acción.'
    ]);
    exit;
}

// si no existe la variable de sesion, no se puede acceder al sistema 
// es un paso temporal que al poner las credenciales correctas genera un pase oficial para entrar al sistema
?>