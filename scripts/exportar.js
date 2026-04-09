
// Este archivo maneja todo lo relacionado a la exportación de manera modular

const filtrosExport = { estado: "todos", fecha: "todos", depto: "todos" };

// Función de inicialización para inyectar el HTML del modal
document.addEventListener("DOMContentLoaded", () => {
  fetch('modal_exportar.html')
    .then(response => response.text())
    .then(data => {
      document.body.insertAdjacentHTML('beforeend', data);


      const btnCerrar = document.querySelector("#modalFiltrosExport .close");
      if (btnCerrar) btnCerrar.addEventListener("click", cerrarModalFiltros);


      const modal = document.getElementById("modalFiltrosExport");
      if (modal) {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) cerrarModalFiltros();
        });
      }
    })
    .catch(err => console.error('Error al cargar el modal de exportación:', err));
});

/** Abre el modal de filtros de exportación */
function abrirModalFiltros() {
  if (inventario.length === 0) {
    alert("No hay datos en el inventario para exportar.");
    return;
  }

  // Reiniciar filtros
  filtrosExport.estado = "todos";
  filtrosExport.fecha = "todos";
  filtrosExport.depto = "todos";

  document.querySelectorAll(".chip").forEach((c) => c.classList.remove("chip-active"));
  document.querySelectorAll(".chip[data-value='todos']").forEach((c) => c.classList.add("chip-active"));

  // Cargar departamentos desde departamentosDB (todos los de la BD)
  const chipsDepto = document.getElementById("chips-depto");
  if (chipsDepto) {
    const btnTodos = chipsDepto.querySelector("[data-value='todos']");
    chipsDepto.innerHTML = "";
    if (btnTodos) { btnTodos.className = "chip chip-active"; chipsDepto.appendChild(btnTodos); }

    const fuente = departamentosDB.length > 0
      ? departamentosDB.map((d) => ({ nombre: d.nombre, ip_inicio: d.ip_inicio, ip_fin: d.ip_fin }))
      : [...new Map(inventario.filter(i => i.departamento).map(i => [i.departamento, { nombre: i.departamento, ip_inicio: i.depto_ip_inicio, ip_fin: i.depto_ip_fin }])).values()];

    fuente.forEach((d) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.dataset.value = d.nombre;
      const ipLabel = d.ip_inicio && d.ip_fin
        ? `<span class="chip-ip">${d.ip_inicio} – ${d.ip_fin}</span>`
        : "";
      btn.innerHTML = `🏢 ${d.nombre}${ipLabel}`;
      btn.onclick = function () { seleccionarChip("depto", this); };
      chipsDepto.appendChild(btn);
    });
  }

  actualizarPreviewFiltros();
  const modal = document.getElementById("modalFiltrosExport");
  if (modal) { modal.style.display = "flex"; bloquearScrollFondo(); }
}

/** Cierra el modal de filtros */
function cerrarModalFiltros() {
  const modal = document.getElementById("modalFiltrosExport");
  if (modal) { modal.style.display = "none"; restaurarScrollFondo(); }
}

/** Selecciona un chip y actualiza filtrosExport */
function seleccionarChip(grupo, el) {
  const contenedor = el.closest(".filtro-chips");
  if (contenedor) contenedor.querySelectorAll(".chip").forEach((c) => c.classList.remove("chip-active"));
  el.classList.add("chip-active");
  filtrosExport[grupo] = el.dataset.value;
  actualizarPreviewFiltros();
}

