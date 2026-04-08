<?php
/**
 * Clase estática helper para la modularización de validaciones backend.
 * Abstrae la lógica repetitiva de comprobación de IPs en la base de datos.
 */
class ValidatorIP {

    /**
     * Valida si la IP proporcionada está disponible y si pertenece al rango correcto.
     * Retorna un arreglo asociativo con 'success' y un 'error' si falla.
     * O retorna 'success' => true si todo es correcto.
     */
    public static function validarAsignacionIP($conexion, $ip_asignada, $departamento_id, $equipo_ignorado_id = null) {
        $ip_final = (!empty($ip_asignada)) ? $ip_asignada : null;

        if ($ip_final === null) {
            return ['success' => true]; // Si no se asigna IP, no hay conflicto.
        }

        // 1. Validar que la IP no esté repetida (ignorando el equipo actual si existe)
        $sql_check = ($equipo_ignorado_id) 
            ? "SELECT id FROM equipos_pc WHERE ip_asignada = ? AND id != ?"
            : "SELECT id FROM equipos_pc WHERE ip_asignada = ?";
        
        $stmt_check = $conexion->prepare($sql_check);
        if ($equipo_ignorado_id) {
            $stmt_check->bind_param("si", $ip_final, $equipo_ignorado_id);
        } else {
            $stmt_check->bind_param("s", $ip_final);
        }
        $stmt_check->execute();
        $resultado_check = $stmt_check->get_result();

        if ($resultado_check->num_rows > 0) {
            return ['success' => false, 'error' => 'La IP ' . $ip_final . ' ya está asignada a otro equipo'];
        }

        // 2. Validar que la IP esté dentro del rango del departamento pertinente
        $sql_rango = "SELECT ip_inicio, ip_fin, nombre FROM departamentos WHERE id = ?";
        $stmt_rango = $conexion->prepare($sql_rango);
        $stmt_rango->bind_param("i", $departamento_id);
        $stmt_rango->execute();
        $rango = $stmt_rango->get_result()->fetch_assoc();

        if ($rango) {
            $ip_num = ip2long($ip_final);
            $rango_inicio = ip2long($rango['ip_inicio']);
            $rango_fin = ip2long($rango['ip_fin']);

            if ($ip_num < $rango_inicio || $ip_num > $rango_fin) {
                return [
                    'success' => false, 
                    'error' => 'La IP ' . $ip_final . ' no pertenece al rango del departamento ' . $rango['nombre'] . ' (' . $rango['ip_inicio'] . ' - ' . $rango['ip_fin'] . ')'
                ];
            }
        }

        return ['success' => true, 'ip' => $ip_final];
    }
}
?>
