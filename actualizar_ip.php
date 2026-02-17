<?php

<<<<<<< HEAD
// Detectar IP automáticamente
$output = shell_exec('ipconfig');
preg_match_all('/IPv4[^\d]+([\d\.]+)/', $output, $matches);
// Filtrar IPs que no sean 127.0.0.1
$nueva_ip = "127.0.0.1";
foreach ($matches[1] as $ip) {
    if ($ip !== "127.0.0.1") {
        $nueva_ip = $ip;
        break;
    }
}
=======
$nueva_ip = "192.168.1.115";
>>>>>>> 8222a9009eb8dd7f241824b65460a05ae4cfb87b

$is_cli = true;
require_once 'db.php';


echo "Actualizando URLs con IP: $nueva_ip\n\n";

#Actualiza la IP de la base de datos
$sql = "UPDATE equipos_mycard SET redireccion = CONCAT('http://$nueva_ip/Inventario_MyCard/InventarioPCs.html?id=', id)";

if ($conexion->query($sql)) {
    echo "URLs actualizadas correctamente\n\n";
} else {
    echo "Error: " . $conexion->error . "\n";
    exit(1);
}
#Muestra las nuevas URLs
echo "Nuevas URLs:\n";
echo "------------\n";

$resultado = $conexion->query("SELECT id, nombre, redireccion FROM equipos_mycard");

while ($fila = $resultado->fetch_assoc()) {
    echo "ID " . $fila['id'] . ": " . $fila['nombre'] . "\n";
    echo "URL: " . $fila['redireccion'] . "\n\n";
}

$conexion->close();

echo "Proceso completado.\n";
echo "Siguiente paso: python codigoQR.py\n";
?>