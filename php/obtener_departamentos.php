<?php
header('Content-Type: application/json');
require_once 'db.php';

$sql = "SELECT id, nombre, ip_inicio, ip_fin FROM departamentos ORDER BY id";
$resultado = $conexion->query($sql);

$departamentos = [];
while ($fila = $resultado->fetch_assoc()) {
    $departamentos[] = $fila;
}

echo json_encode($departamentos);
$conexion->close();
?>
