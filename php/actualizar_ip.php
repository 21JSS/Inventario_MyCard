<?php
require_once 'utils_ip.php';
$nueva_ip = getServerIP();

$is_cli = true;
require_once 'db.php';

echo "Actualizando URLs con IP: $nueva_ip\n\n";

// Actualizar base de datos
$sql = "UPDATE equipos_pc SET redireccion = CONCAT('http://$nueva_ip/Inventario_MyCard/html/index.html?id=', id)";

if ($conexion->query($sql)) {
    echo "URLs actualizadas en la base de datos correctamente.\n\n";
} else {
    echo "Error BD: " . $conexion->error . "\n";
    exit(1);
}

// Regenerar códigos QR (esto asegura que las etiquetas físicas funcionen con la nueva IP)
echo "Regenerando códigos QR para todos los equipos...\n";
$resultado = $conexion->query("SELECT id, redireccion FROM equipos_pc");

$python_path = "python";
$script_path = "../python/code_qr.py";

while ($fila = $resultado->fetch_assoc()) {
    $id = $fila['id'];
    $url = $fila['redireccion'];
    echo "Generando QR para ID $id... ";
    
    // script de python para cada equipo
    $command = "$python_path $script_path $id \"$url\"";
    exec($command, $out, $status);
    
    if ($status === 0) {
        echo "OK\n";
    } else {
        echo "ERROR\n";
    }
}

$conexion->close();
echo "\nProceso de actualización de IP y QR completado exitosamente.\n";
?>