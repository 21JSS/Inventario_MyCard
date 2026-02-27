<?php
/**
 * Flujo:
 *   Navegador → proxy_bloqueo.php (XAMPP) → Flask 192.168.1.79:5050 → LockWorkStation
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}


$input = json_decode(file_get_contents('php://input'), true) ?? [];
$ip     = trim($input['ip'] ?? '');
$nombre = trim($input['nombre'] ?? '');

if (empty($ip)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'IP no proporcionada']);
    exit;
}


if (!filter_var($ip, FILTER_VALIDATE_IP)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'IP no válida: ' . $ip]);
    exit;
}


$port    = 5050;
$url     = "http://{$ip}:{$port}/bloquear";
$payload = json_encode(['action' => 'lock', 'source' => 'MyCard-Inventario', 'equipo' => $nombre]);


$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 6,          // 6 segundos de timeout
    CURLOPT_CONNECTTIMEOUT => 4,
]);

$response    = curl_exec($ch);
$httpCode    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError   = curl_error($ch);
curl_close($ch);


if ($response === false || !empty($curlError)) {
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'error'   => "No se pudo conectar con el agente en {$ip}:{$port}. Verifica que esté corriendo. ({$curlError})"
    ]);
    exit;
}


$data = json_decode($response, true);

if ($httpCode >= 200 && $httpCode < 300 && isset($data['success']) && $data['success']) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => $data['message'] ?? 'Pantalla bloqueada']);
} else {
    http_response_code(502);
    $errorMsg = $data['error'] ?? "El agente respondió con código {$httpCode}";
    echo json_encode(['success' => false, 'error' => $errorMsg]);
}
