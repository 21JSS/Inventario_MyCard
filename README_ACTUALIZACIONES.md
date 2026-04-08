# Actualizaciones del Sistema de Inventario - MyCard
> **Rama Actual**: `MyCardInventario_v1.2`
> **Última Modificación Mayor**: 07 de Abril - Implementación RBAC y Arquitectura Modular.

Este documento enumera los cambios principales que se han ido integrando para llevar la plataforma de un "prototipo funcional" a un **Software de Gestión Empresarial escalable**.

---

## 🏗️ 1. Rediseño de Arquitectura de Código (Frontend)
El código de la aplicación (que anteriormente residía en un archivo monolítico `app.js` de ~1,000 líneas) fue factorizado bajo estándares de *Separation of Concerns* (Separación de Funciones). 

**Nuevos Módulos Implementados:**
*   **`variables_globales.js`**: Estado in-memory de la App *(Inventarios, IDs, Filtros)*.
*   **`utilidades.js`**: Elementos gráficos genéricos y utilidades de Strings *(Formatos de IP, Scroll de Modales, Alertas)*.
*   **`peticiones_bd.js`**: Capa de Servicios. Maneja todas las llamadas asíncronas `fetch()` al servidor PHP.
*   **`interfaz_inventario.js`**: Renderizado dinámico del DOM de la tabla, tarjetas y filtro visual (Data Tables).
*   **`formularios_modales.js`**: Reacciones de la pantalla frente a formularios, como esconder paneles si una IP es agregada manual o dinámicamente.
*   **`autenticacion.js`**: Seguridad activa por botones, "ver contraseña" y control de destrucción de Sesión (`cerrarSesion()`).

> **Impacto**: `app.js` redujo su tamaño de **1000 a 20 líneas**, convirtiéndose únicamente en el archivo enrutador de arranque del sistema (`entry-point`).

---

## 🛡️ 2. Sistema de Autenticación Basada en Roles (RBAC)
Se eliminó la restricción de "contraseña global incrustada en código" (`mc2026`) que permitía modificaciones cruzadas mediante pop-ups, reemplazándose por un Flujo Administrativo Formal.

### 2.1 Flujo General Frontend
1. **`login.html`**: Pantalla inicial obligatoria para cualquier interacción del sistema. Conecta los credenciales con el nuevo `login.php`.
2. **`check_session.php`**: Las API públicas ahora se escudan detrás de este archivo; si alguien sin sesión trata de obtener un catálogo o modificar un equipo, el servidor rechazará la solictud devolviendo un error `401 Unauthorized`.
3. **Restricción de Interfaz Dinámica**: 
   Dependiendo del Perfil de Acceso, los botones de `"Agregar Equipo"` o el modal de `"Cambiar Estado"` se esconderán del Frontend.

### 2.2 Reestructuración de Base de Datos
Se incorporaron 3 tablas nuevas interconectadas para sostener la lógica:
*   **`roles`**: Contiene la definición base y jerarquía:
    `1. Admin del Sistema`, `2. Técnico`, `3. Consulta`, `4. Auditor`.
*   **`usuarios`**: Claves con hash iterado avanzado (`Bcrypt`) protegiendo el `password_hash` del Administrador contra extracciones.
*   **`logs_auditoria`**: Bitácora inmutable exigida por el perfil Supervisor/Auditor.

---

## 📡 3. Base de Datos Centralizada con Patrón POO (Backend)
Scripts vitales en producción (`agregar_equipo.php` y `cambiar_estado.php`) copiaban el mismo bloque de algoritmos para transformar la IP con `ip2long` y corroborar colisiones intra-departamentales. 
*   **[Solución]**: Se generó una clase estática orientada a objetos en PHP llamada **`Validator_IP.php`**, la cual exporta el método `ValidatorIP::validarAsignacionIP()`. Reduciendo los microservicios, optimizando validaciones en un solo paso y reduciendo el riesgo de errores en cadena.

---

## 👁️ 4. Visor de Auditoría (Perfil Supervisor)
Alineado con el esquema RBAC recién instalado, se agregó:
*   **`visor_logs.html`**: Un panel de visualización tabular donde los administradores y auditores (y nadie más) pueden ver una lectura histórica de las modificaciones: 
    * *¿Quién agregó el Equipo X?*
    * *¿Cuándo el equipo Z se marcó como Oculto y por qué usuario?*

*Estas modificaciones sitúan al proyecto listo para una fase productiva en entornos que requieran protección de datos entre varios departamentos o técnicos locales.*
