<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');


require_once 'db.php';


try {
    #hace la consulta a la base de datos
    $sql = "SELECT id, nombre, tipo, marca, modelo, encargado, departamento, area, descripcion_equipo, estado, nota_estado FROM equipos_pc ORDER BY id ASC";
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
        if ($e['estado'] === 'disponible') {
            $total_disponibles++;
        } elseif ($e['estado'] === 'ocupada') {
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