<?php

$nueva_ip = "192.168.1.115"; 

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
