import mysql.connector
import qrcode 
from PIL import Image, ImageDraw, ImageFont 
import sys

if len(sys.argv) < 2:
    print("Error: Debes proporcionar un ID de equipo")
    sys.exit(1)

equipo_id = int(sys.argv[1])
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="equipos_mycard"
)
cursor = db.cursor(dictionary=True)

cursor.execute("SELECT id, redireccion FROM equipos_pc WHERE id = %s", (equipo_id,))
resultado = cursor.fetchone()

if not resultado:
    print(f"Error: No se encontró el equipo con ID {equipo_id}")
    sys.exit(1)

pc_qr = resultado['id']
pc_redireccion = resultado['redireccion']


qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_M,
    box_size=6, 
    border=4,  
)

qr.add_data(pc_redireccion)
qr.make(fit=True) 

img_qr = qr.make_image(fill_color="black", back_color="white").convert("RGBA")


qr_width, qr_height = img_qr.size
canvas_width = 244 
margin_top = 25 
new_height = 350 

background = Image.new('RGBA', (canvas_width, new_height), (255, 255, 255, 255))

x_offset = (canvas_width - qr_width) // 2
background.paste(img_qr, (x_offset, margin_top))


draw = ImageDraw.Draw(background)
try:
    font = ImageFont.truetype("arial.ttf", 20)
except IOError:
    font = ImageFont.load_default()

text = f"ID {pc_qr}"
bbox = draw.textbbox((0, 0), text, font=font)
text_x = (canvas_width - (bbox[2] - bbox[0])) / 2
draw.text((text_x, 5), text, fill=(0, 0, 0), font=font)

nombre = f"ID_{pc_qr}.png"
background.save(nombre, dpi=(300, 300))
print(f"Código QR generado: {nombre}")

# Script de impresión para Brother QL-800
try:
    import subprocess
    import os
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
    
    $w = 244 
    $h = [int](($image.Height / 300) * 100) + 2
    
    $doc.DefaultPageSettings.PaperSize = New-Object System.Drawing.Printing.PaperSize("Custom", $w, $h)
    $doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0,0,0,0)

    $doc.add_PrintPage({{
        $printableWidth = $_.PageSettings.PrintableArea.Width
        $imgWidthInDoc = ($image.Width / 300) * 100
        $x = [int](($printableWidth - $imgWidthInDoc) / 2)
        
        $rect = New-Object System.Drawing.Rectangle($x, 0, [int]$imgWidthInDoc, [int]$h)
        $_.Graphics.DrawImage($image, $rect)
        $_.HasMorePages = $false
    }})
    $doc.Print()
    $image.Dispose()
    """
    
    subprocess.run(["powershell", "-Command", ps_script], check=True)
    print("¡Etiqueta impresa con éxito!")
    
    # Borrar el archivo después de imprimir
    try:
        os.remove(nombre)
        print(f"Archivo temporal {nombre} eliminado.")
    except Exception as e_del:
        print(f"No se pudo eliminar el archivo: {e_del}")

except Exception as e:
    print(f"Error al imprimir: {e}")

db.close()
