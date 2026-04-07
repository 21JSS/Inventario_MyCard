<?php
require_once 'check_session.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';


$nombre = $_POST['nombre'] ?? '';
$tipo = $_POST['tipo'] ?? '';
$marca = $_POST['marca'] ?? '';
$modelo = $_POST['modelo'] ?? '';
$Departamento = $_POST['Departamento'] ?? '';
$area = $_POST['area'] ?? '';
$descripcion_equipo = $_POST['descripcion_equipo'] ?? '';
$encargado = $_POST['encargado'] ?? '';
$estado = $_POST['estado'] ?? 1;
$nota = $_POST['nota'] ?? null;
$ip_asignada = $_POST['ip_asignada'] ?? null;


if (empty($nombre) || empty($tipo) || empty($marca) || empty($modelo) || empty($descripcion_equipo) || empty($encargado) || empty($Departamento) || empty($area)) {
    echo json_encode(['success' => false, 'error' => 'Todos los campos son obligatorios, incluyendo descripción, encargado, departamento y area']);
    exit;
}

$ip_final = (!empty($ip_asignada)) ? $ip_asignada : null;

// Validar que la IP no esté repetida
if ($ip_final !== null) {
    $sql_check = "SELECT id FROM equipos_pc WHERE ip_asignada = ?";
    $stmt_check = $conexion->prepare($sql_check);
    $stmt_check->bind_param("s", $ip_final);
    $stmt_check->execute();
    $resultado_check = $stmt_check->get_result();

    if ($resultado_check->num_rows > 0) {
        echo json_encode(['success' => false, 'error' => 'La IP ' . $ip_final . ' ya está asignada a otro equipo']);
        exit;
    }

    // Validar que la IP esté dentro del rango del departamento
    $sql_rango = "SELECT ip_inicio, ip_fin, nombre FROM departamentos WHERE id = ?";
    $stmt_rango = $conexion->prepare($sql_rango);
    $stmt_rango->bind_param("i", $Departamento);
    $stmt_rango->execute();
    $rango = $stmt_rango->get_result()->fetch_assoc();

    if ($rango) {
        $ip_num = ip2long($ip_final);
        $rango_inicio = ip2long($rango['ip_inicio']);
        $rango_fin = ip2long($rango['ip_fin']);

        if ($ip_num < $rango_inicio || $ip_num > $rango_fin) {
            echo json_encode(['success' => false, 'error' => 'La IP ' . $ip_final . ' no pertenece al rango del departamento ' . $rango['nombre'] . ' (' . $rango['ip_inicio'] . ' - ' . $rango['ip_fin'] . ')']);
            exit;
        }
    }
}


$sql = "INSERT INTO equipos_pc (nombre, tipo, marca, modelo, encargado, departamento, area, descripcion_equipo, ip_asignada, estado, nota_estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("sssssssssss", $nombre, $tipo, $marca, $modelo, $encargado, $Departamento, $area, $descripcion_equipo, $ip_final, $estado, $nota);

if ($stmt->execute()) {  
    $nuevo_id = $stmt->insert_id; 
    require_once 'utils_ip.php';
    $ip = getServerIP(); 
    $url = "http://$ip/Inventario_MyCard/html/index.html?id=$nuevo_id";

    
    $sql_update = "UPDATE equipos_pc SET redireccion = ? WHERE id = ?"; 
    $stmt_update = $conexion->prepare($sql_update);
    $stmt_update->bind_param("si", $url, $nuevo_id);
    $stmt_update->execute(); 

    // código QR en segundo plano para evitar esperas
    $python_path = "python";
    $script_path = "../python/code_qr.py";
    // Pasamos el ID y la URL para que el script de Python sea más rápido
    $command = "start /B $python_path $script_path $nuevo_id \"$url\"";
    pclose(popen($command, "r"));

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