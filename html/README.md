# 🟧 HTML — Documentación

## Archivo: `InventarioPCs.html`

Es la **página principal** de la aplicación. Contiene toda la estructura visual del sistema de inventario.

---

## ¿Qué es HTML?

HTML (**HyperText Markup Language**) es el lenguaje de marcado que define la **estructura** de una página web. No es un lenguaje de programación, sino un lenguaje que usa **etiquetas** (tags) para organizar el contenido.

```html
<etiqueta atributo="valor">Contenido</etiqueta>
```

---

## Estructura General del Archivo

```html
<!DOCTYPE html>
<!-- Declara que es un documento HTML5 -->
<html lang="es">
  <!-- Idioma español -->
  <head>
    <!-- Configuración (no visible para el usuario) -->
    <meta charset="UTF-8" />
    <title>Inventario de PCs y Periféricos - MyCard</title>
    <link rel="stylesheet" href="..." />
    <!-- Vincula hojas de estilo -->
  </head>
  <body>
    <!-- Contenido visible de la página -->
    ...
  </body>
</html>
```

---

## `<head>` — Configuración y Dependencias

### ¿Qué es `<meta>`?

Las etiquetas `<meta>` proporcionan **información sobre la página** al navegador:

```html
<meta charset="UTF-8" />
<!-- Define la codificación de caracteres. UTF-8 soporta: ñ, á, é, emojis, etc. -->

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=yes"
/>
<!-- Hace que la página se adapte al tamaño del dispositivo (responsive).
     - width=device-width  → el ancho se ajusta a la pantalla
     - initial-scale=1.0   → zoom inicial al 100%
     - user-scalable=yes   → permite al usuario hacer zoom con los dedos -->
```

### ¿Qué es `<link>`?

Vincula recursos externos (CSS, fuentes, iconos):

```html
<!-- Google Fonts: carga la tipografía "Bricolage Grotesque" desde Google -->
<link
  href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque..."
  rel="stylesheet"
/>

<!-- CSS propio: carga los estilos del proyecto -->
<link rel="stylesheet" href="../css/InventarioPCs.css" />

<!-- Font Awesome: librería de iconos (laptop, Excel, lupa) -->
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
/>

<!-- Bootstrap Icons: iconos adicionales (ojo para contraseña) -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
/>
```

> **Nota:** `../css/` significa "sube una carpeta y entra a `css/`". Esto es porque el HTML está en `html/` y el CSS está en `css/`.

---

## `<body>` — Contenido Visible

### 1. Header — Encabezado

```html
<div class="header">
  <h1>MyCard</h1>
  <p class="parrafo-principal" style="color: #ffffff; font-size: 1.1em;">
    Gestión de equipos de computo
  </p>
</div>
```

| Etiqueta      | Significado                                           |
| ------------- | ----------------------------------------------------- |
| `<div>`       | Contenedor genérico, agrupa elementos                 |
| `<h1>`        | Encabezado principal (solo debe haber uno por página) |
| `<p>`         | Párrafo de texto                                      |
| `class="..."` | Nombre de clase CSS para aplicar estilos              |
| `style="..."` | Estilos en línea (directo en el HTML, evitar abuso)   |

---

### 2. Vista de Detalle — `#detalleEquipo`

Se muestra cuando un usuario escanea un código QR (la URL contiene `?id=X`).

```html
<div id="detalleEquipo" style="display: none;"></div>
```

- **`id="detalleEquipo"`** — Identificador único. Se usa desde JavaScript con `document.getElementById('detalleEquipo')`.
- **`style="display: none;"`** — Oculto por defecto. JavaScript lo muestra cuando es necesario.

#### Botón de regresar

```html
<button onclick="regresarInventario()" class="btn-regresar">
  ← Regresar al Inventario
</button>
```

- **`onclick="..."`** — Evento que ejecuta una función JavaScript al hacer clic.

#### Tarjeta de detalle

```html
<div class="detalle-card">
  <h2 id="detalle-nombre"></h2>
  <!-- Nombre del equipo (llenado por JS) -->
  <div class="info-item">
    <span class="label">ID:</span>
    <!-- Etiqueta -->
    <span id="detalle-id"></span>
    <!-- Valor (llenado por JS) -->
  </div>
</div>
```

