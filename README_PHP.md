# 🟪 PHP — Documentación

## Archivos PHP del Proyecto

| Archivo              | Tipo           | Descripción                               |
| -------------------- | -------------- | ----------------------------------------- |
| `db.php`             | Conexión       | Configuración y conexión a MySQL          |
| `api_inventario.php` | API (GET)      | Devuelve todos los equipos y estadísticas |
| `agregar_equipo.php` | API (POST)     | Agrega un nuevo equipo al inventario      |
| `cambiar_estado.php` | API (POST)     | Alterna el estado de un equipo            |
| `actualizar_ip.php`  | Utilidad (CLI) | Actualiza las URLs con la IP actual       |
| `verificar_urls.php` | Utilidad (CLI) | Lista las URLs almacenadas                |

---

## ¿Qué es PHP?

PHP (**PHP: Hypertext Preprocessor**) es un lenguaje de programación del **lado del servidor**. Se ejecuta en el servidor (Apache/XAMPP), procesa datos y devuelve un resultado (HTML o JSON) al navegador.

```
Navegador → Petición HTTP → Apache → PHP procesa → MySQL → PHP responde → Navegador
```

- PHP se escribe entre las etiquetas `<?php ... ?>`
- Todo el código PHP se ejecuta en el servidor, el navegador **nunca** ve el código PHP.

---

## `db.php` — Conexión a la Base de Datos

```php
<?php
$host = "localhost";           // Servidor de la BD (mismo equipo)
$usuario = "root";             // Usuario de MySQL (por defecto en XAMPP)
$password = "";                // Sin contraseña (XAMPP por defecto)
$base_de_datos = "equipos_mycard";

// Crear la conexión usando mysqli (MySQL Improved)
$conexion = new mysqli($host, $usuario, $password, $base_de_datos);

// Verificar si hubo error
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// Configurar charset para soportar ñ, á, emojis, etc.
$conexion->set_charset("utf8mb4");
?>
```

### Conceptos explicados:

#### ¿Qué es `mysqli`?

Es la extensión de PHP para conectarse a **MySQL**. La `i` significa "improved" (mejorada). Soporta:

- Prepared statements (consultas seguras contra SQL injection).
- Múltiples consultas.
- Transacciones.

#### ¿Qué es `->` (flecha)?

Es el operador de acceso a **métodos y propiedades de un objeto** en PHP:

```php
$conexion->connect_error    // Accede a la propiedad "connect_error" del objeto $conexion
$conexion->query($sql)      // Llama al método "query" del objeto $conexion
```

Es equivalente al `.` en JavaScript: `objeto.propiedad`.

#### ¿Qué es `die()`?

Detiene la ejecución del script inmediatamente y muestra un mensaje.

#### Variables en PHP

Las variables en PHP **siempre** empiezan con `$`:

```php
$nombre = "Juan";           // String
$edad = 25;                 // Entero
$precio = 19.99;            // Float
$activo = true;             // Booleano
$equipos = [];              // Array vacío
```

---

## `api_inventario.php` — Obtener Inventario

```php
<?php
header('Content-Type: application/json');        // La respuesta es JSON
header('Access-Control-Allow-Origin: *');         // Permite peticiones desde cualquier origen (CORS)

require_once 'db.php';                            // Importa la conexión a la BD

try {
    // Consulta SQL: obtener todos los equipos ordenados por ID
    $sql = "SELECT id, nombre, tipo, marca, modelo, descripcion, estado FROM equipos_pc ORDER BY id ASC";
    $resultado = $conexion->query($sql);

    // Convertir resultados a array de PHP
    $equipos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $equipos[] = $fila;    // $array[] = valor  →  agrega al final del array
    }

    // Consultas de estadísticas
    $result = $conexion->query("SELECT COUNT(*) as total FROM equipos_pc");
    $stats['total'] = $result->fetch_assoc()['total'];

    // Construir respuesta JSON
    $response = [
        'success' => true,
        'data' => $equipos,
        'stats' => [
            'total_equipos' => (int) $stats['total'],
            'total_disponibles' => (int) $stats['disponibles'],
            'total_ocupadas' => (int) $stats['ocupadas']
        ]
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conexion->close();
?>
```

### Conceptos explicados:

#### `header()` — Encabezados HTTP

```php
header('Content-Type: application/json');    // Le dice al navegador que la respuesta es JSON
header('Access-Control-Allow-Origin: *');    // Permite CORS (peticiones desde otros dominios)
```

#### `require_once`

Importa un archivo PHP. `once` significa que si ya fue importado, no lo importa de nuevo:

```php
require_once 'db.php';     // Importa la conexión. Si falla, DETIENE el script.
include_once 'db.php';     // Similar pero si falla, solo muestra advertencia.
```

#### `try...catch` en PHP

Igual que en JavaScript, maneja errores:

