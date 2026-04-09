# 👥 Módulo de Gestión de Usuarios — Documentación Técnica

Este documento describe paso a paso la implementación del nuevo módulo de administración de usuarios, incluyendo la matriz de roles aplicada, los archivos creados, la seguridad configurada, y los ajustes de interfaz realizados.

---

## 🗂️ Archivos Nuevos Creados

| Archivo | Tipo | Propósito |
|---|---|---|
| `html/gestion_usuarios.html` | Frontend | Interfaz visual de la tabla y modal de usuarios |
| `css/gestion_usuarios.css` | Estilos | Hoja de estilos exclusiva del módulo (aislada) |
| `scripts/gestion_usuarios.js` | JavaScript | Lógica async de listar, crear, editar y eliminar |
| `php/listar_usuarios.php` | Backend | Endpoint GET: consulta todos los usuarios |
| `php/crear_usuario.php` | Backend | Endpoint POST: alta de usuario con Bcrypt |
| `php/editar_usuario.php` | Backend | Endpoint POST: edición de datos y contraseña |
| `php/eliminar_usuario.php` | Backend | Endpoint POST: baja permanente con auditoría |

---

## 🔐 Seguridad y Control de Acceso (RBAC)

Todos los endpoints están protegidos con el sistema `check_session.php`. Cualquier intento de ejecución sin sesión válida es bloqueado automáticamente con código HTTP `403 Forbidden`.

### Tabla de Permisos por Rol

| Módulo / Función | Administrador (1) | Técnico (2) | Consulta (3) | Auditor (4) |
|---|:---:|:---:|:---:|:---:|
| Ver panel principal | ✅ | ✅ | ✅ | ✅ |
| Consultar inventario | ✅ | ✅ | ✅ | ✅ |
| Registrar nuevo equipo | ✅ | ✅ | ❌ | ❌ |
| Editar información de equipo | ✅ | ✅ | ❌ | ❌ |
| Cambiar estado de equipo | ✅ | ✅ | ❌ | ❌ |
| **Dar de baja / eliminar equipo** | ✅ | ✅ | ❌ | ❌ |
| Consultar logs / bitácora | ✅ | ❌ | ❌ | ✅ |
| **Gestionar usuarios** | ✅ | ❌ | ❌ | ❌ |
| **Crear usuarios** | ✅ | ❌ | ❌ | ❌ |
| **Editar usuarios** | ✅ | ❌ | ❌ | ❌ |
| **Eliminar usuarios** | ✅ | ❌ | ❌ | ❌ |
| **Asignar roles y permisos** | ✅ | ❌ | ❌ | ❌ |

> Los cambios marcados en **negrita** son funciones nuevas implementadas en esta sesión.

---

## 🛠️ Implementación Paso a Paso

### Paso 1 — Ajuste de la Matriz de Permisos

- **`php/eliminar_equipo.php`**: Se cambió `$required_role_max = 1` a `$required_role_max = 2`, permitiendo que el rol **Técnico** también pueda eliminar equipos físicos.
- **`scripts/app.js`**: Se agregó una nueva condición que muestra el botón `btnEliminarEquipo` para roles ≤ 2 (Admin y Técnico), y se añadió la lógica para mostrar u ocultar el nuevo botón `btnGestionUsuarios` únicamente si el `rol_id === 1`.
- **`html/index.html`**: Se insertó el nuevo botón `Gestionar Usuarios` (con id `btnGestionUsuarios`) en la botonera del panel de inventario apuntando a `gestion_usuarios.html`. Oculto por defecto para todos.

---

### Paso 2 — Backend PHP (4 Archivos Separados)

#### `php/listar_usuarios.php`
- **Método:** `GET`
- **Protección:** `$required_role_max = 1`
- **Función:** Consulta la tabla `usuarios` con `SELECT id, nombre_completo, username, rol_id, estatus`.
- **Nota:** Los nombres de los roles se mapean directamente en PHP (sin JOIN a tabla `roles`) para evitar errores si dicha tabla no existe.

```php
$roles_nombres = [
    1 => 'Administrador',
    2 => 'Técnico de Sistemas',
    3 => 'Usuario de Consulta',
    4 => 'Auditor / Supervisor'
];
```

#### `php/crear_usuario.php`
- **Método:** `POST` (recibe JSON)
- **Protección:** `$required_role_max = 1`
- **Función:** Valida que no exista el `username` antes de insertar. Encripta la contraseña automáticamente con `password_hash($password, PASSWORD_BCRYPT)`. Registra la creación en `logs_auditoria` con la acción `CREAR_USUARIO`.

