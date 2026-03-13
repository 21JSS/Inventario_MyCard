<?php
header('Content-Type: application/json');
require_once 'db.php';

$depto_id = $_GET['departamento_id'] ?? null;

if (!$depto_id) {
    echo json_encode(['error' => 'Falta el departamento']);
    exit;
}

// Obtener el rango de IPs del departamento
$sql = "SELECT id, nombre, ip_inicio, ip_fin FROM departamentos WHERE id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $depto_id);
$stmt->execute();
$depto = $stmt->get_result()->fetch_assoc();

if (!$depto) {
    echo json_encode(['error' => 'Departamento no encontrado']);
    exit;
}

// Obtener todas las IPs ya usadas en este departamento
$sql2 = "SELECT ip_asignada FROM equipos_pc WHERE departamento = ? AND ip_asignada IS NOT NULL";
$stmt2 = $conexion->prepare($sql2);
$stmt2->bind_param("i", $depto_id);
$stmt2->execute();
$resultado = $stmt2->get_result();

$ips_usadas = [];
while ($fila = $resultado->fetch_assoc()) {
    $ips_usadas[] = $fila['ip_asignada'];
}

// Calcular la siguiente IP disponible dentro del rango
$ip_inicio = ip2long($depto['ip_inicio']);
$ip_fin = ip2long($depto['ip_fin']);
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
    'departamento'  => $depto['nombre'],
    'rango'         => $depto['ip_inicio'] . ' - ' . $depto['ip_fin'],
    'ips_usadas'    => count($ips_usadas),
]);

$conexion->close();
?>
