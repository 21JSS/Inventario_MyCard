# 📦 Inventario MyCard

Sistema web de gestión de inventario de equipos de cómputo y periféricos para **MyCard**. Permite registrar, consultar, filtrar, editar y cambiar el estado de los equipos, con un robusto sistema de seguridad, auditoría e impresión directa en impresoras de etiquetas.

---

## 🌟 Novedades y Características Recientes

A lo largo del desarrollo, el sistema ha escalado de un inventario simple a una plataforma empresarial segura. Estas son las últimas implementaciones clave:

- **🔐 Seguridad RBAC (Role-Based Access Control):** 
  Se migró de una contraseña dura general a un sistema multiusuario con base de datos. Existen 4 perfiles con distintos permisos (Administrador, Técnico, De Consulta y Auditor).
- **🛡️ Contraseñas Encriptadas:**
  Las contraseñas de todos los usuarios ahora utilizan un algoritmo avanzado de *Hashing* inverso (Bcrypt).
- **📜 Visor de Logs de Auditoría:** 
  Las acciones de todos los usuarios (inicios de sesión, cambios de estado, adiciones de equipo, y bajas de sistema) son vigiladas y guardadas. Los Supervisores pueden consultar la bitácora directamente desde la web (`visor_logs.html`).
- **❌ Eliminación Permanente Segura:**
  Inclusión de borrado de equipos de la base de datos exclusiva para el Administrador (Moderador), con advertencias personalizadas para evitar incidentes y rastreo en log de la transacción.
- **📱 Responsive Moderno (UI/UX):** 
  Mejoras sustanciales de diseño con *Flexbox* y *CSS Grid* para adaptar los paneles principales y tablas en dispositivos móviles de cualquier tamaño sin solapamientos.

---

## 📁 Estructura del Proyecto

```
Inventario_MyCard/
│
├── html/
│   ├── index.html                 # App Principal (Protegida por sesión)
│   ├── login.html                 # Puerta de enlace (Autenticación)
│   ├── visor_logs.html            # Consola del Auditor / Historial
│   └── html_qr.html               # Lector y decodificador por cámara
│
├── css/
│   ├── style_principal.css        # Diseño central y variables del entorno
│   ├── login.css                  # Estilos para inicio de sesión
│   └── visor_logs.css             # Estilos independientes de la tabla log
│
├── scripts/
│   ├── app.js                     # Punto de entrada / RBAC Rules Hiding
│   ├── autenticacion.js           # Inicio y Cierre de sesión JS Fetch
│   ├── interfaz_inventario.js     # Lógica central del Fronted interactivo
│   ├── peticiones_bd.js           # Capa de transporte para llamar a PHP
│   └── ...                        
│
├── php/
│   ├── db.php                     # Conexión Segura MySQL
│   ├── check_session.php          # Filtro y validación de cookies de rol
│   ├── login.php                  # Endpoint de comparación Bcrypt
│   ├── api_logs.php               # Escritura / Lectura de Bitácora
│   ├── eliminar_equipo.php        # Transaction segura HARD DELETE
│   └── ...
│
├── python/
│   ├── codigoQR.py                # Generador masivo de QR
│   ├── generar_qr_unico.py        # Generador individual + impresión
│   └── ...
│
├── GUIA_CREACION_USUARIOS.md      # 📖 Documentación de Altas RBAC
└── README.md                      # 📖 Este documento principal
```

---

## ⚙️ Requisitos Previos

| Herramienta            | Versión recomendada   |
| ---------------------- | --------------------- |
| XAMPP (Apache + MySQL) | 8.x                   |
| PHP                    | 8.x                   |
| Python                 | 3.10+                 |
| Navegador              | Chrome, Edge, Firefox |
| Impresora (opcional)   | Brother QL-800        |

---

## 🚀 Cómo Ejecutar

1. Abrir **XAMPP** → Iniciar **Apache** y **MySQL**.
2. Crear la base de datos `inventario_mycard` en tu phpMyAdmin.
3. Importar tus tablas SQL (asegurate de tener creadas las tablas de `equipos_pc`, `usuarios`, `logs_auditoria`).
4. Acceder al sistema por medio del endpoint: 
   `http://localhost/Inventario_MyCard/html/login.html`

### Creación de Usuarios Manual
Si acabas de instalar el sistema, deberás crear tu primer usuario Administrador desde el motor de base de datos a fin de poder loguearte. Para ver los pasos correctos de encriptado lee el archivo [`GUIA_CREACION_USUARIOS.md`](GUIA_CREACION_USUARIOS.md).

---

## 🛠️ Tecnologías Empleadas

| Categoría     | Tecnología                                       |
| ------------- | -------------------------------------------------|
| Frontend      | HTML5, CSS3 Moderno (Flex/Grid), ES6 JavaScript. |
| Fetching      | Fetch API (Promesas) / Asincronía.               |
| Backend       | PHP 8.x (Endpionts estilo REST / JSON Content).  |
| Seguridad     | Manejo de Sesiones PHP_SESSION y bcrypt.         |
| Base de Datos | MySQL (Consultas Preparadas `bind_param()`).     |
| QR            | Python 3, qrcode, Pillow                         |
| Impresión     | PowerShell + Brother QL-800                      |

---

*Desarrollado para la administración eficiente de recursos de IT.*
