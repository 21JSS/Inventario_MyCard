<?php
header('Content-Type: application/json');
require_once 'db.php';

$area_id = $_GET['area'] ?? null;
$validar_ip = $_GET['validar_ip'] ?? null;

if (!$area_id) {
    echo json_encode(['error' => 'Falta el área']);
    exit;
}

// Obtener el departamento al que pertenece el área, y el rango de IPs del departamento
$sql = "SELECT a.id AS area_id, a.nombre AS area_nombre, 
        d.id AS depto_id, d.nombre AS depto_nombre, d.ip_inicio, d.ip_fin 
        FROM areas a 
        JOIN departamentos d ON a.departamento_id = d.id 
        WHERE a.id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $area_id);
$stmt->execute();
$info = $stmt->get_result()->fetch_assoc();

if (!$info) {
    echo json_encode(['error' => 'Área no encontrada']);
    exit;
}

// Obtener todas las IPs ya usadas en este departamento (todas sus áreas comparten el rango)
$sql2 = "SELECT ip_asignada FROM equipos_pc WHERE departamento = ? AND ip_asignada IS NOT NULL";
$stmt2 = $conexion->prepare($sql2);
$stmt2->bind_param("i", $info['depto_id']);
$stmt2->execute();
$resultado = $stmt2->get_result();

$ips_usadas = [];
while ($fila = $resultado->fetch_assoc()) {
    $ips_usadas[] = $fila['ip_asignada'];
}

// Calcular la siguiente IP disponible dentro del rango del departamento
$ip_inicio = ip2long($info['ip_inicio']);
$ip_fin = ip2long($info['ip_fin']);
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
        // Buscar a qué departamento pertenece esta IP
        $sql3 = "SELECT nombre, ip_inicio, ip_fin FROM departamentos 
                 WHERE INET_ATON(ip_inicio) <= INET_ATON(?) 
                 AND INET_ATON(ip_fin) >= INET_ATON(?)";
        $stmt3 = $conexion->prepare($sql3);
        $stmt3->bind_param("ss", $validar_ip, $validar_ip);
        $stmt3->execute();
        $otroDepto = $stmt3->get_result()->fetch_assoc();
        if ($otroDepto) {
            $area_pertenece = $otroDepto['nombre'];
            $rango_pertenece = $otroDepto['ip_inicio'] . ' - ' . $otroDepto['ip_fin'];
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
    'area'          => $info['area_nombre'],
    'rango'         => $info['ip_inicio'] . ' - ' . $info['ip_fin'],
    'ips_usadas'    => count($ips_usadas),
    'validacion'    => $validacion,
]);

$conexion->close();
?>