- **`<span>`** — Contenedor en línea (no hace salto de línea).
- Los `id` vacíos se llenan dinámicamente desde JavaScript.

#### Botón de cambio de estado

```html
<button
  id="btnCambiarEstado"
  onclick="cambiarEstadoEquipo()"
  class="btn-cambiar-estado"
>
  Marcar como Ocupada
</button>
```

JavaScript cambia tanto el texto como la clase CSS de este botón según el estado del equipo.

---

### 3. Tarjetas de Estadísticas — `.stats-container`

```html
<div class="stats-container">
  <div
    class="stat-card"
    onclick="filtrarPorEstado('todos')"
    style="cursor: pointer;"
    id="cardTodos"
  >
    <div class="stat-label">Total de Equipos</div>
    <div class="stat-value" id="totalEquipos">0</div>
  </div>
  <!-- ... dos tarjetas más para Disponibles y Ocupadas ... -->
</div>
```

| Atributo                              | Explicación                                                |
| ------------------------------------- | ---------------------------------------------------------- |
| `onclick="filtrarPorEstado('todos')"` | Al hacer clic, filtra la tabla mostrando todos los equipos |
| `style="cursor: pointer;"`            | El cursor cambia a manita al pasar sobre la tarjeta        |
| `id="totalEquipos"`                   | JavaScript actualiza este número con los datos reales      |

---

### 4. Controles — `.controls`

```html
<div class="controls" id="controls">
  <div class="button-group">
    <!-- Botón Agregar -->
    <button onclick="abrirModal()">
      <i class="fa-solid fa-laptop-code"></i>
      <!-- Icono de Font Awesome -->
      Agregar Equipo
    </button>

    <!-- Botón Exportar -->
    <button class="btn-exportar" onclick="exportarDatos()">
      <i class="fa-solid fa-file-excel"></i>
      Exportar a Excel
    </button>

    <!-- Buscador -->
    <div class="search-wrapper">
      <i class="fa-solid fa-magnifying-glass search-icon"></i>
      <input
        type="text"
        class="search-box"
        id="searchBox"
        placeholder="Buscar por nombre, marca o modelo..."
        onkeyup="filtrarTabla()"
      />
    </div>
  </div>
</div>
```

| Etiqueta                              | Uso                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `<i class="fa-solid fa-laptop-code">` | Icono de Font Awesome (etiqueta `<i>` = italic, usada por convención para iconos) |
| `<input type="text">`                 | Campo de texto para búsqueda                                                      |
| `placeholder="..."`                   | Texto gris de ejemplo que desaparece al escribir                                  |
| `onkeyup="filtrarTabla()"`            | Se ejecuta cada vez que el usuario levanta una tecla                              |

---

### 5. Tabla del Inventario — `#inventarioTable`

```html
<table id="inventarioTable">
  <thead>
    <!-- Encabezado de la tabla -->
    <tr>
      <!-- Fila (Table Row) -->
      <th>ID</th>
      <!-- Celda de encabezado (Table Header) -->
      <th>Nombre</th>
      <th>Tipo</th>
      <th>Marca</th>
      <th>Modelo</th>
      <th>Descripción</th>
      <th>Estado</th>
    </tr>
  </thead>
  <tbody id="inventarioBody">
    <!-- Cuerpo de la tabla (llenado por JS) -->
  </tbody>
</table>
```

| Etiqueta  | Significado                                                          |
| --------- | -------------------------------------------------------------------- |
| `<table>` | Tabla                                                                |
| `<thead>` | Cabecera de la tabla (se estiliza diferente)                         |
| `<tbody>` | Cuerpo de la tabla (filas de datos)                                  |
| `<tr>`    | Fila (Table Row)                                                     |
| `<th>`    | Celda de encabezado (Table Header), texto en **negrita** por defecto |
| `<td>`    | Celda de datos (Table Data)                                          |

> El `<tbody>` está vacío porque JavaScript lo llena dinámicamente con `cargarTabla()`.

---

### 6. Modal de Autenticación — `#modalAuth`