#### `php/editar_usuario.php`
- **Método:** `POST` (recibe JSON)
- **Protección:** `$required_role_max = 1`
- **Función:** Actualiza nombre, rol y estatus. Si el campo `password` viene vacío, **no** se modifica el hash. Si viene con valor, se genera un nuevo hash Bcrypt. Registra en auditoría con `EDITAR_USUARIO`.

#### `php/eliminar_usuario.php`
- **Método:** `POST` (recibe JSON con `id`)
- **Protección:** `$required_role_max = 1`
- **Función:** Borra permanentemente al usuario. Incluye protección especial que **previene que el administrador se autoelimine** comparando `$id === $_SESSION['user_id']`. Registra en auditoría con `ELIMINAR_USUARIO`.

---

### Paso 3 — Interfaz `gestion_usuarios.html`

La interfaz está construida hereda el mismo diseño (`wrapper`, `container`, `header`, fuente, gradiente) que el `index.html` para mantener coherencia visual.

**Estructura de la página:**
1. **Encabezado**: Título centrado "Gestión de Usuarios" + botón sutil "Regresar al Inventario" con efecto hover.
2. **Barra de Acciones**: Botón azul `+ Nuevo Usuario` y caja de búsqueda en tiempo real.
3. **Tabla Dinámica**: Se rellena desde `listar_usuarios.php`. Columnas: ID, Nombre/Usuario, Rol (badge coloreado), Estatus, y Acciones (Editar/Eliminar).
4. **Modal Flotante**: Formulario reutilizable para **Crear** o **Editar** un usuario. En modo edición, el campo `username` se oculta ya que no debe modificarse. El campo `Contraseña` en edición es opcional.
5. **Toast de Notificaciones**: Mensaje emergente en la esquina inferior derecha que confirma el éxito o error de cada operación.

---

### Paso 4 — Lógica JavaScript (`gestion_usuarios.js`)

| Función | Descripción |
|---|---|
| `cargarUsuarios()` | Llama a `listar_usuarios.php` y rellena la tabla. Redirige a login si hay 401/403. |
| `renderizarTabla(lista)` | Genera las filas HTML con badges y botones de acción. |
| `filtrarUsuarios()` | Filtrado en tiempo real sobre el array en memoria (sin llamadas extra al servidor). |
| `abrirModalNuevo()` | Limpia el formulario y activa el modo de creación. |
| `abrirEditar(id)` | Pre-rellena el formulario con los datos del usuario y activa modo edición. |
| `guardarUsuario()` | Decide si llama a `crear_usuario.php` o `editar_usuario.php` según el modo activo. |
| `confirmarEliminar(id, username)` | Muestra un `confirm()` nativo como protección antes de eliminar. |
| `mostrarToast(msg, tipo)` | Muestra una pastilla de notificación animada (verde = éxito, rojo = error). |

---

### Paso 5 — Correcciones de Diseño Aplicadas

- **Fuente Bricolage Grotesque**: Todas las celdas (`td`, `th`), badges, botones y elementos del modal fueron forzados a usar la fuente correcta con `font-family: 'Bricolage Grotesque', sans-serif !important` para evitar que `style_principal.css` las sobreescribiera.
- **Fondo oscuro en la tabla**: Se aplicó `background: rgba(15, 20, 35, 0.85) !important` en `.gu-table-container` para asegurar que el texto claro fuera visible.
- **th centrados**: Los encabezados de la tabla se centraron con `text-align: center` para alinear visualmente con el contenido de cada columna.
- **Sombra roja en botón Eliminar**: El botón de eliminación tiene `box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35)` en reposo y se intensifica al hacer hover.
- **Modal con `.gu-modal *`**: Se agregó un selector universal para propagar la fuente a todos los hijos del modal sin necesidad de repetir la declaración en cada elemento individual.

---

## 🔗 Rutas de Acceso

| URL | Quién puede entrar |
|---|---|
| `http://localhost/Inventario_MyCard/html/gestion_usuarios.html` | Solo Administrador (rol 1) |

> Si un usuario de otro rol intenta acceder directamente por URL, el endpoint PHP bloqueará cualquier consulta de datos con código `403`.

---

*Documentación generada el 8 de abril de 2026.*