```php
try {
    // Código que puede fallar
} catch (Exception $e) {
    echo $e->getMessage();    // Muestra el mensaje de error
}
```

#### `fetch_assoc()`

Obtiene una fila de resultados como **array asociativo** (con nombres de columna):

```php
$fila = $resultado->fetch_assoc();
// Resultado: ['id' => 1, 'nombre' => 'PC Recepción', 'estado' => 'disponible']
echo $fila['nombre'];   // "PC Recepción"
```

#### `json_encode()`

Convierte un array/objeto de PHP a **texto JSON** para enviar al navegador:

```php
echo json_encode(['success' => true, 'data' => $equipos]);
// Resultado: {"success":true,"data":[...]}
```

- `JSON_UNESCAPED_UNICODE` → Mantiene caracteres como ñ, á sin escapar.

#### `(int)` — Cast (conversión de tipo)

```php
$stats['total'] = "10";           // Es un string
(int) $stats['total'];            // Lo convierte a entero: 10
```

---

## `agregar_equipo.php` — Agregar Equipo

### Conceptos clave:

#### `$_POST` — Recibir datos

```php
$nombre = $_POST['nombre'] ?? '';    // Obtiene el valor enviado por POST
```

- `$_POST` es un **array superglobal** que contiene los datos enviados con método POST.
- `??` es el operador **null coalescing**: si el valor es null, usa el valor por defecto.

#### Prepared Statements — Consultas seguras

```php
// ❌ INSEGURO (vulnerable a SQL injection)
$sql = "INSERT INTO equipos_pc VALUES ('$nombre', '$tipo')";

// ✅ SEGURO (usa prepared statements)
$sql = "INSERT INTO equipos_pc (nombre, tipo, marca, modelo, descripcion, estado) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("ssssss", $nombre, $tipo, $marca, $modelo, $descripcion, $estado);
$stmt->execute();
```

- Los `?` son **placeholders** que se reemplazan de forma segura.
- `bind_param("ssssss", ...)` — La `s` indica que cada parámetro es un **string**. Otros tipos: `i` (entero), `d` (double), `b` (blob).

#### `shell_exec()` — Ejecutar comandos del sistema

```php
$command = "python generar_qr_unico.py $nuevo_id 2>&1";
$output = shell_exec($command);
```

- Ejecuta un comando en la terminal del servidor.
- `2>&1` redirige los errores a la salida estándar.
- En este caso, ejecuta el script Python para generar el QR automáticamente.

#### `$stmt->insert_id`

Después de un INSERT, devuelve el **ID autogenerado** del nuevo registro.

---

## `cambiar_estado.php` — Cambiar Estado

Flujo:

1. Recibe el ID del equipo por POST.
2. Consulta el estado actual.
3. Si es `disponible` → lo cambia a `ocupada` y viceversa.
4. Actualiza la BD y responde con JSON.

```php
$nuevo_estado = ($estado_actual === 'disponible') ? 'ocupada' : 'disponible';
// Operador ternario en PHP (igual que en JavaScript)
```

---

## `actualizar_ip.php` — Actualizar IP

**Se ejecuta desde la terminal** (no desde el navegador):

```bash
php actualizar_ip.php
```

1. Detecta la IP local ejecutando `ipconfig` (Windows).
2. Usa **expresión regular** para extraer la IPv4:
   ```php
   preg_match_all('/IPv4[^\d]+([\d\.]+)/', $output, $matches);
   ```
3. Actualiza TODAS las URLs en la BD con la nueva IP.

#### ¿Cuándo usarlo?

Cuando cambia la IP de la red o al mover el proyecto a otra computadora.

---

## `verificar_urls.php` — Verificar URLs

```bash
php verificar_urls.php
```

Lista todos los equipos con su URL de redirección. Útil para depuración.

---

## Resumen de funciones PHP usadas

| Función                  | Descripción                            |
| ------------------------ | -------------------------------------- |
| `new mysqli()`           | Crea conexión a MySQL                  |
| `$conn->query()`         | Ejecuta una consulta SQL               |
| `$conn->prepare()`       | Prepara una consulta segura            |
| `$stmt->bind_param()`    | Vincula parámetros a la consulta       |
| `$stmt->execute()`       | Ejecuta la consulta preparada          |
| `$result->fetch_assoc()` | Obtiene una fila como array asociativo |
| `json_encode()`          | Convierte PHP a JSON                   |
| `header()`               | Envía encabezados HTTP                 |
| `require_once`           | Importa un archivo PHP                 |
| `shell_exec()`           | Ejecuta un comando del sistema         |
| `$_POST['campo']`        | Accede a datos enviados por POST       |

---

_📖 Ver también: [HTML README](html/README.md) · [CSS README](css/README.md) · [JavaScript README](scripts/README.md) · [Python README](python/README.md)_
