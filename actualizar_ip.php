<?php

$nueva_ip = "192.168.1.115";


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
