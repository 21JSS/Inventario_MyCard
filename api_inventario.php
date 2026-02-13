<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
#Define que va a devolver datos en formato JSON
#se conecta a la base de datos

$host = "localhost";
$usuario = "root";
$contraseña = "";
$base_de_datos = "equipos_mycard";


$conexion = new mysqli($host, $usuario, $contraseña, $base_de_datos);

#si hay error al conectar a la base de datos
if ($conexion->connect_error) {
    echo json_encode([
        'success' => false,
        'error' => 'No se pudo conectar con la base de datos. Asegúrate de que el servidor esté corriendo.',
        'error_details' => $conexion->connect_error
    ], JSON_UNESCAPED_UNICODE);
    exit;
}


$conexion->set_charset("utf8mb4");

try {
    #hace la consulta a la base de datos
    $sql = "SELECT id, nombre, tipo, marca, modelo, estado FROM equipos_pc ORDER BY id ASC";
    $resultado = $conexion->query($sql);
    
    if (!$resultado) {
        throw new Exception('Error en la consulta: ' . $conexion->error);
    }
    
    $equipos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $equipos[] = $fila;
    }
    
    
    $total_equipos = count($equipos);
    // Obtener estadísticas
    $stats = [];
    
    $result = $conexion->query("SELECT COUNT(*) as total FROM equipos_pc");
    $stats['total'] = $result->fetch_assoc()['total'];
    
    $result = $conexion->query("SELECT COUNT(*) as disponibles FROM equipos_pc WHERE estado = 'disponible'");
    $stats['disponibles'] = $result->fetch_assoc()['disponibles'];
    
    $result = $conexion->query("SELECT COUNT(*) as ocupadas FROM equipos_pc WHERE estado = 'ocupada'");
    $stats['ocupadas'] = $result->fetch_assoc()['ocupadas'];
    
    $response = [
        'success' => true,
        'data' => $equipos,
        'stats' => [
            'total_equipos' => (int)$stats['total'],
            'total_disponibles' => (int)$stats['disponibles'],
            'total_ocupadas' => (int)$stats['ocupadas']
        ]
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conexion->close();
?>
