<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

define('SECRET_TOKEN', 'mycard_2025');

define('AGENTE_PUERTO', 5050);

if (!isset($POST['ip']) || empty($_POST['ip'])) {
    echo json_encode(["status" => "error", "mensaje" => "IP no proporcionada"]);
    exit;
}

$ip = filter_var($_POST['ip'], FILTER_VALIDATE_IP);

if (!$ip) {
    echo json_encode(["status" => "error", "mensaje" => "IP invalida"]);
    exit;
}

$url = "http://{$ip}:" . AGENTE_PUERTO . "/bloquear";

$payload = json_encode([
    "token" => SECRET_TOKEN
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);

$response = curl_exec($ch);
$httpCode = curl_getInfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);


if ($error) {
    echo json_encode([
        "status" => "error",
        "mensaje" => "No se pudo conectar con el equipo.",
        "detalle" => $error
    ]);
    exit;
}


if($httpCode === 403){
    echo json_encode(["status" => "error", "mensaje" => "Token de seguridad invalido"]);
    exit;
}

echo $response;
?>