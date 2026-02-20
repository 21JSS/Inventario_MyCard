import qrcode 
from PIL import Image, ImageDraw, ImageFont 
import sys
import os
import subprocess
from urllib.parse import urlparse 

if len(sys.argv) < 2:
    print("Error: Debes proporcionar un ID de equipo")
    sys.exit(1)

equipo_id = int(sys.argv[1])
pc_qr = equipo_id
# Función para conectar a la BD 
def obtener_datos_equipo(id_equipo):
    try:
        import mysql.connector
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="inventario_mycard"
        )
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, redireccion, encargado, departamento FROM equipos_pc WHERE id = %s", (id_equipo,))
        res = cursor.fetchone()
        db.close()
        return res
    except Exception as e:
        print(f"Error al conectar a la BD: {e}")
        return None

# Obtener datos de la base de datos
datos = obtener_datos_equipo(equipo_id)

if not datos:
    print(f"Error: No se encontró el equipo con ID {equipo_id} o error de conexión")
    sys.exit(1)

# Priorizar URL del argumento si existe, si no usar la de la BD
pc_redireccion = sys.argv[2] if len(sys.argv) >= 3 else datos['redireccion']
encargado_texto = datos['encargado'] or "N/A"
depto_texto = datos['departamento'] or "N/A"

if not pc_redireccion:
    print("Error: No se pudo obtener la URL de redirección")
    sys.exit(1)

ip_texto =urlparse(pc_redireccion).hostname


# --- CONFIGURACIÓN DEL QR ---
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_M,
    box_size=6, 
    border=1,  
)

qr.add_data(pc_redireccion)
qr.make(fit=True) 

img_qr = qr.make_image(fill_color="black", back_color="white").convert("RGBA")

qr_width, qr_height = img_qr.size
canvas_width = 244 
margin_top = 40   
margin_bottom = 40
new_height = qr_height + margin_top + margin_bottom 

# Crear lienzo blanco
background = Image.new('RGBA', (canvas_width, new_height), (255, 255, 255, 255))

x_offset = (canvas_width - qr_width) // 2
background.paste(img_qr, (x_offset, margin_top))

draw = ImageDraw.Draw(background)
try:
    font = ImageFont.truetype("arial.ttf", 30)
    font_small = ImageFont.truetype("arial.ttf", 30) 
except IOError:
    font = ImageFont.load_default()
    font_small = ImageFont.load_default()

# 1. ID 
text_id = f"MyC- {pc_qr:04d}"
bbox_id = draw.textbbox((0, 0), text_id, font=font)
x_id = (canvas_width - (bbox_id[2] - bbox_id[0])) // 2
draw.text((x_id, 10), text_id, fill=(0, 0, 0), font=font)

# 2. IP 
ip_y = qr_height + margin_top + 2
bbox_ip = draw.textbbox((0, 0), ip_texto, font=font)
x_ip = (canvas_width - (bbox_ip[2] - bbox_ip[0])) // 2
draw.text((x_ip, ip_y), ip_texto, fill=(0, 0, 0), font=font)


nombre = f"MyC-_{pc_qr:04d}.png"
background.save(nombre, dpi=(300, 300))


try:
    print(f"Enviando a Brother QL-800...")
    
    full_path = os.path.abspath(nombre)
    nombre_impresora = "Brother QL-800"
    
    ps_script = f"""
    Add-Type -AssemblyName System.Drawing
    $printer = "{nombre_impresora}"
    $imagePath = "{full_path}"
    $image = [System.Drawing.Image]::FromFile($imagePath)
    
    $doc = New-Object System.Drawing.Printing.PrintDocument
    $doc.PrinterSettings.PrinterName = $printer
    
    # Definimos el tamaño del papel basado en la imagen generada
    $w = 244 
    $h = [int](($image.Height / 300) * 100)
    
    $doc.DefaultPageSettings.PaperSize = New-Object System.Drawing.Printing.PaperSize("Custom", $w, $h)
    $doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0,0,0,0)
    $doc.OriginAtMargins = $false

    $doc.add_PrintPage({{
        # CAMBIO CLAVE: Forzamos la posición X a 0 para eliminar el hueco izquierdo
        $x = 0
        $y = 0
        
        $imgWidthInDoc = ($image.Width / 300) * 100
        $imgHeightInDoc = ($image.Height / 300) * 100
        
        $rect = New-Object System.Drawing.Rectangle($x, $y, [int]$imgWidthInDoc, [int]$imgHeightInDoc)
        $_.Graphics.DrawImage($image, $rect)
        $_.HasMorePages = $false
    }})
    $doc.Print()
    $image.Dispose()
    """
    
    subprocess.run(["powershell", "-Command", ps_script], check=True)
    print("¡Impresión enviada!")
    
    # os.remove(nombre)

except Exception as e:
    print(f"Error al imprimir: {e}")
