# 🟩 Python — Documentación

## Archivos

| Archivo               | Descripción                                                  |
| --------------------- | ------------------------------------------------------------ |
| `codigoQR.py`         | Generador **masivo** de QR (todos los equipos de la BD)      |
| `generar_qr_unico.py` | Generador de QR **individual** + impresión en Brother QL-800 |

---

## ¿Qué es Python?

Python es un lenguaje de programación de **propósito general**, popular por su sintaxis limpia y legible. En este proyecto se usa para generar códigos QR y enviarlos a la impresora.

---

## Librerías Necesarias

```bash
pip install mysql-connector-python qrcode[pil] Pillow
```

| Librería                 | Uso                                                           |
| ------------------------ | ------------------------------------------------------------- |
| `mysql-connector-python` | Conectar con la base de datos MySQL                           |
| `qrcode`                 | Generar códigos QR                                            |
| `Pillow` (PIL)           | Manipular imágenes (redimensionar, dibujar texto, pegar logo) |

---

## `codigoQR.py` — Generador Masivo

Genera un código QR por **cada equipo** en la base de datos.

### Uso:

```bash
cd python
python codigoQR.py
```

### Flujo paso a paso:

#### 1. Conexión a MySQL

```python
import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="equipos_mycard"
)
cursor = db.cursor(dictionary=True)    # dictionary=True → filas como diccionarios
```

- **`cursor`** — Objeto que ejecuta consultas SQL y recorre resultados.
- **`dictionary=True`** — Las filas se devuelven como `{'id': 1, 'nombre': 'PC1'}` en vez de tuplas `(1, 'PC1')`.

#### 2. Consultar equipos

```python
cursor.execute("SELECT id, redireccion FROM equipos_pc")
resultados = cursor.fetchall()    # Obtiene TODAS las filas
```

- `fetchall()` devuelve una **lista de diccionarios**.
- `fetchone()` devuelve solo una fila.

#### 3. Generar el QR para cada equipo

```python
for fila in resultados:           # Recorre cada equipo
    pc_qr = fila['id']
    pc_redireccion = fila['redireccion']    # URL que contendrá el QR

    qr = qrcode.QRCode(
        version=1,                           # Tamaño (1 = más pequeño)
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # Máxima corrección
        box_size=2,                          # Tamaño de cada módulo en píxeles
        border=2,                            # Borde blanco alrededor
    )
    qr.add_data(pc_redireccion)              # Agrega la URL al QR
    qr.make(fit=True)                        # Ajusta el tamaño automáticamente
```

#### ¿Qué es `error_correction`?

Define cuánto del QR puede estar dañado y aún funcionar:

| Nivel        | Constante         | Corrección | Uso                       |
| ------------ | ----------------- | ---------- | ------------------------- |
| L (Low)      | `ERROR_CORRECT_L` | 7%         | QR más pequeño            |
| M (Medium)   | `ERROR_CORRECT_M` | 15%        | Balance                   |
| Q (Quartile) | `ERROR_CORRECT_Q` | 25%        | Buena resistencia         |
| H (High)     | `ERROR_CORRECT_H` | 30%        | Permite poner logo encima |

> Se usa `H` porque se pone el **logo de MyCard** en el centro del QR.

#### 4. Estilo personalizado con esquinas redondeadas

```python
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer
from qrcode.image.styledpil import StyledPilImage

img_qr = qr.make_image(
    image_factory=StyledPilImage,
    module_drawer=RoundedModuleDrawer()
)._img
```

- **`StyledPilImage`** → Permite personalizar el estilo visual del QR.
- **`RoundedModuleDrawer`** → Los módulos (cuadrados) tienen **esquinas redondeadas**.

#### 5. Incrustar el logo

```python
from PIL import Image

img_logo = Image.open("img/logo_MyCard.jpeg").convert("RGBA")

# Calcular tamaño del logo (25% del QR)
logo_size = min(img_qr.size[0], img_qr.size[1]) // 4
img_logo = img_logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

# Calcular posición centrada
pos = ((img_qr.size[0] - logo_size) // 2, (img_qr.size[1] - logo_size) // 2)

# Pegar el logo sobre el QR
img_qr.paste(img_logo, pos, img_logo)    # El tercer argumento es la máscara de transparencia
```

#### ¿Qué es `//` en Python?

**División entera** (sin decimales):

```python
7 / 2     # = 3.5  (división normal)
7 // 2    # = 3    (división entera)
```

#### ¿Qué es `.convert("RGBA")`?

Convierte la imagen al modo de color **RGBA**:

- **R** = Rojo, **G** = Verde, **B** = Azul, **A** = Alpha (transparencia)
- Se necesita para que el logo pueda tener transparencia al pegarlo.

#### ¿Qué es `Image.Resampling.LANCZOS`?

Es un algoritmo de redimensionado que produce la **mejor calidad**. Ideal para reducir imágenes.

