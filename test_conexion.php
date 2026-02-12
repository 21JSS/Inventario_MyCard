<?php
/**
 * Script de prueba de conexión a la base de datos
 * Ejecuta este archivo para verificar que la conexión funciona
 * URL: http://localhost/Inventario_MyCard/test_conexion.php
 */

// Configuración de la base de datos
$host = "localhost";
$usuario = "root";
$contraseña = "";
$base_de_datos = "equipos_mycard";

echo "<h1>🔍 Prueba de Conexión a MySQL</h1>";
echo "<hr>";

// Paso 1: Intentar conectar al servidor MySQL
echo "<h2>Paso 1: Conectando al servidor MySQL...</h2>";
$conexion = new mysqli($host, $usuario, $contraseña);

if ($conexion->connect_error) {
    echo "<p style='color: red;'>❌ ERROR: No se pudo conectar al servidor MySQL</p>";
    echo "<p>Detalles: " . $conexion->connect_error . "</p>";
    echo "<h3>Soluciones:</h3>";
    echo "<ul>";
    echo "<li>Verifica que MySQL esté corriendo en XAMPP</li>";
    echo "<li>Verifica el usuario y contraseña (por defecto: root / sin contraseña)</li>";
    echo "</ul>";
    exit;
} else {
    echo "<p style='color: green;'>✅ Conexión al servidor MySQL exitosa</p>";
}

// Paso 2: Verificar si existe la base de datos
echo "<h2>Paso 2: Verificando base de datos '$base_de_datos'...</h2>";
$resultado = $conexion->query("SHOW DATABASES LIKE '$base_de_datos'");

if ($resultado->num_rows == 0) {
    echo "<p style='color: orange;'>⚠️ ADVERTENCIA: La base de datos '$base_de_datos' no existe</p>";
    echo "<h3>Solución:</h3>";
    echo "<ul>";
    echo "<li>Ve a phpMyAdmin: <a href='http://localhost/phpmyadmin' target='_blank'>http://localhost/phpmyadmin</a></li>";
    echo "<li>Ejecuta el script SQL que está en el archivo 'crear_base_datos.sql'</li>";
    echo "</ul>";
    $conexion->close();
    exit;
} else {
    echo "<p style='color: green;'>✅ La base de datos '$base_de_datos' existe</p>";
}

// Paso 3: Conectar a la base de datos específica
echo "<h2>Paso 3: Conectando a la base de datos...</h2>";
$conexion->select_db($base_de_datos);

if ($conexion->error) {
    echo "<p style='color: red;'>❌ ERROR: No se pudo seleccionar la base de datos</p>";
    echo "<p>Detalles: " . $conexion->error . "</p>";
    exit;
} else {
    echo "<p style='color: green;'>✅ Conexión a la base de datos exitosa</p>";
}

// Paso 4: Verificar si existe la tabla
echo "<h2>Paso 4: Verificando tabla 'equipos_pc'...</h2>";
$resultado = $conexion->query("SHOW TABLES LIKE 'equipos_pc'");

if ($resultado->num_rows == 0) {
    echo "<p style='color: orange;'>⚠️ ADVERTENCIA: La tabla 'equipos_pc' no existe</p>";
    echo "<h3>Solución:</h3>";
    echo "<ul>";
    echo "<li>Ejecuta el script 'crear_base_datos.sql' en phpMyAdmin</li>";
    echo "</ul>";
    $conexion->close();
    exit;
} else {
    echo "<p style='color: green;'>✅ La tabla 'equipos_pc' existe</p>";
}

// Paso 5: Contar registros
echo "<h2>Paso 5: Verificando datos en la tabla...</h2>";
$resultado = $conexion->query("SELECT COUNT(*) as total FROM equipos_pc");
$fila = $resultado->fetch_assoc();
$total = $fila['total'];

if ($total == 0) {
    echo "<p style='color: orange;'>⚠️ ADVERTENCIA: La tabla 'equipos_pc' está vacía (0 registros)</p>";
    echo "<h3>Solución:</h3>";
    echo "<ul>";
    echo "<li>Ejecuta el script 'crear_base_datos.sql' para insertar datos de ejemplo</li>";
    echo "<li>O agrega datos manualmente desde phpMyAdmin</li>";
    echo "</ul>";
} else {
    echo "<p style='color: green;'>✅ La tabla tiene $total registro(s)</p>";
}

// Paso 6: Mostrar algunos datos
if ($total > 0) {
    echo "<h2>Paso 6: Mostrando datos de ejemplo...</h2>";
    $resultado = $conexion->query("SELECT * FROM equipos_pc LIMIT 5");
    
    echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
    echo "<tr style='background-color: #4CAF50; color: white;'>";
    echo "<th>ID</th><th>Nombre</th><th>Tipo</th><th>Marca</th><th>Modelo</th><th>Estado</th>";
    echo "</tr>";
    
    while ($fila = $resultado->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $fila['id'] . "</td>";
        echo "<td>" . $fila['nombre'] . "</td>";
        echo "<td>" . $fila['tipo'] . "</td>";
        echo "<td>" . $fila['marca'] . "</td>";
        echo "<td>" . $fila['modelo'] . "</td>";
        echo "<td>" . $fila['estado'] . "</td>";
        echo "</tr>";
    }
    
    echo "</table>";
}

// Resumen final
echo "<hr>";
echo "<h2>📊 Resumen de la Prueba</h2>";
echo "<ul>";
echo "<li>✅ Servidor MySQL: <strong>Conectado</strong></li>";
echo "<li>✅ Base de datos: <strong>$base_de_datos</strong></li>";
echo "<li>✅ Tabla: <strong>equipos_pc</strong></li>";
echo "<li>✅ Registros: <strong>$total</strong></li>";
echo "</ul>";

echo "<h3>🎉 ¡Todo está funcionando correctamente!</h3>";
echo "<p>Ahora puedes abrir tu página principal:</p>";
echo "<p><a href='InventarioPCs.html' target='_blank' style='font-size: 18px; color: #4CAF50;'>➡️ Abrir Inventario de PCs</a></p>";

$conexion->close();
?>
