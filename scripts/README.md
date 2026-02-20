# 🟨 JavaScript — Documentación

## Archivo: `script.js`

Contiene **toda la lógica** de la aplicación: comunicación con el servidor, manipulación del DOM, eventos, validación y exportación de datos.

---

## ¿Qué es JavaScript?

JavaScript (JS) es un **lenguaje de programación** que se ejecuta en el navegador. Mientras HTML define la estructura y CSS la apariencia, JavaScript controla el **comportamiento**.

---

## Conceptos Fundamentales

### Variables: `let`, `const` y `var`

```javascript
let inventario = []; // Se puede reasignar
const ADMIN_USER = "admin"; // NO se puede reasignar (constante)
var nombre = "Juan"; // Forma antigua, evitar usar
```

| Palabra clave | Se puede reasignar | Alcance      | Uso recomendado            |
| ------------- | ------------------ | ------------ | -------------------------- |
| `const`       | ❌ No              | Bloque `{ }` | Valores que no cambian     |
| `let`         | ✅ Sí              | Bloque `{ }` | Valores que pueden cambiar |
| `var`         | ✅ Sí              | Función      | ⚠️ Evitar                  |

---

### `document` — El DOM

El **DOM** (Document Object Model) es la representación del HTML como objetos de JavaScript.

```javascript
// Obtener un elemento por su ID
document.getElementById("totalEquipos");

// Obtener el primer elemento que coincida con un selector CSS
document.querySelector(".stats-container");

// Obtener TODOS los elementos que coincidan
document.querySelectorAll("#inventarioBody tr");

// Cambiar contenido o estilos
document.getElementById("totalEquipos").textContent = "10";
document.getElementById("controls").style.display = "block";

// Crear y agregar elementos
const tr = document.createElement("tr");
tr.innerHTML = `<td>Hola</td>`;
tbody.appendChild(tr);
```

---

### Funciones

```javascript
// Función tradicional
function saludar(nombre) {
  return "Hola " + nombre;
}

// Función flecha (arrow function) — sintaxis moderna
const saludar = (nombre) => "Hola " + nombre;
```

---

### Template Literals (Backticks)

```javascript
// Concatenación clásica
const texto = "ID: " + item.id + ", Nombre: " + item.nombre;

// Template literal (más limpio)
const texto = `ID: ${item.id}, Nombre: ${item.nombre}`;
```