```html
<div id="modalAuth" class="modal" style="display: none;">
  <div class="modal-content modal-auth">
    <span class="close" onclick="cerrarModalAuth()">&times;</span>
    <!-- Botón X -->
    <h2>Acceso de Administrador</h2>

    <form id="formAuth" onsubmit="verificarCredenciales(event)">
      <div class="form-group">
        <label for="username">Usuario:</label>
        <input
          type="text"
          id="username"
          name="username"
          required
          autocomplete="username"
        />
      </div>

      <div class="form-group">
        <label for="password">Contraseña:</label>
        <i class="bi bi-eye-slash-fill" id="togglePassword"></i>
        <input type="password" id="password" name="password" />
      </div>

      <div id="error-message" style="display: none;">
        Usuario o contraseña incorrectos
      </div>

      <div class="form-buttons">
        <button type="submit" class="btn-submit">Ingresar</button>
        <button type="button" class="btn-cancel" onclick="cerrarModalAuth()">
          Cancelar
        </button>
      </div>
    </form>
  </div>
</div>
```

| Atributo                  | Explicación                                                  |
| ------------------------- | ------------------------------------------------------------ |
| `&times;`                 | Carácter especial HTML para el símbolo × (cerrar)            |
| `<form onsubmit="...">`   | Se ejecuta al enviar el formulario                           |
| `<label for="username">`  | Asocia la etiqueta al input con `id="username"`              |
| `required`                | El campo es obligatorio, el navegador valida automáticamente |
| `autocomplete="username"` | El navegador puede autocompletar este campo                  |
| `type="password"`         | El texto se muestra como puntos (●●●●)                       |
| `type="submit"`           | Botón que envía el formulario                                |
| `type="button"`           | Botón normal, NO envía el formulario                         |

---

### 7. Modal para Agregar Equipo — `#modalAgregar`

```html
<form id="formAgregar" onsubmit="agregarEquipo(event)">
  <!-- Inputs de texto -->
  <input type="text" id="nombre" name="nombre" required />

  <!-- Select (menú desplegable) -->
  <select id="tipo" name="tipo" required>
    <option value="">Seleccionar...</option>
    <option value="Mini Pc">Mini PC</option>
    <option value="Laptop">Laptop</option>
    ...
  </select>

  <!-- Textarea (texto multilínea) -->
  <textarea
    id="descripcion"
    name="descripcion"
    rows="3"
    placeholder="Ej: Equipo asignado a recepción..."
  ></textarea>
</form>
```

| Etiqueta     | Uso                                                               |
| ------------ | ----------------------------------------------------------------- |
| `<select>`   | Menú desplegable                                                  |
| `<option>`   | Cada opción del menú. `value=""` = valor que se envía al servidor |
| `<textarea>` | Campo de texto grande con múltiples líneas                        |
| `rows="3"`   | Altura visible del textarea (3 líneas)                            |
| `name="..."` | Nombre del campo, PHP lo recibe con `$_POST['nombre']`            |

---

### 8. Script Externo

```html
<script src="../scripts/script.js"></script>
```

- Carga el archivo JavaScript externo.
- Se coloca al final del `<body>` para que el HTML ya esté cargado cuando el JS se ejecute.
- `../scripts/` = sube una carpeta, entra a `scripts/`.

---

## Conceptos Clave de HTML

### `id` vs `class`

| Propiedad  | `id`                                 | `class`                                |
| ---------- | ------------------------------------ | -------------------------------------- |
| Unicidad   | Debe ser **único** en toda la página | Puede repetirse en múltiples elementos |
| CSS        | `#miId { }`                          | `.miClase { }`                         |
| JavaScript | `getElementById('miId')`             | `getElementsByClassName('miClase')`    |
| Uso típico | Elementos específicos                | Estilos reutilizables                  |

### Rutas relativas

| Ruta                 | Significado                           |
| -------------------- | ------------------------------------- |
| `../css/archivo.css` | Sube una carpeta, entra a `css/`      |
| `./archivo.css`      | En la misma carpeta                   |
| `archivo.css`        | En la misma carpeta (equivale a `./`) |
| `/ruta/archivo.css`  | Desde la raíz del servidor            |

---

_📖 Ver también: [CSS README](../css/README.md) · [JavaScript README](../scripts/README.md) · [PHP README](../README_PHP.md) · [Python README](../python/README.md)_
