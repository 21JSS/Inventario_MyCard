<?php
header('Content-Type: application/json');
require_once 'db.php';

$departamento_id = $_GET['departamento_id'] ?? null;

if (!$departamento_id) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT id, nombre FROM areas WHERE departamento_id = ? ORDER BY nombre";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $departamento_id);
$stmt->execute();
$resultado = $stmt->get_result();

$areas = [];
while ($fila = $resultado->fetch_assoc()) {
    $areas[] = $fila;
}

echo json_encode($areas);
$conexion->close();
?>
