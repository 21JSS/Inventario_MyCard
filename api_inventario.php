<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');


require_once 'db.php';


try {
    #hace la consulta a la base de datos
    $sql = "SELECT id, nombre, tipo, marca, modelo, descripcion, estado FROM equipos_mycard ORDER BY id ASC";
    $resultado = $conexion->query($sql);
    
    if (!$resultado) {
        throw new Exception('Error en la consulta: ' . $conexion->error);
    }
    
    $equipos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $equipos[] = $fila;
    }
    
    
    $total_equipos = count($equipos);
    // Obtiene estadísticas 
    $stats = [];
    
    $result = $conexion->query("SELECT COUNT(*) as total FROM equipos_mycard");
    $stats['total'] = $result->fetch_assoc()['total'];
    
    $result = $conexion->query("SELECT COUNT(*) as disponibles FROM equipos_mycard WHERE estado = 'disponible'");
    $stats['disponibles'] = $result->fetch_assoc()['disponibles'];
    
    $result = $conexion->query("SELECT COUNT(*) as ocupadas FROM equipos_mycard WHERE estado = 'ocupada'");
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