- Se delimitan con **backticks** ( \` ).
- Las variables se insertan con **`${variable}`**.
- Permiten **múltiples líneas**.

---

### Operador Ternario `? :`

```javascript
// if/else en una sola línea
const tipo = password.getAttribute("type") === "password" ? "text" : "password";
//           condición                                      ? verdadero : falso
```

### Operador `||` (OR) y Optional Chaining `?.`

```javascript
const desc = item.descripcion || "Sin descripción"; // Si es null/vacío, usa el segundo valor
const nombre = inventario.find((i) => i.id == id)?.nombre; // Si no encuentra, devuelve undefined (no error)
```

---

## ¿Qué es `async` y `await`?

### El problema: JavaScript es asíncrono

Cuando JS hace una petición al servidor, **no espera** a que termine:

```javascript
// ❌ NO funciona
function cargarDatos() {
  const response = fetch("api.php"); // Petición enviada pero no esperada
  const data = response.json(); // response aún no llegó!
}
```

### La solución: `async` / `await`

```javascript
// ✅ SÍ funciona
async function cargarDatos() {
  const response = await fetch("api.php"); // ESPERA a que llegue
  const data = await response.json(); // ESPERA a que se procese
  console.log(data); // ¡Datos reales!
}
```

| Palabra | Significado                                               |
| ------- | --------------------------------------------------------- |
| `async` | Marca una función como **asíncrona** (puede usar `await`) |
| `await` | **Pausa** la ejecución hasta que la promesa se resuelva   |

#### ¿Qué es una Promesa (Promise)?

Un objeto que representa un valor que **aún no existe** pero existirá en el futuro. `fetch()` devuelve una Promesa.

---

## ¿Qué es `fetch()`?

Forma moderna de hacer **peticiones HTTP** desde JavaScript.

### GET (obtener datos)

```javascript
const response = await fetch("api_inventario.php");
// GET = "dame datos"
```

### POST (enviar datos)

```javascript
const formData = new FormData();
formData.append("id", equipoActualId);

const response = await fetch("cambiar_estado.php", {
  method: "POST",
  body: formData,
});
// POST = "recibe estos datos y procésalos"
```

| Método | Uso                    | Datos                  |
| ------ | ---------------------- | ---------------------- |
| `GET`  | Consultar datos        | En la URL              |
| `POST` | Enviar/crear/modificar | En el cuerpo (ocultos) |

---

## ¿Qué es `FormData`?

Empaqueta datos en formato de formulario:

```javascript
// Manual
const formData = new FormData();
formData.append("id", 5);

// Desde un formulario HTML
const formData = new FormData(event.target); // Toma TODOS los campos con name=""
```

PHP los recibe con `$_POST['id']`.

---

## ¿Qué es `try...catch`?

Manejo de errores. Si algo falla en `try`, salta al `catch`:

```javascript
try {
  const response = await fetch("api.php");
  const result = await response.json();
} catch (error) {
  console.error("Error:", error);
  alert("Error al conectar con el servidor");
}
```

---

## Eventos (addEventListener)

```javascript
// Desde JavaScript (recomendado)
togglePassword.addEventListener("click", function () {
  this.classList.toggle("bi-eye-slash-fill");
  this.classList.toggle("bi-eye-fill");
});
```

- **`this`** = el elemento que disparó el evento.
- **`classList.toggle()`** = agrega la clase si no la tiene, la quita si la tiene.

---

## Métodos de Arrays

```javascript
// .forEach() — Recorrer todos
inventario.forEach((item) => {
  console.log(item.nombre);
});

// .find() — Encontrar UNO
const equipo = inventario.find((item) => item.id == equipoId);

// .filter() — Filtrar varios
const disponibles = inventario.filter((item) => item.estado === "disponible");

// .map() — Transformar
const nombres = inventario.map((item) => item.nombre);
```

---

## Otros Conceptos Usados

### `setTimeout()` — Ejecutar después de un tiempo

```javascript
setTimeout(() => {
  mensaje.style.opacity = "0"; // Después de 3 segundos, hazlo transparente
}, 3000); // 3000ms = 3 segundos
```

### `event.preventDefault()` — Prevenir comportamiento por defecto

```javascript
event.preventDefault(); // Evita que el formulario recargue la página
```

### `window.history.pushState()` — Cambiar URL sin recargar

```javascript
window.history.pushState({}, "", "InventarioPCs.html"); // Limpia el ?id= de la URL
```

### `Blob` — Crear archivos en el navegador

```javascript
const blob = new Blob([csv], { type: "text/csv" });
const url = window.URL.createObjectURL(blob);
// Se usa para descargar el CSV sin servidor
```

---

## Resumen de Funciones

| Función                    | Tipo    | Qué hace                       |
| -------------------------- | ------- | ------------------------------ |
| `cargarInventario()`       | `async` | Obtiene datos del servidor     |
| `filtrarPorEstado(estado)` | normal  | Filtra filas de la tabla       |
| `mostrarDetalleEquipo(id)` | normal  | Muestra vista de detalle       |
| `cambiarEstadoEquipo()`    | `async` | Alterna estado del equipo      |
| `regresarInventario()`     | normal  | Vuelve a vista principal       |
| `verificarCredenciales(e)` | normal  | Valida login                   |
| `agregarEquipo(e)`         | `async` | Envía nuevo equipo al servidor |
| `cargarTabla()`            | normal  | Genera filas de la tabla       |
| `filtrarTabla()`           | normal  | Búsqueda en tiempo real        |
| `exportarDatos()`          | normal  | Descarga CSV                   |
| `resaltarEquipo(id)`       | normal  | Resalta una fila visualmente   |

---

_📖 Ver también: [HTML README](../html/README.md) · [CSS README](../css/README.md) · [PHP README](../README_PHP.md) · [Python README](../python/README.md)_
