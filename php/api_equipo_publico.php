<?php
// No requiere check_session.php porque es PÚBLICO para el visor QR
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    echo json_encode(['success' => false, 'error' => 'ID inválido']);
    exit;
}

try {
    // Consulta para un sólo equipo
    $sql = "SELECT e.id, e.nombre, e.tipo, e.marca, e.modelo, e.encargado, 
            d.nombre AS departamento, d.id AS departamento_id,
            a.nombre AS area, e.descripcion_equipo, 
            e.ip_asignada, e.estado, e.nota_estado,
            e.fecha_creacion
            FROM equipos_pc e 
            LEFT JOIN departamentos d ON e.departamento = d.id 
            LEFT JOIN areas a ON e.area = a.id
            WHERE e.id = ?";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'Equipo no encontrado en la base de datos']);
        exit;
    }

    $equipo = $resultado->fetch_assoc();

    $response = [
        'success' => true,
        'data' => $equipo
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
