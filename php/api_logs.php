<?php
$required_role_max = 1; 
$allow_auditor = true;
require_once 'check_session.php';
header('Content-Type: application/json');

require_once 'db.php';

try {
    $sql = "SELECT l.id, u.username, l.accion, l.detalles, l.fecha 
            FROM logs_auditoria l 
            JOIN usuarios u ON l.usuario_id = u.id 
            ORDER BY l.fecha DESC LIMIT 100";
    
    $result = $conexion->query($sql);
    
    $logs = [];
    while ($row = $result->fetch_assoc()) {
        $logs[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $logs]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