/** Aplica los filtros al inventario */
function aplicarFiltrosExport() {
  const ahora = new Date();
  let cutoff = null;
  if (filtrosExport.fecha === "semana") { cutoff = new Date(ahora); cutoff.setDate(ahora.getDate() - 7); }
  else if (filtrosExport.fecha === "mes") { cutoff = new Date(ahora); cutoff.setMonth(ahora.getMonth() - 1); }
  else if (filtrosExport.fecha === "trimestre") { cutoff = new Date(ahora); cutoff.setMonth(ahora.getMonth() - 3); }

  return inventario.filter((item) => {
    // Filtro disponibilidad (1=disponible, 0=ocupada)
    if (filtrosExport.estado === "disponible" && item.estado != 1) return false;
    if (filtrosExport.estado === "ocupada" && item.estado != 0) return false;

    // Filtro por fecha
    if (cutoff) {
      if (!item.fecha_creacion) return false;
      if (new Date(item.fecha_creacion) < cutoff) return false;
    }

    // Filtro por departamento
    if (filtrosExport.depto !== "todos" && (item.departamento || "") !== filtrosExport.depto) return false;

    return true;
  });
}

/** Actualiza el contador de preview */
function actualizarPreviewFiltros() {
  const resultado = aplicarFiltrosExport();
  const conteoEl = document.getElementById("filtro-conteo");
  if (conteoEl) conteoEl.textContent = resultado.length;
  const previewEl = document.getElementById("filtro-preview");
  if (previewEl) previewEl.className = resultado.length === 0 ? "filtro-preview filtro-preview-vacio" : "filtro-preview";
  const btnConfirmar = document.getElementById("btnConfirmarExport");
  if (btnConfirmar) { btnConfirmar.disabled = resultado.length === 0; btnConfirmar.style.opacity = resultado.length === 0 ? "0.5" : "1"; }
}

