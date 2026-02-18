import qrcode 
from PIL import Image, ImageDraw, ImageFont 
import sys
import os
import subprocess

if len(sys.argv) < 2:
    print("Error: Debes proporcionar un ID de equipo")
    sys.exit(1)

equipo_id = int(sys.argv[1])
pc_qr = equipo_id
pc_redireccion = None


if len(sys.argv) >= 3:
    pc_redireccion = sys.argv[2]
    print(f"Usando URL proporcionada: {pc_redireccion}")
else:
    # Solo importamos mysql-connector 
    try:
        import mysql.connector
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="inventario_mycard"
        )
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, redireccion FROM equipos_pc WHERE id = %s", (equipo_id,))
        resultado = cursor.fetchone()
        
        if not resultado:
            print(f"Error: No se encontró el equipo con ID {equipo_id}")
            db.close()
            sys.exit(1)
            
        pc_redireccion = resultado['redireccion']
        db.close()
    except Exception as e:
        print(f"Error al conectar a la BD: {e}")
        sys.exit(1)

if not pc_redireccion:
    print("Error: No se pudo obtener la URL de redirección")
    sys.exit(1)

# --- CONFIGURACIÓN DEL QR ---
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_M,
    box_size=6, 
    border=1,  # Reducido al mínimo para ganar espacio a la izquierda
)

qr.add_data(pc_redireccion)
qr.make(fit=True) 

img_qr = qr.make_image(fill_color="black", back_color="white").convert("RGBA")

qr_width, qr_height = img_qr.size
canvas_width = 244 # Ancho para cinta de 62mm
margin_top = 40    # Ajuste para que no quede muy pegado arriba
new_height = 240   # Altura más compacta para ahorrar cinta

# Crear lienzo blanco
background = Image.new('RGBA', (canvas_width, new_height), (255, 255, 255, 255))


x_offset = 0 
background.paste(img_qr, (x_offset, margin_top))

draw = ImageDraw.Draw(background)
try:
    font = ImageFont.truetype("arial.ttf", 20)
except IOError:
    font = ImageFont.load_default()

text = f"MyC- {pc_qr:04d}"

# Centrar el texto 
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
x_centered = (canvas_width - text_width) // 2
draw.text((x_centered, 10), text, fill=(0, 0, 0), font=font)

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
    
    os.remove(nombre)

except Exception as e:
    print(f"Error al imprimir: {e}")
