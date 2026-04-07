# Documentación de Actualizaciones - Inventario MyCard

El siguiente documento detalla las nuevas funcionalidades, correcciones de errores y mejoras implementadas recientemente en el Sistema de Gestión de Inventario MyCard. Esta información está estructurada para ser añadida a la documentación técnica de desarrollo.

---

## 1. Módulo de Escaneo y Generación de Código QR

Se solventaron problemas críticos para asegurar la compatibilidad universal de la cámara, en especial con dispositivos móviles.

### 1.1. Seguridad de Cámara y Redirección HTTPS
- **Problema originario:** Los navegadores móviles (Chrome/Safari) bloquean el acceso al hardware de la cámara (`navigator.mediaDevices.getUserMedia`) si el sitio web no se sirve bajo un protocolo seguro (`https://`).
- **Solución implementada:** Se integró un script de autoevaluación en `html/html_qr.html` que detecta si el protocolo actual es `http:`. En caso afirmativo, fuerza una recarga bajo `https:` garantizando que los permisos de cámara siempre puedan ser solicitados al usuario.
- **Manejo de Errores (UI):** Se actualizó `services/scanner_qr.js` para capturar errores como `NotAllowedError` (permisos denegados) o `NotFoundError` (sin cámara), mostrando un mensaje amigable en pantalla para guiar al usuario.

### 1.2. Generación Interna del QR
- **Corrección de Rutas Analíticas:** Al guardar un equipo nuevo en `php/agregar_equipo.php`, la URL incrustada dentro del código QR apuntaba erróneamente a `php/index.php`. Se corrigió para que el QR redirija a la vista frontal correcta usando la IP dinámica vinculada a `html/index.html?id=[ID_DEL_EQUIPO]`.
- **Integración con Python:** Se rectificó la ejecución en segundo plano para mandar a llamar obligatoriamente al archivo de la lógica QR establecido en el proyecto (`code_qr.py`).

---

## 2. Bases de Datos (Tracking Temporal)

Se introdujo trazabilidad de tiempo de vida de los equipos para habilitar la reportería cronológica.

### 2.1. Columna de Creación Automática
- **Alteración de Estructura:** Se añadió una nueva columna `fecha_creacion` (tipo `DATETIME`) a la tabla `equipos_pc` de la base de datos MySQL.
- **Automatización Back-End:** En lugar de requerir que el administrador introduzca la fecha manualmente, la consulta SQL (`INSERT INTO`) en `php/agregar_equipo.php` fue modificada para invocar automáticamente la función nativa `NOW()` de MySQL. Esto sella el tiempo extracto del servidor en cada nuevo equipo.

---

## 3. Módulo Avanzado de Reportes (ExcelJS)

El antiguo sistema, el cual generaba un archivo `.csv` con formato básico que detonaba advertencias de seguridad de extensión engañosa ("Archivo dañado o formato no válido"), ha sido refactorizado por completo.

### 3.1. Interfaz Gráfica (Modal de Filtros)
En `html/index.html`, al dar clic en **Exportar a Excel**, ahora emerge un Modal con diseño moderno de chips seleccionables que permite cruzar de 1 a 3 filtros distintos antes de la descarga:

1.  **Filtro de Disponibilidad:** Para extraer un reporte del estatus físico ("Todos", "Disponibles", "Ocupados").
2.  **Filtro Cronológico:** Integrado a la nueva columna y función de fechas. Opciones temporales relativas: ("Última semana", "Último mes", "Últimos 3 meses", o "Historico completo").
3.  **Filtro Departamental Exhaustivo:** Carga dinámica con la tabla `departamentos`. Se garantizó que **todos** los departamentos existentes en la base de datos (e.g. *Perso*, *Oficina*) se impriman como botón, incluso en casos donde el departamento aún tenga cero (0) equipos asignados, asegurando consultas limpias.
4. **Validación en Tiempo Real:** Texto inteligente en el modal que indica previamente cuántos equipos formarán parte del reporte según los chips clicados.

### 3.2. Motor de Exportación XLSX Nativo
Se removió el desarrollo manual de `.csv / .xls` emulados para integrar por medio de CDN de alto rendimiento la biblioteca **ExcelJS** en la lógica de `scripts/app.js`.

-   **Archivos Protegidos y Seguros:** Se generan nativamente en binario estándar abierto (`SpreadsheetML .xlsx`), eliminando por completo las alertas de bloqueo de seguridad "Extension Hardening" de Microsoft Office.
-   **Diseño Gráfico Incrustado en las Celdas:**
    *   Generación de fila de Mega Título color marino con metadatos incrustados al reporte (fecha generada, filtros que fueron aplicados al momento del corte y total de registros exportados).
    *   Formato de tabla rayada ("Zebra styling") en colores fríos corporativos con fila de cabecera azul (#086cee) y texto blanco en Negritas.
    *   Coloración de Chips Digitales nativos de Excel para la columna "Estado" (celdas con fondo rojo arcilla y texto terracota y verde oscuro sobre turquesa) lo que optimiza la legibilidad ejecutiva.
- **Limpieza Estructural:** Columnas irrelevantes ajenas a presentación de gerencia (como la IP de inicio/fin de red de un departamento entero) fueron desestimadas para evitar suciedad en el documento final.
- **Nomenclatura Responsiva:** Se desarrolló semántica del nombre de archivo. Ejemplo automático: `inventario_mycard_disponibles_mes_perso_2026-04-07.xlsx`
