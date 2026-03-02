<?php
function getServerIP() {
    $output = shell_exec('ipconfig');
    preg_match_all('/IPv4[^\d]+([\d\.]+)/', $output, $matches);
    
    // IP por defecto si falla la detección
    $nueva_ip = "127.0.0.1"; 
    
    if (isset($matches[1])) {
        foreach ($matches[1] as $ip) {
            $ip = trim($ip);
            // Ignorar localhost
            if ($ip !== "127.0.0.1" && strpos($ip, "192.168.56.") === false) {
                $nueva_ip = $ip;
                // Si encontramos la IP de la red local común (192.168.1.x), la preferimos y paramos
                if (strpos($ip, "192.168.1.") !== false) {
                    break;
                }
            }
        }
    }
    return $nueva_ip;
}
?>
