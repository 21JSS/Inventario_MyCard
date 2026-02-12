import mysql.connector
from flask import Flask, render_template, request
import os
import qrcode 
from PIL import Image, ImageDraw, ImageFont 
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer
from qrcode.image.styledpil import StyledPilImage

app = Flask(__name__)

@app.route("/")
def inicio():

        id_equipo = request.args.get("id")

        if id_equipo:
                cursor = db.cursor(dictionary=True)
                cursor.execute("SELECT * FROM inventario_computo WHERE id = %s",(id_equipo,))
                equipo = cursor.fetchone()
                return render_template("PantallaPrincipal.html", equipo=equipo)
        else:
                        return render_template("PantallaPrincipal.html", equipo=None)


db=mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="equipos_mycard"
)
 
cursor = db.cursor(dictionary=True)

def generar_qrs():
        cursor.execute("SELECT id FROM inventario_computo")
        resultados = cursor.fetchall()


        ip = "192.168.1.222"


        for fila in resultados:
            pc_qr = fila['id']
            url = f"http://{ip}:5000/?id={pc_qr}"
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_H,
                box_size=2, 
                border=2,  
        )
    
        qr.add_data(url)
        qr.make(fit=True) 

        img_qr = qr.make_image(image_factory=StyledPilImage, module_drawer=RoundedModuleDrawer())._img
  
        img_logo = Image.open("img/logo_MyCard.jpeg").convert("RGBA")
    
        #  logo en el centro del QR antes de ponerlo en el fondo
        logo_size = min(img_qr.size[0], img_qr.size[1]) // 4
        img_logo = img_logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        pos = ((img_qr.size[0] - logo_size) // 2, (img_qr.size[1] - logo_size) // 2)
        img_qr.paste(img_logo, pos, img_logo)

        qr_width,qr_height = img_qr.size
        margin_top = 40
        new_height = qr_height + margin_top

        background = Image.new('RGBA', (qr_width, new_height), (255, 255, 255, 255))
        background.paste(img_qr, (0, margin_top))
    
        draw = ImageDraw.Draw(background)
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except IOError:
            font = ImageFont.load_default()
    
        text = f"pc{pc_qr}"
   
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_x = (qr_width - text_width) / 2
        text_y = 10
        draw.text((text_x, text_y), text, fill=(0, 0, 0), font=font)

        nombre = f"qr_pc_{pc_qr}.png"
        background.save(nombre)

        print(f"Código QR generado y guardado como: {nombre}")


if __name__ == "__main__":
        generar_qrs()
        app.run(host="0.0.0.0", port=5000, debug=True)

