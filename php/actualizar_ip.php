<?php


$output = shell_exec('ipconfig');
preg_match_all('/IPv4[^\d]+([\d\.]+)/', $output, $matches);
// Filtrar IPs que no sean 127.0.0.1
$nueva_ip = "127.0.0.1";
foreach ($matches[1] as $ip) {
    $ip = trim($ip);
    if ($ip !== "127.0.0.1" && strpos($ip, "192.168.56.") === false) {
        $nueva_ip = $ip;
        // Si encontramos la IP de la red local común (192.168.1.x), la preferimos y paramos
        if (strpos($ip, "192.168.1.") !== false) {
            break;
        }
    }
}

$is_cli = true;
require_once 'db.php';

 
echo "Actualizando URLs con IP: $nueva_ip\n\n";


$sql = "UPDATE equipos_pc SET redireccion = CONCAT('https://$nueva_ip/Inventario_MyCard/html/index.html?id=', id)";

if ($conexion->query($sql)) {
    echo "URLs actualizadas correctamente\n\n";
} else {
    echo "Error: " . $conexion->error . "\n";
    exit(1);
}

echo "Nuevas URLs:\n";
echo "------------\n";

$resultado = $conexion->query("SELECT id, nombre, redireccion FROM equipos_pc");

while ($fila = $resultado->fetch_assoc()) {
    echo "ID " . $fila['id'] . ": " . $fila['nombre'] . "\n";
    echo "URL: " . $fila['redireccion'] . "\n\n";
}

$conexion->close();

echo "Proceso completado.\n";
echo "Siguiente paso: python codigoQR.py\n";
?>