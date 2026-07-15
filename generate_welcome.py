import os
import requests
from PIL import Image, ImageDraw, ImageFont

def generate_text_image(text, font_url, font_filename, output_filename, text_color):
    if not os.path.exists(font_filename):
        r = requests.get(font_url)
        with open(font_filename, 'wb') as f:
            f.write(r.content)

    font_size = 250
    font = ImageFont.truetype(font_filename, font_size)

    left, top, right, bottom = font.getbbox(text)
    width = right - left
    height = bottom - top

    padding_x = 50
    padding_y = 50
    img_width = width + padding_x * 2
    img_height = height + padding_y * 2

    img = Image.new('RGBA', (img_width, img_height), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    draw.text((padding_x - left, padding_y - top), text, font=font, fill=text_color)

    img.save(output_filename)
    print(f"Saved to {output_filename}")

# Gold color from the image #C49A3B
color = (196, 154, 59, 255)

fonts = [
    {
        "url": "https://github.com/google/fonts/raw/main/ofl/greatvibes/GreatVibes-Regular.ttf",
        "file": "GreatVibes.ttf",
        "out": "welcome_greatvibes.png"
    },
    {
        "url": "https://github.com/google/fonts/raw/main/ofl/alexbrush/AlexBrush-Regular.ttf",
        "file": "AlexBrush.ttf",
        "out": "welcome_alexbrush.png"
    },
    {
        "url": "https://github.com/google/fonts/raw/main/ofl/pinyonscript/PinyonScript-Regular.ttf",
        "file": "PinyonScript.ttf",
        "out": "welcome_pinyon.png"
    }
]

for f in fonts:
    generate_text_image("Welcome", f["url"], f["file"], f["out"], color)

