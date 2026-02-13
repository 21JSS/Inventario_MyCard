import mysql.connector
import qrcode 
from PIL import Image, ImageDraw, ImageFont 
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer
from qrcode.image.styledpil import StyledPilImage
import sys

# Verificar que se pasó un ID como argumento
if len(sys.argv) < 2:
    print("Error: Debes proporcionar un ID de equipo")
    sys.exit(1)

equipo_id = int(sys.argv[1])

# Conectar a la base de datos
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="equipos_mycard"
)
cursor = db.cursor(dictionary=True)

# Obtener solo el equipo específico
cursor.execute("SELECT id, redireccion FROM equipos_pc WHERE id = %s", (equipo_id,))
resultado = cursor.fetchone()

if not resultado:
    print(f"Error: No se encontró el equipo con ID {equipo_id}")
    sys.exit(1)

pc_qr = resultado['id']
pc_redireccion = resultado['redireccion']


qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=3, 
    border=1,  
)

qr.add_data(pc_redireccion)
qr.make(fit=True) 

img_qr = qr.make_image(image_factory=StyledPilImage, module_drawer=RoundedModuleDrawer())._img

img_logo = Image.open("img/logo_MyCard.jpeg").convert("RGBA")
logo_size = min(img_qr.size[0], img_qr.size[1]) // 4
img_logo = img_logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
pos = ((img_qr.size[0] - logo_size) // 2, (img_qr.size[1] - logo_size) // 2)
img_qr.paste(img_logo, pos, img_logo)


qr_width, qr_height = img_qr.size
margin_top = 20 
new_height = qr_height + margin_top + 10

canvas_width = 400
background = Image.new('RGBA', (canvas_width, new_height), (255, 255, 255, 255))

x_offset = (canvas_width - qr_width) // 2
background.paste(img_qr, (x_offset, margin_top))

draw = ImageDraw.Draw(background)
try:
    font = ImageFont.truetype("arial.ttf", 12) 
except IOError:
    font = ImageFont.load_default()

text = f"ID {pc_qr}"
bbox = draw.textbbox((0, 0), text, font=font)
text_x = (canvas_width - (bbox[2] - bbox[0])) / 2
draw.text((text_x, 5), text, fill=(0, 0, 0), font=font)

nombre = f"ID_{pc_qr}.png"
background.save(nombre)
print(f"Código QR generado: {nombre}")

try:
    import subprocess
    import os
    print(f"Buscando centro en Brother QL-800...")
    
    full_path = os.path.abspath(nombre)
    nombre_impresora = "Brother QL-800"
    
    ps_script = f"""
    Add-Type -AssemblyName System.Drawing
    $printer = "{nombre_impresora}"
    $imagePath = "{full_path}"
    $image = [System.Drawing.Image]::FromFile($imagePath)
    
    $doc = New-Object System.Drawing.Printing.PrintDocument
    $doc.PrinterSettings.PrinterName = $printer
    
    # 244 es el ancho estándar para cinta de 62mm
    $w = 244 
    $h = [int](($image.Height / $image.VerticalResolution) * 100) + 20 # +20 para margen de seguridad
    
    $doc.DefaultPageSettings.PaperSize = New-Object System.Drawing.Printing.PaperSize("Custom", $w, $h)
    $doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0,0,0,0)

    $doc.add_PrintPage({{
        # Calcular centro horizontal automático
        $printableWidth = $_.PageSettings.PrintableArea.Width
        $imgWidthInDoc = ($image.Width / $image.HorizontalResolution) * 100
        $x = ($printableWidth - $imgWidthInDoc) / 2
        
        $_.Graphics.DrawImage($image, [int]$x, 10)
    }})
    $doc.Print()
    $image.Dispose()
    """
    
    subprocess.run(["powershell", "-Command", ps_script], check=True)
    print("¡Etiqueta enviada al centro con éxito!")
except Exception as e:
    print(f"Error al intentar imprimir: {e}")
# ----------------------------------------------------

db.close()