#### 6. Agregar texto "ID X"

```python
from PIL import ImageDraw, ImageFont

draw = ImageDraw.Draw(background)
font = ImageFont.truetype("arial.ttf", 20)    # Fuente Arial, tamaño 20

text = f"ID {pc_qr}"
bbox = draw.textbbox((0, 0), text, font=font)    # Calcular dimensiones del texto
text_width = bbox[2] - bbox[0]
text_x = (qr_width - text_width) / 2             # Centrar horizontalmente
draw.text((text_x, 10), text, fill=(0, 0, 0), font=font)    # Dibujar texto negro
```

- **`ImageDraw`** — Permite dibujar sobre imágenes (texto, líneas, formas).
- **`textbbox()`** — Calcula el **bounding box** del texto (ancho y alto que ocupa).
- **`f"ID {pc_qr}"`** — f-string: forma de insertar variables en strings (como template literals en JS).

#### 7. Guardar la imagen

```python
nombre = f"ID_{pc_qr}.png"
background.save(nombre)
print(f"Código QR generado: {nombre}")
```

---

## `generar_qr_unico.py` — Generador Individual + Impresión

Genera un QR para **un solo equipo** y lo envía directamente a la **impresora Brother QL-800**.

### Uso:

```bash
python generar_qr_unico.py 5    # Genera e imprime QR del equipo con ID 5
```

### Diferencias con `codigoQR.py`:

| Característica      | `codigoQR.py`        | `generar_qr_unico.py`    |
| ------------------- | -------------------- | ------------------------ |
| Equipos             | Todos                | Uno (por argumento)      |
| Corrección de error | `ERROR_CORRECT_H`    | `ERROR_CORRECT_M`        |
| Estilo QR           | Esquinas redondeadas | Estándar (blanco/negro)  |
| Logo                | ✅ Sí                | ❌ No                    |
| DPI                 | Por defecto (72)     | 300 DPI                  |
| Impresión           | No                   | ✅ Sí (Brother QL-800)   |
| Archivo temporal    | Se conserva          | Se elimina tras imprimir |

### Conceptos adicionales:

#### `sys.argv` — Argumentos de línea de comandos

```python
import sys

# python generar_qr_unico.py 5
# sys.argv = ['generar_qr_unico.py', '5']
# sys.argv[0] = nombre del script
# sys.argv[1] = primer argumento = '5'

equipo_id = int(sys.argv[1])    # Convierte '5' (string) a 5 (entero)
```

#### Guardar con DPI alto

```python
background.save(nombre, dpi=(300, 300))    # 300 puntos por pulgada (calidad de impresión)
```

#### Impresión con PowerShell

```python
import subprocess

ps_script = f"""
Add-Type -AssemblyName System.Drawing
$printer = "Brother QL-800"
$image = [System.Drawing.Image]::FromFile("{full_path}")
$doc = New-Object System.Drawing.Printing.PrintDocument
$doc.PrinterSettings.PrinterName = $printer
$doc.Print()
"""

subprocess.run(["powershell", "-Command", ps_script], check=True)
```

- **`subprocess.run()`** — Ejecuta un comando externo desde Python.
- **`check=True`** — Si el comando falla, lanza una excepción.
- El script de PowerShell usa la API de .NET (`System.Drawing.Printing`) para enviar la imagen a la impresora.

#### Limpieza de archivos temporales

```python
import os
os.remove(nombre)    # Elimina el archivo PNG después de imprimir
```

---

## Resumen de Funciones y Librerías

| Módulo/Función              | Descripción                     |
| --------------------------- | ------------------------------- |
| `mysql.connector.connect()` | Conectar a MySQL                |
| `cursor.execute()`          | Ejecutar consulta SQL           |
| `cursor.fetchall()`         | Obtener todas las filas         |
| `cursor.fetchone()`         | Obtener una fila                |
| `qrcode.QRCode()`           | Crear objeto de código QR       |
| `qr.add_data()`             | Agregar datos (URL) al QR       |
| `qr.make_image()`           | Generar la imagen del QR        |
| `Image.open()`              | Abrir una imagen existente      |
| `Image.new()`               | Crear una imagen nueva vacía    |
| `image.resize()`            | Redimensionar imagen            |
| `image.paste()`             | Pegar una imagen sobre otra     |
| `image.save()`              | Guardar imagen a archivo        |
| `ImageDraw.Draw()`          | Crear objeto para dibujar       |
| `draw.text()`               | Dibujar texto sobre imagen      |
| `ImageFont.truetype()`      | Cargar una fuente tipográfica   |
| `subprocess.run()`          | Ejecutar comando externo        |
| `os.remove()`               | Eliminar archivo                |
| `sys.argv`                  | Argumentos de línea de comandos |

---

_📖 Ver también: [HTML README](../html/README.md) · [CSS README](../css/README.md) · [JavaScript README](../scripts/README.md) · [PHP README](../README_PHP.md)_
