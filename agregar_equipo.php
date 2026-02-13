<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
#Conectar a la base de datos
$conexion = new mysqli("localhost", "root", "", "equipos_mycard");

if ($conexion->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']);
    exit;
}

$nombre = $_POST['nombre'] ?? '';
$tipo = $_POST['tipo'] ?? '';
$marca = $_POST['marca'] ?? '';
$modelo = $_POST['modelo'] ?? '';
$estado = $_POST['estado'] ?? 'disponible';

#Validar  los campos completos
if (empty($nombre) || empty($tipo) || empty($marca) || empty($modelo)) {
    echo json_encode(['success' => false, 'error' => 'Todos los campos son obligatorios']);
    exit;
}

#Insertar equipo 
$sql = "INSERT INTO equipos_pc (nombre, tipo, marca, modelo, estado) VALUES (?, ?, ?, ?, ?)";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("sssss", $nombre, $tipo, $marca, $modelo, $estado);

if ($stmt->execute()) {
    $nuevo_id = $stmt->insert_id;
    
    $ip = " 192.168.1.221"; // Cambiar si tu IP es diferente
    $url = "http://$ip/Inventario_MyCard/InventarioPCs.html?id=$nuevo_id";
    
    #Actualizar la URL 
    $sql_update = "UPDATE equipos_pc SET redireccion = ? WHERE id = ?";
    $stmt_update = $conexion->prepare($sql_update);
    $stmt_update->bind_param("si", $url, $nuevo_id); 
    $stmt_update->execute();
    
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
