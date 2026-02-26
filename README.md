# 📦 Inventario MyCard

Sistema web de gestión de inventario de equipos de cómputo y periféricos para **MyCard**. Permite registrar, consultar, filtrar y cambiar el estado de los equipos, con generación automática de códigos QR e impresión directa en impresora Brother QL-800.

---

## 📁 Estructura del Proyecto

```
Inventario_MyCard/
│
├── html/
│   ├── InventarioPCs.html         # Página principal del inventario
│   └── README.md                  # 📖 Documentación HTML
│
├── css/
│   ├── InventarioPCs.css          # Estilos del inventario
│   ├── Estilo.css                 # Estilos de la landing page
│   └── README.md                  # 📖 Documentación CSS
│
├── scripts/
│   ├── script.js                  # Lógica principal del frontend
│   └── README.md                  # 📖 Documentación JavaScript
│
├── python/
│   ├── codigoQR.py                # Generador masivo de QR
│   ├── generar_qr_unico.py        # Generador individual + impresión
│   └── README.md                  # 📖 Documentación Python
│
├── img/
│   └── logo_MyCard.jpeg           # Logo para los códigos QR
│
├── db.php                         # Conexión a MySQL
├── api_inventario.php             # API: obtener inventario
├── agregar_equipo.php             # API: agregar equipo
├── cambiar_estado.php             # API: cambiar estado
├── actualizar_ip.php              # Utilidad: actualizar URLs
├── verificar_urls.php             # Utilidad: verificar URLs
├── README_PHP.md                  # 📖 Documentación PHP
└── README.md                      # 📖 Este archivo (índice general)
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
2. Crear la base de datos `equipos_mycard` en phpMyAdmin.
3. Acceder a: `http://localhost/Inventario_MyCard/html/InventarioPCs.html`

### Credenciales de Administrador

| Campo      | Valor        |
| ---------- | ------------ |
| Usuario    | `admin`      |
| Contraseña | `MyCard2026` |

---

## 🛠️ Tecnologías

| Categoría     | Tecnología                         |
| ------------- | ---------------------------------- |
| Frontend      | HTML5, CSS3, JavaScript (Vanilla)  |
| Backend       | PHP 8.x                            |
| Base de Datos | MySQL (XAMPP)                      |
| QR            | Python 3, qrcode, Pillow           |
| Impresión     | PowerShell + Brother QL-800        |
| Fuentes       | Google Fonts (Bricolage Grotesque) |
| Iconos        | Font Awesome 6.4, Bootstrap Icons  |

---

## 📖 Documentación por Tecnología

| Tecnología | Archivo                                  |
| ---------- | ---------------------------------------- |
| HTML       | [`html/README.md`](html/README.md)       |
| CSS        | [`css/README.md`](css/README.md)         |
| JavaScript | [`scripts/README.md`](scripts/README.md) |
| PHP        | [`README_PHP.md`](README_PHP.md)         |
| Python     | [`python/README.md`](python/README.md)   |

---

_Documentación generada el 18 de febrero de 2026._