/** Genera y descarga el reporte Excel (.xlsx) nativo y estilizado usando ExcelJS */
async function ejecutarExportFiltrado() {
  const datos = aplicarFiltrosExport();
  if (datos.length === 0) { alert("No hay registros que coincidan con los filtros."); return; }

  // Variables descriptivas
  const hoyStr = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
  const filtroEstadoLabel = filtrosExport.estado === "disponible" ? "Disponibles" : filtrosExport.estado === "ocupada" ? "Ocupadas" : "Todos";
  const filtroFechaLabel = filtrosExport.fecha === "semana" ? "Última semana" : filtrosExport.fecha === "mes" ? "Último mes" : filtrosExport.fecha === "trimestre" ? "Últimos 3 meses" : "Todo el tiempo";
  const filtroDeptoLabel = filtrosExport.depto !== "todos" ? filtrosExport.depto : "Todos los departamentos";

  // Verificar si ExcelJS está cargado
  if (typeof ExcelJS === "undefined") {
    alert("Error: No se pudo cargar la librería exportadora.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Inventario MyCard";
  workbook.created = new Date();

  // Crear una hoja de cálculo
  const worksheet = workbook.addWorksheet("Inventario");

  // Definir columnas y anchos (en ancho de carácter)
  worksheet.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "Nombre", key: "nombre", width: 25 },
    { header: "Tipo", key: "tipo", width: 12 },
    { header: "Marca", key: "marca", width: 15 },
    { header: "Modelo", key: "modelo", width: 20 },
    { header: "Encargado", key: "encargado", width: 20 },
    { header: "Departamento", key: "departamento", width: 18 },
    { header: "Área", key: "area", width: 18 },
    { header: "Descripción", key: "descripcion_equipo", width: 35 },
    { header: "IP Asignada", key: "ip_asignada", width: 18 },
    { header: "Estado", key: "estado", width: 15 },
    { header: "Fecha de Registro", key: "fecha", width: 18 }
  ];

  // Insertar filas principales: Título y Metadatos
  worksheet.spliceRows(1, 0,
    ["📋 Inventario de Equipos — MyCard"],
    [`Generado: ${hoyStr}  |  Estado: ${filtroEstadoLabel}  |  Período: ${filtroFechaLabel}  |  Departamento: ${filtroDeptoLabel}  |  Total: ${datos.length} equipo(s)`],
    []
  );

  // Dar estilo al título
  worksheet.mergeCells('A1:L1');
  const titleRow = worksheet.getRow(1);
  titleRow.height = 30;
  titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0a1628' } };
  titleRow.getCell(1).font = { color: { argb: 'FFFFFFFF' }, size: 16, bold: true, name: 'Calibri' };
  titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  // Dar estilo a los metadatos
  worksheet.mergeCells('A2:L2');
  const metaRow = worksheet.getRow(2);
  metaRow.height = 20;
  metaRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3a5f' } };
  metaRow.getCell(1).font = { color: { argb: 'FFa8caff' }, size: 10, name: 'Calibri' };
  metaRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  // Dar estilo a los encabezados de tabla (Fila 4)
  const headerRow = worksheet.getRow(4);
  headerRow.height = 20;
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF086cee' } };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11, name: 'Calibri' };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFc9d6e8' } },
      left: { style: 'thin', color: { argb: 'FFc9d6e8' } },
      bottom: { style: 'thin', color: { argb: 'FFc9d6e8' } },
      right: { style: 'thin', color: { argb: 'FFc9d6e8' } }
    };
  });

  // Agregar los datos
  datos.forEach((item, index) => {
    const estadoTexto = item.estado == 1 ? "Disponible" : item.estado == 0 ? "Ocupada" : (item.estado || "—");
    const fecha = item.fecha_creacion ? item.fecha_creacion.split(" ")[0] : "—";

    const row = worksheet.addRow({
      id: formatearId(item.id),
      nombre: item.nombre || "—",
      tipo: item.tipo || "—",
      marca: item.marca || "—",
      modelo: item.modelo || "—",
      encargado: item.encargado || "—",
      departamento: (item.departamento || "—").toUpperCase(),
      area: item.area || "—",
      descripcion_equipo: item.descripcion_equipo || "—",
      ip_asignada: item.ip_asignada || "Sin IP",
      estado: estadoTexto,
      fecha: fecha
    });

    const isEven = index % 2 === 0;
    const bgColor = isEven ? 'FFFFFFFF' : 'FFeef4ff'; // Blanco / Azul clarito

    row.eachCell((cell, colNumber) => {
      // Estilo base
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.font = { size: 11, name: 'Calibri' };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFc9d6e8' } }, left: { style: 'thin', color: { argb: 'FFc9d6e8' } },
        bottom: { style: 'thin', color: { argb: 'FFc9d6e8' } }, right: { style: 'thin', color: { argb: 'FFc9d6e8' } }
      };

      // Estilos específicos de columnas
      if (colNumber === 1) { // ID
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { bold: true, color: { argb: 'FF374151' } };
      }
      else if (colNumber === 2 || colNumber === 7) { // Nombre, Departamento
        cell.font = { bold: true };
      }
      else if (colNumber === 9) { // Descripción
        cell.font = { size: 10, color: { argb: 'FF4b5563' } };
      }
      else if (colNumber === 10) { // IP Asignada
        cell.font = { bold: true, color: { argb: 'FF1d4ed8' }, name: 'Consolas' };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
      else if (colNumber === 11) { // Estado
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (item.estado == 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFd1fae5' } };
          cell.font = { bold: true, color: { argb: 'FF065f46' } };
        } else if (item.estado == 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFfef3c7' } };
          cell.font = { bold: true, color: { argb: 'FF92400e' } };
        }
      }
      else if (colNumber === 12) { // Fecha
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { color: { argb: 'FF6b7280' } };
      }
    });
  });

  // Congelar paneles para que el header baje con el usuario
  worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4 }];

  // Generar y descargar el archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

  const partes = ["inventario_mycard"];
  if (filtrosExport.estado !== "todos") partes.push(filtrosExport.estado === "disponible" ? "disponibles" : "ocupados");
  if (filtrosExport.fecha !== "todos") partes.push(filtrosExport.fecha);
  if (filtrosExport.depto !== "todos") partes.push(filtrosExport.depto.replace(/\s+/g, "_").toLowerCase());
  partes.push(new Date().toISOString().split("T")[0]);

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${partes.join("_")}.xlsx`;
  a.click();
  URL.revokeObjectURL(a.href);

  cerrarModalFiltros();
}

/** Alias para compatibilidad con botón original */
function exportarDatos() { abrirModalFiltros(); }
