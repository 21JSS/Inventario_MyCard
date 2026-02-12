<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');


$host = "localhost";
$usuario = "root";
$contraseña = "";
$base_de_datos = "equipos_mycard";


$conexion = new mysqli($host, $usuario, $contraseña, $base_de_datos);


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
    
    $sql_stats = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) as disponibles,
                    SUM(CASE WHEN estado = 'en_uso' THEN 1 ELSE 0 END) as en_uso
                  FROM equipos_pc";
    
    $resultado_stats = $conexion->query($sql_stats);
    
    if ($resultado_stats) {
        $stats = $resultado_stats->fetch_assoc();
    } else {
        $stats = [
            'total' => $total_equipos,
            'disponibles' => 0,
            'en_uso' => 0
        ];
    }
    
    $response = [
        'success' => true,
        'data' => $equipos,
        'stats' => [
            'total_equipos' => (int)$stats['total'],
            'total_disponibles' => (int)$stats['disponibles'],
            'total_en_uso' => (int)$stats['en_uso']
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
