<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';


$nombre = $_POST['nombre'] ?? '';
$tipo = $_POST['tipo'] ?? '';
$marca = $_POST['marca'] ?? '';
$modelo = $_POST['modelo'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$estado = $_POST['estado'] ?? 'disponible';


if (empty($nombre) || empty($tipo) || empty($marca) || empty($modelo)) {
    echo json_encode(['success' => false, 'error' => 'Todos los campos son obligatorios']);
    exit;
}

$sql = "INSERT INTO equipos_mycard (nombre, tipo, marca, modelo, descripcion, estado) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("ssssss", $nombre, $tipo, $marca, $modelo, $descripcion, $estado);

if ($stmt->execute()) {
    $nuevo_id = $stmt->insert_id;
    
    $ip = "192.168.1.115"; 
    $url = "http://$ip/Inventario_MyCard/InventarioPCs.html?id=$nuevo_id";
    
    #Actualizar la URL 
    $sql_update = "UPDATE equipos_mycard SET redireccion = ? WHERE id = ?";
    $stmt_update = $conexion->prepare($sql_update);
    $stmt_update->bind_param("si", $url, $nuevo_id); 
    $stmt_update->execute();
    
    // Generar código QR automáticamente
    $python_path = "python";
    $script_path = "generar_qr_unico.py";
    $command = "$python_path $script_path $nuevo_id 2>&1";
    $output = shell_exec($command);
    
    echo json_encode([
        'success' => true,
        'message' => 'Equipo agregado exitosamente',
        'id' => $nuevo_id
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al insertar el equipo en la base de datos']);
}

$conexion->close();
?>
