<?php
//  verificar las URLs en la base de datos
$is_cli = true;
require_once 'db.php';


echo "URLs actuales en la base de datos:\n";
echo "==================================\n\n";

$resultado = $conexion->query("SELECT id, nombre, redireccion FROM equipos_pc ORDER BY id");

while ($fila = $resultado->fetch_assoc()) {
    echo "ID: " . $fila['id'] . "\n";
    echo "Nombre: " . $fila['nombre'] . "\n";
    echo "URL: " . $fila['redireccion'] . "\n";
    echo "---\n";
}

$conexion->close();
?>