/* Gera páginas estáticas de produto (p/<id>.html), sitemap.xml e robots.txt
   a partir de assets/produtos.js. Rodar: node build.js */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const src = fs.readFileSync(path.join(root, "assets/produtos.js"), "utf8");
const sandbox = { window: {} };
const fn = new Function("window", src + "\nreturn window;");
const W = fn(sandbox.window);
const PRODUTOS = W.PRODUTOS;
const LOJA = W.LOJA;
const BASE = "https://felipefeerreira.github.io/auto-pecas-ferreira";

/* Card social genérico (1200x630, gerado por tools/gerar-og.py com os dados da
   própria loja — sem foto de peça). Sem og:image o link no WhatsApp sai sem miniatura. */
const OG_IMAGE = `<meta property="og:image" content="${BASE}/assets/og-loja.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Auto Peças Ferreira — entrega no mesmo dia em Salto, Itu e Pardinho">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${BASE}/assets/og-loja.jpg">`;

/* Favicon: a própria marca do site (🔧 no quadrado vermelho do `.brand .m`),
   gerado por tools/gerar-favicon.py. Antes, 24 das 25 páginas não tinham ícone
   e /favicon.ico dava 404 — a aba e o favorito mostravam o ícone genérico. */
const ICON = `<link rel="icon" type="image/png" sizes="96x96" href="${BASE}/assets/favicon-96.png">
<link rel="apple-touch-icon" href="${BASE}/assets/favicon-180.png">`;


/* helpers do app.js reavaliados fora do navegador para pré-renderizar a PDP */
const stubDoc = { addEventListener(){}, getElementById(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; } };
const appSandbox = { window: {}, document: stubDoc, localStorage: { getItem(){ return null; }, setItem(){} }, location: { pathname: "/p/x.html" }, URLSearchParams };
const appFn = new Function("window","document","localStorage","location","URLSearchParams",
  fs.readFileSync(path.join(root, "assets/app.js"), "utf8") + "\nreturn {fmt, parcelas, ICONE, arteDe, iconeCat};");
const APP = appFn(appSandbox.window, appSandbox.document, appSandbox.localStorage, appSandbox.location, URLSearchParams);
const pdpSrc = fs.readFileSync(path.join(root, "assets/pdp.js"), "utf8");
new Function("window", pdpSrc)(appSandbox.window);
const pdpHTML = appSandbox.window.pdpHTML;

const tpl = fs.readFileSync(path.join(root, "templates", "produto.tpl"), "utf8");
fs.mkdirSync(path.join(root, "p"), { recursive: true });

