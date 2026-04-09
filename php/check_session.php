<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 1. Verificación básica de que exista un humano conectado
if (!isset($_SESSION['user_id']) || !isset($_SESSION['rol_id'])) {
    header('Content-Type: application/json');
    http_response_code(401); // No autorizado
    echo json_encode([
        'success' => false, 
        'error' => 'Acceso denegado. Sesión expirada o inválida.'
    ]);
    exit;
}

// 2. Verificación de Roles (RBAC) basándonos en Jerarquía que antes estableci
// Roles: 1 = Admin, 2 = Técnico, 3 = Consulta, 4 = Auditor
// Si el archivo solicitó permisos específicos, lo revisamos:
if (isset($required_role_max) && $_SESSION['rol_id'] > $required_role_max) {
    // Si eres rol 3 (Consulta) y el endpoint pide máximo 2 (Técnico), no te dejara entrar aquí.
    if (!isset($allow_auditor) || !($allow_auditor === true && $_SESSION['rol_id'] == 4)) {
        header('Content-Type: application/json');
        http_response_code(403); // Prohibido
        echo json_encode([
            'success' => false, 
            'error' => 'Acceso denegado. Tu perfil no tiene permisos para realizar esta acción.'
        ]);
        exit;
    }
}
?>