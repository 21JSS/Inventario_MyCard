<?php
// Permite solo Admin (1) listar usuarios
$required_role_max = 1;
require_once 'check_session.php';
require_once 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Sin JOIN a tabla roles (puede no existir). Mapeo en PHP.
$sql = "SELECT id, nombre_completo, username, rol_id, estatus FROM usuarios ORDER BY id ASC";
$result = $conexion->query($sql);

if (!$result) {
    echo json_encode(['success' => false, 'error' => 'Error al consultar usuarios: ' . $conexion->error]);
    exit;
}

$roles_nombres = [
    1 => 'Administrador',
    2 => 'Técnico de Sistemas',
    3 => 'Usuario de Consulta',
    4 => 'Auditor / Supervisor'
];

$usuarios = [];
while ($row = $result->fetch_assoc()) {
    $row['nombre_rol'] = $roles_nombres[(int)$row['rol_id']] ?? 'Desconocido';
    $usuarios[] = $row;
}

echo json_encode(['success' => true, 'data' => $usuarios]);
?>
