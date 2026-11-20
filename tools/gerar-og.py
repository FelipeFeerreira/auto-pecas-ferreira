#!/usr/bin/env python3
"""Gera assets/og-loja.jpg (1200x630) — card social genérico da loja.
Usa só dados já publicados no site (assets/produtos.js LOJA, WHATSAPP e og:description).
Sem foto de peça: card tipográfico. Rodar: python3 tools/gerar-og.py"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W, H = 1200, 630
root = Path(__file__).resolve().parent.parent
out = root / "assets" / "og-loja.jpg"

F = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

img = Image.new("RGB", (W, H), "#0e1726")
d = ImageDraw.Draw(img)

# faixa diagonal de fundo (sutil) + barra de acento
d.polygon([(0, H), (W * 0.62, H), (W, H * 0.28), (W, H)], fill="#132033")
d.rectangle([0, 0, W, 14], fill="#e8590c")

def f(path, size):
    return ImageFont.truetype(path, size)

def text(xy, s, font, fill, anchor="la"):
    d.text(xy, s, font=font, fill=fill, anchor=anchor)

# marca
text((72, 92), "AUTO PEÇAS", f(F, 82), "#ffffff")
text((72, 182), "FERREIRA", f(F, 82), "#e8590c")

# prova (mesmos fatos do site)
text((74, 300), "Peças Bosch, Nakata, Monroe e mais", f(R, 40), "#e6edf6")
text((74, 360), "Entrega no mesmo dia em Salto · Itu · Pardinho", f(R, 36), "#9fb0c6")
text((74, 418), "3 meses de garantia · Pix na entrega ou retirada", f(R, 32), "#9fb0c6")
text((W - 74, 424), "auto-pecas-ferreira", f(R, 26), "#5d6e86", anchor="ra")

# rodapé
d.line([(72, 500), (W - 72, 500)], fill="#2b3a52", width=2)
text((74, 528), "WhatsApp (14) 98147-3778", f(F, 34), "#ffffff")

img.save(out, "JPEG", quality=88, optimize=True, progressive=True)
print(out, img.size, out.stat().st_size)
