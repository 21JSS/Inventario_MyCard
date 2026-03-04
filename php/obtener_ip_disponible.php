<?php
header('Content-Type: application/json');
require_once 'db.php';

$area_nombre = $_GET['area'] ?? null;
$validar_ip = $_GET['validar_ip'] ?? null;

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

$validacion = null;
if ($validar_ip) {
    $ip_num = ip2long($validar_ip);
    $en_rango = ($ip_num >= $ip_inicio && $ip_num <= $ip_fin);
    $ocupada = in_array($validar_ip, $ips_usadas);

    $area_pertenece = null;
    $rango_pertenece = null;
    if (!$en_rango) {
        $sql3 = "SELECT nombre, ip_inicio, ip_fin FROM areas WHERE INET_ATON(ip_inicio) <= INET_ATON(?)
        AND INET_ATON(ip_fin) >= INET_ATON(?)";
        $stmt3 = $conexion->prepare($sql3);
        $stmt3 -> bind_param("ss", $validar_ip,$validar_ip);
        $stmt3 -> execute();
        $otraArea = $stmt3 ->get_result()->fetch_assoc();
             if ($otraArea) {
                $area_pertenece = $otraArea['nombre'];
                $rango_pertenece = $otraArea['ip_inicio'] . ' - ' .
                $otraArea['ip_fin'];
             }
     }

     $validacion = [
        'en_rango'  => $en_rango,
        'ocupada' => $ocupada,
        'area_pertenece' => $area_pertenece,
        'rango_pertenece' => $rango_pertenece,
     ];
}

echo json_encode([
    'ip_disponible' => $ip_disponible,
    'area'          => $area['nombre'],
    'rango'         => $area['ip_inicio'] . ' - ' . $area['ip_fin'],
    'ips_usadas'    => count($ips_usadas),
    'validacion'    => $validacion,
]);

$conexion->close();
?>
