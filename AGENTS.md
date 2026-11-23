# AGENTS.md — vitrine de peças (auto-pecas-ferreira)

Site estático da **Auto Peças Ferreira** (Salto · Itu · Pardinho), publicado em
https://felipefeerreira.github.io/auto-pecas-ferreira/ pelo GitHub Pages.
Repositório local: `Documents/sitepecas`. Sem framework, sem dependência: HTML gerado por um único `build.js`.

> **Leia antes de mexer em qualquer tela:** `Documents/FelipeBrain/30-Projetos/portfolio/padrao-de-vitrine.md`
> (padrão obrigatório: referência em números, escala mínima, critério de aceite com print a 390 e 1280 px).

## Referência visual deste site

**https://www.mayhemwheels.com/** — loja de rodas nos EUA, Shopify. O que copiar dela é **escala e proporção**, não o código.

Medido em 23/11/2026 (navegador a 390 e 1280 px):

| Item | Mayhem | Adotado aqui |
|---|---|---|
| Container | 1260 de 1280 px (98%) | 1180 px de conteúdo (grade de 4 cards pede respiro) |
| Hero | 900 px = 100% da tela; 784 px = 93% no celular | 760 px = 86% no desktop; 520 px com arte de fundo no celular |
| h1 | 85 px contra corpo de 14 px (6,1×) | 56 px no desktop (3,5× o corpo de 16 px) e 34 px no celular |
| Área de imagem do card | imagem domina o card | 4:3, 275×206 px no desktop (**48% do card**), 163×200 px no celular (**39%**) |
| Nome do produto | 31 px caixa alta | 16 px, no máximo **2 linhas** (`-webkit-line-clamp:2`) |
| Categorias | cards quadrados em 1 linha | 155×155 px, 7 em linha; no celular faixa com `scroll-snap` |
| Busca | faixa de 120 px logo abaixo do hero | faixa de 56 px de altura do campo, largura cheia, abaixo do hero |
| Confiança | faixa de 4 colunas | 4 colunas de 279 px depois do hero |
| Header | 108/60 px, **não** fixa | fixa (o carrinho precisa estar à mão) |

**Não copiar:** caixa alta com tracking largo, hero de tela cheia sem imagem, header que não fixa, código/CSS/imagem/texto/marca deles.

## Paleta e fontes reais

Tudo em variável CSS no topo de `assets/style.css` (`:root`). Nunca hex solto no HTML.

| Variável | Valor | Uso |
|---|---|---|
| `--bg` | `#0b0d10` | fundo |
| `--panel` / `--panel2` | `#14181e` / `#1a1f27` | cartões |
| `--line` | `#262c36` | bordas |
| `--txt` / `--muted` | `#e9edf3` / `#94a0b1` | texto / secundário |
| `--red` / `--red-btn` / `--red-dark` | `#e03a2c` / `#d5362a` / `#b32a1f` | **única cor de ação** (só botão) |
| `--green` | `#25d366` | canal WhatsApp (barra fixa no celular) |
| `--amber`, `--blue` | `#f5a623`, `#2a6ad4` | detalhe e foco de teclado |

Fonte: pilha do sistema (`system-ui, -apple-system, "Segoe UI", Roboto, Arial`), sem webfont — não trocar sem medir LCP.
Ícones: SVG inline por categoria em `assets/app.js` (`CAT_ARTE`), um por categoria.

## Build e conferência

```bash
node build.js          # regenera p/, sitemap.xml, robots.txt, catálogo estático e o CSS inline das páginas fixas
```

O `style.css` **não** é servido como arquivo: o build o embute em `<style data-inline>` de cada página. Alterar só o HTML publicado não sobrevive ao próximo build.

Para medir e tirar print (servidor local, depois navegador em 390 e 1280 px):

```bash
python3 -m http.server 8099 --bind 127.0.0.1     # abrir http://127.0.0.1:8099/
```

```js
// no console da página, com o build servido
({ corpo: getComputedStyle(document.body).fontSize,
   h1: getComputedStyle(document.querySelector("h1")).fontSize,
   hero: Math.round(document.querySelector(".hero").getBoundingClientRect().height),
   thumbPct: Math.round(document.querySelector(".pcard .thumb").getBoundingClientRect().height
             / document.querySelector(".pcard").getBoundingClientRect().height * 100),
   overflow: document.documentElement.scrollWidth > innerWidth })
```

Alternativa sem interface: `chrome --headless --window-size=390,844 --screenshot=antes-390.png http://127.0.0.1:8099/`.

## Regras do projeto

- Não mexer em preço, SKU ou texto de peça sem o Felipe.
- Foto de peça: campo `foto` em `assets/produtos.js` — JPG/WebP, fundo branco, 4:3 deitada (1600×1200), até 150 KB, arquivo com a referência (`F000TE159A.jpg`) em `assets/pecas/`.
- Foto da loja (hero): trocar o `src` de `<img class="hero-img">` em `index.html` — 1920×1200 horizontal, até 300 KB. Hoje o slot usa a ilustração `oficina/images/oficina-equipe-800.jpg`.
- Publicar é decisão do Felipe: trabalhar em branch, entregar print e medidas, nunca `push` no `main` sem ok.