const rel = s => s
  .replace(/href="assets\//g, 'href="../assets/')
  .replace(/src="assets\//g, 'src="../assets/')
  .replace(/href="oficina\//g, 'href="../oficina/')
  .replace(/href="index\.html/g, 'href="../index.html')
  .replace(/href="produtos\.html/g, 'href="../produtos.html')
  .replace(/href="carrinho\.html/g, 'href="../carrinho.html');

/* CSS inline. A folha externa era o único bloqueio de render das páginas de
   conteúdo: com 300 ms de RTT e 1,6 Mbps (390 px, CPU 4x), o <link> começava em
   335 ms e terminava em 656 ms, e FCP = LCP = 784 ms. Com o mesmo CSS dentro do
   <style>, FCP 392 ms e LCP 407 ms (~-48%, um RTT inteiro a menos), ao custo de
   +3,6 KB gzip por página. style.css continua sendo a fonte única: o build
   reescreve o bloco, então editar o CSS e rodar `node build.js` basta. */
const CSS_SITE = fs.readFileSync(path.join(root, "assets/style.css"), "utf8").trim();
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function inlineCSS(html, href){
  const link = `<link rel="stylesheet" href="${href}">`;
  const css = `<style data-inline="${href}">${CSS_SITE}</style>`;
  const antigo = new RegExp(`<style data-inline="${reEsc(href)}">[\\s\\S]*?<\\/style>`);
  return html.replace(antigo, link).split(link).join(css);
}

const money = n => n.toFixed(2).replace(".", ",");
const moneySchema = n => n.toFixed(2);

/* Título sem repetir a marca ("Bosch Bosch") e dentro de ~60 caracteres:
   o template antigo colava sempre `${nome} ${marca} ${ref} — Auto Peças Ferreira`,
   o que duplicava a marca em 7 páginas e passava de 60 caracteres em 13 URLs. */
function nomeComMarca(p) {
  const tem = new RegExp(`\\b${p.marca.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(p.nome);
  return tem ? p.nome : `${p.nome} ${p.marca}`;
}
function tituloPeca(p) {
  let base = p.nome.trim();
  const nomeTemMarca = new RegExp(`\\b${p.marca.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(base);
  if (!nomeTemMarca) base = `${base} ${p.marca}`;
  if (p.ref && !base.toUpperCase().includes(p.ref.toUpperCase())) base = `${base} ${p.ref}`;
  base = base.replace(/\s+/g, " ").trim();
  const sufixo = " | Auto Peças Ferreira";
  return base.length + sufixo.length <= 60 ? base + sufixo : base;
}

/* "Quem viu esta peça também levou" era preenchido só pelo JS (renderList no
   template), então o HTML publicado saía com a div vazia e as 20 PDPs não
   tinham nenhum link para outra peça — medido 21/11: 7 links internos por PDP,
   0 entre peças, e o rastreador via div vazia. O mesmo cardHTML do app.js roda
   aqui com location de /p/, então a URL sai relativa (id.html), como já era no
   navegador. */
const pdpLoc = { pathname: "/p/x.html", href: "/p/x.html" };
W.location = pdpLoc;
const CARD_PDP = new Function("window","document","localStorage","location","URLSearchParams",
  fs.readFileSync(path.join(root, "assets/app.js"), "utf8") + "\nreturn {cardHTML, catcardHTML, fmt};")(
  W,
  { addEventListener(){}, getElementById(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; }, createElement(){ return {}; }, body: {} },
  { getItem(){ return null; }, setItem(){} }, pdpLoc, URLSearchParams);

let n = 0;
for (const p of PRODUTOS) {
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nome,
    sku: p.ref,
    mpn: p.ref,
    brand: { "@type": "Brand", name: p.marca },
    category: p.cat,
    description: p.desc,
    url: `${BASE}/p/${p.id}.html`,
    image: [`${BASE}/assets/og-loja.jpg`],
    offers: {
      "@type": "Offer",
      url: `${BASE}/p/${p.id}.html`,
      priceCurrency: "BRL",
      price: moneySchema(p.preco),
      availability: p.estoque > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      seller: { "@type": "Organization", name: LOJA.nome }
    },
    additionalProperty: { "@type": "PropertyValue", name: "Aplicação", value: p.aplicacao.join("; ") }
  };

  let html = rel(tpl);
  const titulo = tituloPeca(p);
  html = html.replace("<title>Peça — Auto Peças Ferreira</title>",
    `<title>${titulo}</title>`);
  const desc = `${nomeComMarca(p)} código ${p.ref}. ${p.aplicacao[0]}. R$ ${money(p.preco)} com entrega no mesmo dia em Salto, Itu e Pardinho.`;
  html = html.replace('<meta name="description" content="Ficha técnica, aplicação por veículo, garantia e preço da peça. Entrega no mesmo dia em Salto, Itu e Pardinho.">',
    `<meta name="description" content="${desc}">`);
  html = html.replace('<link rel="canonical"', '<link rel="canonical-x"'); // no-op safety
  const pdp = pdpHTML(p, { ICONE: APP.ICONE, arteDe: APP.arteDe, iconeCat: APP.iconeCat, fmt: APP.fmt, parcelas: APP.parcelas, cfg: LOJA });
  html = html.replace('<div class="pdp" id="pdp"></div>', `<div class="pdp" id="pdp">${pdp}</div>`);
  // mesma regra do JS: 4 da mesma categoria primeiro, completando com outras categorias
  const mesmaCat = PRODUTOS.filter(x => x.cat === p.cat && x.id !== p.id);
  const outras = PRODUTOS.filter(x => x.id !== p.id && x.cat !== p.cat);
  const relLista = mesmaCat.concat(outras).slice(0, 4);
  html = html.replace(
    '<div class="grid" id="relacionados" style="padding-bottom:20px"></div>',
    `<div class="grid" id="relacionados" style="padding-bottom:20px">${relLista.map(CARD_PDP.cardHTML).join("")}</div>`);
  html = html.replace('<span id="crumbcat"></span>', `<span id="crumbcat">${p.cat}</span>`);
  html = html.replace('<script src="../assets/pdp.js"></script>',
    '<script src="../assets/pdp.js"></script>');
  html = html.replace('</head>', `<meta property="og:type" content="product">\n<meta property="og:title" content="${titulo}">\n<meta property="og:description" content="${desc}">\n<meta property="og:url" content="${BASE}/p/${p.id}.html">\n${OG_IMAGE}\n${ICON}\n</head>`);
  // BreadcrumbList espelha o caminho exibido na PDP: Início › Catálogo › Categoria
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: `${BASE}/produtos.html` },
      { "@type": "ListItem", position: 3, name: p.cat, item: `${BASE}/produtos.html?cat=${encodeURIComponent(p.cat)}` }
    ]
  };
  html = html.replace("</head>", `<link rel="canonical" href="${BASE}/p/${p.id}.html">\n<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n<script type="application/ld+json">${JSON.stringify(crumbs)}</script>\n</head>`);
  html = html.replace('<script src="../assets/produtos.js"></script>',
    `<script>window.FORCED_ID = "${p.id}";</script>\n<script src="../assets/produtos.js"></script>`);

  html = inlineCSS(html, "../assets/style.css");
  fs.writeFileSync(path.join(root, "p", `${p.id}.html`), html);
  n++;
}

/* <lastmod> sai da data do último commit que tocou o arquivo gerado
   (`git log -1 --format=%cs`), nunca de data fixa à mão. Arquivo ainda não
   commitado cai na data do HEAD; sem git disponível, a tag é omitida. */
const { execSync } = require("child_process");
const headDate = (() => {
  try { return execSync("git log -1 --format=%cs", { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
})();
const lastMod = (rel) => {
  try {
    const d = execSync(`git log -1 --format=%cs -- "${rel}"`, { cwd: root, encoding: "utf8" }).trim();
    return d || headDate;
  } catch { return headDate; }
};

/* carrinho.html fora do sitemap: é o orçamento do próprio visitante (lista
   vazia para o rastreador), não conteúdo de catálogo para indexar. */
const urls = [
  { loc: `${BASE}/`, file: "index.html" },
  { loc: `${BASE}/produtos.html`, file: "produtos.html" },
  { loc: `${BASE}/oficina/`, file: "oficina/index.html" },
  ...PRODUTOS.map(p => ({ loc: `${BASE}/p/${p.id}.html`, file: `p/${p.id}.html` }))
];
fs.writeFileSync(path.join(root, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ loc, file }) => {
  const lm = lastMod(file);
  return `  <url><loc>${loc}</loc>${lm ? `<lastmod>${lm}</lastmod>` : ""}<changefreq>weekly</changefreq><priority>${loc.endsWith("/") ? "1.0" : "0.8"}</priority></url>`;
}).join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /templates/\nSitemap: ${BASE}/sitemap.xml\n`);

/* ---------- catálogo e destaques no HTML estático (index/produtos) ----------
   Sem isso o catálogo, os links para as 20 páginas de peça e a home só existiam
   depois do JS: o rastreador via uma div vazia. */
const catSandbox = {
  window: W,
  document: { addEventListener(){}, getElementById(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; }, createElement(){ return {}; }, body: {} },
  localStorage: { getItem(){ return null; }, setItem(){} },
  location: { pathname: "/produtos.html", href: "/produtos.html" },
  URLSearchParams
};
W.location = catSandbox.location;
const CAT = new Function("window","document","localStorage","location","URLSearchParams",
  fs.readFileSync(path.join(root, "assets/app.js"), "utf8") + "\nreturn {cardHTML, catcardHTML, fmt};")(W, catSandbox.document, catSandbox.localStorage, catSandbox.location, URLSearchParams);

const ICONES = {"Combustível":"⛽","Filtros":"🧽","Freios":"🛑","Motor":"⚙️","Suspensão":"🔩","Elétrica":"🔌","Óleo e fluidos":"🛢️"};
const catsHTML = [...new Set(PRODUTOS.map(p => p.cat))].map(c => CAT.catcardHTML(c)).join("");
const destaquesHTML = PRODUTOS.filter(p => p.destaque).slice(0, 8).map(CAT.cardHTML).join("");
const listaHTML = PRODUTOS.map(CAT.cardHTML).join("");
const resumoHTML = `${PRODUTOS.length} peças · entrega hoje em Salto, Itu e Pardinho`;

const bloco = (key, needle, abertura, conteudo) => html =>
  html.includes(`<!--b:${key}-->`)
    ? html.replace(new RegExp(`<!--b:${key}-->[\\s\\S]*?<!--/b:${key}-->`),
        `<!--b:${key}-->${conteudo}<!--/b:${key}-->`)
    : html.replace(needle, `${abertura}<!--b:${key}-->${conteudo}<!--/b:${key}-->`);

function injeta(arquivo, passos){
  const p = path.join(root, arquivo);
  let html = fs.readFileSync(p, "utf8");
  for (const f of passos) html = f(html);
  fs.writeFileSync(p, html);
}

injeta("index.html", [
  bloco("cats", '<div class="cats" id="cats"></div>', '<div class="cats" id="cats">', catsHTML),
  bloco("destaques", '<div class="grid" id="destaques"></div>', '<div class="grid" id="destaques">', destaquesHTML)
]);
injeta("produtos.html", [
  bloco("resumo", '<p style="margin:0;color:var(--muted);font-size:13.5px" id="resumo"></p>',
    '<p style="margin:0;color:var(--muted);font-size:13.5px" id="resumo">', resumoHTML),
  bloco("lista", '<div class="grid" id="lista" style="padding-bottom:46px"></div>',
    '<div class="grid" id="lista" style="padding-bottom:46px">', listaHTML)
]);

/* ---------- JSON-LD do catálogo (produtos.html) ----------
   produtos.html não tinha nenhum bloco: os 20 cards estavam no HTML, mas nada
   dizia ao rastreador que esta é a listagem das peças. CollectionPage com
   numberOfItems e ItemList usa só dado que já sai no card (nome, código, URL da
   PDP, preço publicado); BreadcrumbList só Início › Catálogo, o caminho que a
   página realmente tem. O carrinho fica sem schema: é orçamento vazio e do
   visitante, não conteúdo indexável. */
const itemList = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Catálogo de peças — Auto Peças Ferreira",
  url: `${BASE}/produtos.html`,
  description: `Catálogo com ${PRODUTOS.length} peças Bosch, Nakata, Monroe e outras marcas, com preço e aplicação por veículo. Entrega no mesmo dia em Salto, Itu e Pardinho.`,
  isPartOf: { "@type": "WebSite", name: LOJA.nome, url: `${BASE}/` },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: PRODUTOS.length,
    itemListElement: PRODUTOS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.nome,
        sku: p.ref,
        url: `${BASE}/p/${p.id}.html`,
        brand: { "@type": "Brand", name: p.marca },
        offers: {
          "@type": "Offer",
          url: `${BASE}/p/${p.id}.html`,
          priceCurrency: "BRL",
          price: moneySchema(p.preco),
          availability: p.estoque > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder"
        }
      }
    }))
  }
};
const catCrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Início", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: "Catálogo", item: `${BASE}/produtos.html` }
  ]
};
{
  const p = path.join(root, "produtos.html");
  let html = fs.readFileSync(p, "utf8");
  /* reescreve sempre: com o include() antigo o bloco velho ficava para sempre e
     uma correção no schema (preço "315,00" -> "315.00") nunca chegava ao HTML */
  html = html.replace(/<script type="application\/ld\+json" data-ld="catalogo(-crumbs)?">[\s\S]*?<\/script>\n?/g, "");
  const ld = `<script type="application/ld+json" data-ld="catalogo">${JSON.stringify(itemList)}</script>\n` +
             `<script type="application/ld+json" data-ld="catalogo-crumbs">${JSON.stringify(catCrumbs)}</script>\n`;
  const out = html.replace("\n</head>", "\n" + ld + "</head>");
  if (out !== html) fs.writeFileSync(p, out);
}

/* ---------- canonical e Open Graph nas páginas fixas ----------
   index/produtos/carrinho não passavam por template: produtos e carrinho saíam
   sem <link rel="canonical"> e sem og:url, então o Google tratava as URLs
   ?cat=/?q= como páginas distintas e o preview social não tinha endereço. */
function headSeo(arquivo, { url, type, title, desc, robots }) {
  const p = path.join(root, arquivo);
  let html = fs.readFileSync(p, "utf8");
  const antes = html;
  const tags = [];
  if (!html.includes('rel="canonical"')) tags.push(`<link rel="canonical" href="${url}">`);
  if (!html.includes('rel="icon"')) tags.push(ICON);
  if (!html.includes('property="og:url"')) {
    tags.push(
      `<meta property="og:type" content="${type}">`,
      `<meta property="og:site_name" content="Auto Peças Ferreira">`,
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${desc}">`,
      `<meta property="og:url" content="${url}">`
    );
  }
  if (!html.includes('name="robots"') && robots) tags.push(`<meta name="robots" content="${robots}">`);
  if (tags.length) html = html.replace("\n</head>", "\n" + tags.join("\n") + "\n</head>");
  if (!html.includes('property="og:image"')) {
    html = html.replace("\n</head>", "\n" + OG_IMAGE + "\n</head>");
  }
  if (html !== antes) fs.writeFileSync(p, html);
  return html !== antes ? " corrigido" : " ok";
}

const seoLog = [
  headSeo("index.html", {
    url: `${BASE}/`, type: "website",
    title: "Auto Peças Ferreira — entrega no dia em Salto, Itu e região",
    desc: "Autopeças Bosch, Nakata, Monroe e mais com preço de distribuidora e entrega no mesmo dia em Salto, Itu, Pardinho e região."
  }),
  headSeo("produtos.html", {
    url: `${BASE}/produtos.html`, type: "website",
    title: "Catálogo de peças — Auto Peças Ferreira",
    desc: "Catálogo de autopeças com preço e aplicação por veículo. Entrega no mesmo dia em Salto, Itu e Pardinho."
  }),
  headSeo("carrinho.html", {
    url: `${BASE}/carrinho.html`, type: "website",
    title: "Meu orçamento — Auto Peças Ferreira",
    desc: "Revise as peças do seu orçamento e envie para a Auto Peças Ferreira pelo WhatsApp.",
    robots: "noindex,follow"
  })
].join(",");

/* ---------- oficina/: canonical e Open Graph no domínio publicado ----------
   A página veio do site original no openbot.site e ficou com canonical, og:url,
   og:image e o JSON-LD apontando para lá. Com dois domínios, o Google descarta
   esta cópia e o preview social busca imagem em outro host. */
const OFICINA_ORIG = "https://mecanica-eletrica-stop-pardinho-sp-site-k27yq8y5dd.openbot.site";
const oficinaPath = path.join(root, "oficina/index.html");
const oficinaAntes = fs.readFileSync(oficinaPath, "utf8");
const oficinaDepois = oficinaAntes
  .split(`${OFICINA_ORIG}/images/`).join(`${BASE}/oficina/images/`)
  .split(`${OFICINA_ORIG}/#`).join(`${BASE}/oficina/#`)
  .split(OFICINA_ORIG).join(`${BASE}/oficina/`);
if (oficinaDepois !== oficinaAntes) fs.writeFileSync(oficinaPath, oficinaDepois);

/* páginas fixas: mesma folha, mesmo bloqueio de render */
let cssInj = 0;
for (const [arq, href] of [["index.html","assets/style.css"],["produtos.html","assets/style.css"],
                           ["carrinho.html","assets/style.css"],["404.html","/auto-pecas-ferreira/assets/style.css"]]){
  const fp = path.join(root, arq);
  const antes = fs.readFileSync(fp, "utf8");
  const depois = inlineCSS(antes, href);
  if (depois !== antes){ fs.writeFileSync(fp, depois); cssInj++; }
}

console.log(`geradas ${n} páginas de produto + sitemap (${urls.length} URLs) + robots.txt + catálogo estático em index/produtos (${PRODUTOS.length} cards) + canonical de oficina/${oficinaDepois !== oficinaAntes ? " corrigido" : " ok"} + head(seo)${seoLog} + css inline em ${cssInj} fixas`);
