<?php
$required_role_max = 2; // Solo Admin (1) o Tecnico (2)
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

require_once 'validator_ip.php';
$validacion = ValidatorIP::validarAsignacionIP($conexion, $ip_asignada, $Departamento);
if (!$validacion['success']) {
    echo json_encode(['success' => false, 'error' => $validacion['error']]);
    exit;
}
$ip_final = $validacion['ip'] ?? null;

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

    // Registro en auditoría
    $accion_log = "ALTA_EQUIPO";
    $detalle_log = "Equipo agregado a inventario: $nombre ($marca $modelo)";
    $sql_log = "INSERT INTO logs_auditoria (usuario_id, accion, equipo_id, detalles) VALUES (?, ?, ?, ?)";
    $stmt_log = $conexion->prepare($sql_log);
    $stmt_log->bind_param("isis", $_SESSION['user_id'], $accion_log, $nuevo_id, $detalle_log);
    $stmt_log->execute();

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