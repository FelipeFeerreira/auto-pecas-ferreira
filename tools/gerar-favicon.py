#!/usr/bin/env python3
"""Gera o favicon da loja a partir da propria marca do site: o emoji 🔧 dentro
do quadrado vermelho com gradiente (`.brand .m` em assets/style.css, 36px,
radius 25%). Gera assets/favicon-512.png (fonte), 180 (apple-touch), 96 e
favicon.ico (16/32/48) na raiz. Rodar com Chrome headless instalado.

Uso: python3 tools/gerar-favicon.py
"""
import os
import shutil
import subprocess
import tempfile

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chromium-browser")

HTML = """<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;background:transparent}
.tile{width:512px;height:512px;border-radius:114px;
  background:linear-gradient(135deg,#e03a2c,#7c1a12);
  display:grid;place-items:center;
  font-family:"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif;
  font-size:300px;line-height:1}
</style></head><body><div class="tile">\U0001F527</div></body></html>"""


def main():
    tmp = tempfile.mkdtemp(prefix="fav-")
    html_path = os.path.join(tmp, "fav.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(HTML)
    src = os.path.join(ROOT, "assets", "favicon-512.png")
    subprocess.run([
        CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
        "--force-device-scale-factor=1",
        "--default-background-color=00000000",
        "--window-size=512,512",
        f"--screenshot={src}",
        f"file://{html_path}",
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    img = Image.open(src).convert("RGBA")
    if img.size != (512, 512):
        img = img.crop((0, 0, 512, 512))
        img.save(src)
    for size, name in ((180, "assets/favicon-180.png"), (96, "assets/favicon-96.png")):
        img.resize((size, size), Image.LANCZOS).save(os.path.join(ROOT, name))
    img.save(os.path.join(ROOT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
    shutil.rmtree(tmp, ignore_errors=True)
    print("ok: assets/favicon-512.png, favicon-180.png, favicon-96.png, favicon.ico")


if __name__ == "__main__":
    main()
