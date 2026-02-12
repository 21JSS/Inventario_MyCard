<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Configuración de la base de datos
$host = "localhost";
$usuario = "root";
$contraseña = "";
$base_de_datos = "equipos_mycard";

// Crear conexión
$conexion = new mysqli($host, $usuario, $contraseña, $base_de_datos);

// Verificar conexión
if ($conexion->connect_error) {
    echo json_encode([
        'success' => false,
        'error' => 'Error de conexión: ' . $conexion->connect_error
    ]);
    exit;
}

// Configurar charset
$conexion->set_charset("utf8");

try {
    // Obtener todos los equipos
    $sql = "SELECT id, nombre, tipo, marca, modelo FROM equipos_pc ORDER BY id ASC";
    $resultado = $conexion->query($sql);
    
    if (!$resultado) {
        throw new Exception('Error en la consulta: ' . $conexion->error);
    }
    
    $equipos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $equipos[] = $fila;
    }
    
    // Calcular estadísticas
    $total_equipos = count($equipos);
    
    // Contar por estado (asumiendo que tienes una columna 'estado')
    $sql_stats = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) as disponibles,
                    SUM(CASE WHEN estado = 'en_uso' THEN 1 ELSE 0 END) as en_uso,
                    SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as ocupadas
                  FROM equipos_pc";
    
    $resultado_stats = $conexion->query($sql_stats);
    
    if ($resultado_stats) {
        $stats = $resultado_stats->fetch_assoc();
    } else {
        // Si no existe la columna estado, usar valores por defecto
        $stats = [
            'total' => $total_equipos,
            'disponibles' => 0,
            'en_uso' => 0,
            'ocupadas' => 0
        ];
    }
    
    // Preparar respuesta
    $response = [
        'success' => true,
        'data' => $equipos,
        'stats' => [
            'total_equipos' => (int)$stats['total'],
            'total_disponibles' => (int)$stats['disponibles'],
            'total_en_uso' => (int)$stats['en_uso'],
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

// Cerrar conexión
$conexion->close();
?>
