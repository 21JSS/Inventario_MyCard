<?php

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

$conexion = new mysqli("localhost", "root", "", "equipos_mycard");

if ($conexion->connect_error) {
    die("Error de conexion: " . $conexion->connect_error);
}

echo "Actualizando URLs con IP: $nueva_ip\n\n";

#Actualiza la IP de la base de datos
$sql = "UPDATE equipos_pc SET redireccion = CONCAT('http://$nueva_ip/Inventario_MyCard/InventarioPCs.html?id=', id)";

if ($conexion->query($sql)) {
    echo "URLs actualizadas correctamente\n\n";
} else {
    echo "Error: " . $conexion->error . "\n";
    exit(1);
}
#Muestra las nuevas URLs
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