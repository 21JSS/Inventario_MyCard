<?php
header('Content-Type: application/json');
require_once 'db.php';

$area_nombre = $_GET['area'] ?? null;

if (!$area_nombre) {
    echo json_encode(['error' => 'Falta el área']);
    exit;
}

// Obtener el rango de IPs del área
$sql = "SELECT nombre, ip_inicio, ip_fin FROM areas WHERE nombre = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $area_nombre);
$stmt->execute();
$area = $stmt->get_result()->fetch_assoc();

if (!$area) {
    echo json_encode(['error' => 'Área no encontrada']);
    exit;
}

// Obtener todas las IPs ya usadas en esa área
$sql2 = "SELECT ip_asignada FROM equipos_pc WHERE area = ? AND ip_asignada IS NOT NULL";
$stmt2 = $conexion->prepare($sql2);
$stmt2->bind_param("s", $area_nombre);
$stmt2->execute();
$resultado = $stmt2->get_result();

$ips_usadas = [];
while ($fila = $resultado->fetch_assoc()) {
    $ips_usadas[] = $fila['ip_asignada'];
}

// Calcular la siguiente IP disponible dentro del rango
$ip_inicio = ip2long($area['ip_inicio']);
$ip_fin = ip2long($area['ip_fin']);
$ip_disponible = null;

for ($ip = $ip_inicio; $ip <= $ip_fin; $ip++) {
    $ip_texto = long2ip($ip);
    if (!in_array($ip_texto, $ips_usadas)) {
        $ip_disponible = $ip_texto;
        break;
    }
}

echo json_encode([
    'ip_disponible' => $ip_disponible,
    'area' => $area['nombre'],
    'rango' => $area['ip_inicio'] . ' - ' . $area['ip_fin'],
    'ips_usadas' => count($ips_usadas)
]);

$conexion->close();
?>
