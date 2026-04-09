// ==========================================
// GESTIÓN DE USUARIOS - Lógica Principal JS
// ==========================================

let usuariosData = [];    // Cache de usuarios cargados
let modoEdicion   = false;
let idEditando    = null;

// ---- INICIALIZACIÓN ----
document.addEventListener('DOMContentLoaded', () => {
  cargarUsuarios();
  document.getElementById('searchUsuarios').addEventListener('keyup', filtrarUsuarios);
});

// ---- LISTAR ----
async function cargarUsuarios() {
  const tbody = document.getElementById('tbodyUsuarios');
  tbody.innerHTML = '<tr><td colspan="5" class="gu-loading"><i class="fa-solid fa-spinner fa-spin"></i> Cargando usuarios...</td></tr>';

  try {
    const resp = await fetch('../php/listar_usuarios.php');
    const json = await resp.json();

    if (!json.success) {
      if (resp.status === 401 || resp.status === 403) {
        window.location.href = 'login.html';
        return;
      }
      throw new Error(json.error);
    }

    usuariosData = json.data;
    renderizarTabla(usuariosData);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" class="gu-loading" style="color:#fca5a5;">Error: ${e.message}</td></tr>`;
  }
}

function renderizarTabla(lista) {
  const tbody = document.getElementById('tbodyUsuarios');

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="gu-loading">No hay usuarios registrados aún.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  lista.forEach((u, index) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td style="color:#e0edff; font-family:'Bricolage Grotesque',sans-serif;">#${index + 1}</td>
      <td>
        <span style="font-weight:700; color:white; font-family:'Bricolage Grotesque',sans-serif; display:block;">${u.nombre_completo}</span>
        <span style="font-size:0.82em; color:rgba(255,255,255,0.5); font-family:'Bricolage Grotesque',sans-serif;">@${u.username}</span>
      </td>
      <td>${badgeRol(u.rol_id, u.nombre_rol)}</td>
      <td>${u.estatus == 1
        ? '<span class="badge-activo">✓ Activo</span>'
        : '<span class="badge-inactivo">✕ Inactivo</span>'
      }</td>
      <td>
        <div class="acciones-td">
          <button class="btn-editar-u" onclick="abrirEditar(${u.id})">
            <i class="fa-solid fa-pen-to-square"></i> Editar
          </button>
          <button class="btn-eliminar-u" onclick="confirmarEliminar(${u.id}, '${u.username}')">
            <i class="fa-solid fa-trash"></i> Eliminar
          </button>
        </div>
      </td>`;
    tbody.appendChild(fila);
  });
}

function badgeRol(rol_id, nombre) {
  const clases = { 1: 'badge-admin', 2: 'badge-tecnico', 3: 'badge-consulta', 4: 'badge-auditor' };
  const cls = clases[rol_id] || 'badge-consulta';
  return `<span class="badge-rol ${cls}">${nombre || 'Desconocido'}</span>`;
}

// ---- BÚSQUEDA ----
function filtrarUsuarios() {
  const q = document.getElementById('searchUsuarios').value.toLowerCase();
  const filtrados = usuariosData.filter(u =>
    u.nombre_completo.toLowerCase().includes(q) ||
    u.username.toLowerCase().includes(q) ||
    u.nombre_rol.toLowerCase().includes(q)
  );
  renderizarTabla(filtrados);
}

// ---- MODAL: CREAR ----
function abrirModalNuevo() {
  modoEdicion = false;
  idEditando  = null;
  document.getElementById('modalTitulo').textContent   = 'Crear Nuevo Usuario';
  document.getElementById('modalSubtitulo').textContent = 'Completa todos los campos para el nuevo acceso al sistema.';
  document.getElementById('campoPassword').style.display = 'block';
  document.getElementById('labelPassword').textContent  = 'Contraseña';
  document.getElementById('formUsuario').reset();
  document.getElementById('estatusGroup').style.display  = 'none';
  document.getElementById('grupoUsername').style.display = 'block';
  document.getElementById('inputUsername').required = true;
  document.getElementById('modalOverlay').classList.add('activo');
}

// ---- MODAL: EDITAR ----
function abrirEditar(id) {
  const u = usuariosData.find(x => x.id == id);
  if (!u) return;
  modoEdicion = true;
  idEditando  = id;

  document.getElementById('modalTitulo').textContent   = `Editando: @${u.username}`;
  document.getElementById('modalSubtitulo').textContent = 'Deja el campo de contraseña vacío para no cambiarla.';
  document.getElementById('campoPassword').style.display = 'block';
  document.getElementById('labelPassword').textContent  = 'Nueva Contraseña (opcional)';
  document.getElementById('estatusGroup').style.display  = 'block';
  document.getElementById('grupoUsername').style.display = 'none';
  document.getElementById('inputUsername').required = false;

  document.getElementById('inputNombre').value  = u.nombre_completo;
  document.getElementById('inputRol').value     = u.rol_id;
  document.getElementById('inputEstatus').value = u.estatus;
  document.getElementById('inputPassword').value = '';

  document.getElementById('modalOverlay').classList.add('activo');
}

function cerrarModal() {
  document.getElementById('modalOverlay').classList.remove('activo');
}

// ---- GUARDAR (Crear o Editar) ----
async function guardarUsuario() {
  const nombre   = document.getElementById('inputNombre').value.trim();
  const username = document.getElementById('inputUsername').value.trim();
  const password = document.getElementById('inputPassword').value.trim();
  const rol_id   = parseInt(document.getElementById('inputRol').value);
  const estatus  = parseInt(document.getElementById('inputEstatus').value);

  if (!nombre || (!modoEdicion && !username) || isNaN(rol_id)) {
    mostrarToast('Completa todos los campos obligatorios.', 'error');
    return;
  }

  const payload = modoEdicion
    ? { id: idEditando, nombre_completo: nombre, rol_id, estatus, password }
    : { nombre_completo: nombre, username, password, rol_id };

  const url    = modoEdicion ? '../php/editar_usuario.php' : '../php/crear_usuario.php';
  const btnGuardar = document.getElementById('btnGuardar');
  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await resp.json();

    if (json.success) {
      cerrarModal();
      mostrarToast(json.message, 'exito');
      await cargarUsuarios();
    } else {
      mostrarToast(json.error || 'Error al guardar.', 'error');
    }
  } catch (e) {
    mostrarToast('Error de conexión con el servidor.', 'error');
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar';
  }
}

// ---- ELIMINAR ----
function confirmarEliminar(id, username) {
  if (!confirm(`⚠️ ¿Estás SEGURO de eliminar al usuario "@${username}" definitivamente?\n\nEsta acción es irreversible.`)) return;
  eliminarUsuario(id);
}

async function eliminarUsuario(id) {
  try {
    const resp = await fetch('../php/eliminar_usuario.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const json = await resp.json();
    if (json.success) {
      mostrarToast(json.message, 'exito');
      await cargarUsuarios();
    } else {
      mostrarToast(json.error || 'No se pudo eliminar.', 'error');
    }
  } catch (e) {
    mostrarToast('Error de conexión.', 'error');
  }
}

// ---- TOAST ----
function mostrarToast(msg, tipo = 'exito') {
  const t = document.getElementById('guToast');
  t.textContent = tipo === 'exito' ? '✓  ' + msg : '✕  ' + msg;
  t.className   = `gu-toast ${tipo} visible`;
  setTimeout(() => { t.classList.remove('visible'); }, 3500);
}
