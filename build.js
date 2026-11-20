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


/* helpers do app.js reavaliados fora do navegador para pré-renderizar a PDP */
const stubDoc = { addEventListener(){}, getElementById(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; } };
const appSandbox = { window: {}, document: stubDoc, localStorage: { getItem(){ return null; }, setItem(){} }, location: { pathname: "/p/x.html" }, URLSearchParams };
const appFn = new Function("window","document","localStorage","location","URLSearchParams",
  fs.readFileSync(path.join(root, "assets/app.js"), "utf8") + "\nreturn {fmt, parcelas, ICONE};");
const APP = appFn(appSandbox.window, appSandbox.document, appSandbox.localStorage, appSandbox.location, URLSearchParams);
const pdpSrc = fs.readFileSync(path.join(root, "assets/pdp.js"), "utf8");
new Function("window", pdpSrc)(appSandbox.window);
const pdpHTML = appSandbox.window.pdpHTML;

const tpl = fs.readFileSync(path.join(root, "produto.html"), "utf8");
fs.mkdirSync(path.join(root, "p"), { recursive: true });

const rel = s => s
  .replace(/href="assets\//g, 'href="../assets/')
  .replace(/src="assets\//g, 'src="../assets/')
  .replace(/href="index\.html/g, 'href="../index.html')
  .replace(/href="produtos\.html/g, 'href="../produtos.html')
  .replace(/href="carrinho\.html/g, 'href="../carrinho.html');

const money = n => n.toFixed(2).replace(".", ",");

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
    offers: {
      "@type": "Offer",
      url: `${BASE}/p/${p.id}.html`,
      priceCurrency: "BRL",
      price: money(p.preco),
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
  const pdp = pdpHTML(p, { ICONE: APP.ICONE, fmt: APP.fmt, parcelas: APP.parcelas, cfg: LOJA });
  html = html.replace('<div class="pdp" id="pdp"></div>', `<div class="pdp" id="pdp">${pdp}</div>`);
  html = html.replace('<span id="crumbcat"></span>', `<span id="crumbcat">${p.cat}</span>`);
  html = html.replace('<script src="../assets/pdp.js"></script>',
    '<script src="../assets/pdp.js"></script>');
  html = html.replace('</head>', `<meta property="og:type" content="product">\n<meta property="og:title" content="${titulo}">\n<meta property="og:description" content="${desc}">\n<meta property="og:url" content="${BASE}/p/${p.id}.html">\n</head>`);
  html = html.replace("</head>", `<link rel="canonical" href="${BASE}/p/${p.id}.html">\n<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n</head>`);
  html = html.replace('<script src="../assets/produtos.js"></script>',
    `<script>window.FORCED_ID = "${p.id}";</script>\n<script src="../assets/produtos.js"></script>`);

  fs.writeFileSync(path.join(root, "p", `${p.id}.html`), html);
  n++;
}

const urls = [
  `${BASE}/`,
  `${BASE}/produtos.html`,
  `${BASE}/carrinho.html`,
  `${BASE}/oficina/`,
  ...PRODUTOS.map(p => `${BASE}/p/${p.id}.html`)
];
fs.writeFileSync(path.join(root, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><changefreq>weekly</changefreq><priority>${u.endsWith("/") ? "1.0" : "0.8"}</priority></url>`).join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);

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
  fs.readFileSync(path.join(root, "assets/app.js"), "utf8") + "\nreturn {cardHTML, fmt};")(W, catSandbox.document, catSandbox.localStorage, catSandbox.location, URLSearchParams);

const ICONES = {"Combustível":"⛽","Filtros":"🧽","Freios":"🛑","Motor":"⚙️","Suspensão":"🔩","Elétrica":"🔌","Óleo e fluidos":"🛢️"};
const catsHTML = [...new Set(PRODUTOS.map(p => p.cat))]
  .map(c => `<a class="catcard" href="produtos.html?cat=${encodeURIComponent(c)}"><span>${ICONES[c] || "🔧"}</span>${c}</a>`)
  .join("");
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

/* ---------- canonical e Open Graph nas páginas fixas ----------
   index/produtos/carrinho não passavam por template: produtos e carrinho saíam
   sem <link rel="canonical"> e sem og:url, então o Google tratava as URLs
   ?cat=/?q= como páginas distintas e o preview social não tinha endereço. */
function headSeo(arquivo, { url, type, title, desc }) {
  const p = path.join(root, arquivo);
  let html = fs.readFileSync(p, "utf8");
  const antes = html;
  const tags = [];
  if (!html.includes('rel="canonical"')) tags.push(`<link rel="canonical" href="${url}">`);
  if (!html.includes('property="og:url"')) {
    tags.push(
      `<meta property="og:type" content="${type}">`,
      `<meta property="og:site_name" content="Auto Peças Ferreira">`,
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${desc}">`,
      `<meta property="og:url" content="${url}">`
    );
  }
  if (tags.length) html = html.replace("\n</head>", "\n" + tags.join("\n") + "\n</head>");
  if (html !== antes) fs.writeFileSync(p, html);
  return html !== antes ? " corrigido" : " ok";
}

const seoLog = [
  headSeo("index.html", {
    url: `${BASE}/`, type: "website",
    title: "Auto Peças Ferreira — peças com entrega no dia em Salto, Itu e região",
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
    desc: "Revise as peças do seu orçamento e envie para a Auto Peças Ferreira pelo WhatsApp."
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

console.log(`geradas ${n} páginas de produto + sitemap (${urls.length} URLs) + robots.txt + catálogo estático em index/produtos (${PRODUTOS.length} cards) + canonical de oficina/${oficinaDepois !== oficinaAntes ? " corrigido" : " ok"} + head(seo)${seoLog}`);
