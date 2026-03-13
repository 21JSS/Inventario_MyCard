<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');


require_once 'db.php';


try {
    #hace la consulta a la base de datos
    $sql = "SELECT e.id, e.nombre, e.tipo, e.marca, e.modelo, e.encargado, 
            d.nombre AS departamento, a.nombre AS area, e.descripcion_equipo, 
            e.ip_asignada, e.estado, e.nota_estado 
            FROM equipos_pc e 
            LEFT JOIN departamentos d ON e.departamento = d.id 
            LEFT JOIN areas a ON e.area = a.id 
            ORDER BY e.id ASC";
    $resultado = $conexion->query($sql);

    if (!$resultado) { 
        throw new Exception('Error en la consulta: ' . $conexion->error); 
    }

    $equipos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $equipos[] = $fila;
    }


    $total_equipos = count($equipos);
    $total_disponibles = 0;
    $total_ocupadas = 0;

    foreach ($equipos as $e) {
        if ((int)$e['estado'] === 1) {
            $total_disponibles++;
        } elseif ((int)$e['estado'] === 0) {
            $total_ocupadas++;
        }
    }

    $response = [
        'success' => true,
        'data' => $equipos,
        'stats' => [
            'total_equipos' => $total_equipos,
            'total_disponibles' => $total_disponibles,
            'total_ocupadas' => $total_ocupadas
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
