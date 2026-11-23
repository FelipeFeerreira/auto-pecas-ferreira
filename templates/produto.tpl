<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Peça — Auto Peças Ferreira</title>
<meta name="description" content="Ficha técnica, aplicação por veículo, garantia e preço da peça. Entrega no mesmo dia em Salto, Itu e Pardinho.">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>

<a class="skip" href="#conteudo">Pular para o conteúdo</a>

<header class="site">
  <div class="wrap bar">
    <a class="brand" href="index.html">
      <span class="m">🔧</span>
      <span>Auto Peças Ferreira<small>Salto · Itu · Pardinho</small></span>
    </a>
    <label class="searchbox">
      <span>🔍</span>
      <input id="q" type="search" aria-label="Buscar peças no catálogo" placeholder="Busque por peça, marca ou código">
    </label>
    <nav class="links">
      <a href="produtos.html">Catálogo</a>
      <a href="index.html#como">Como funciona</a>
      <a href="index.html#contato">Contato</a>
    </nav>
    <button type="button" class="cartbtn" onclick="openCart()">🛒 Orçamento <span class="badge" id="badge">0</span></button>
  </div>
</header>

<main id="conteudo" tabindex="-1">

<div class="wrap">
  <div class="crumb"><a href="index.html">Início</a> › <a href="produtos.html">Catálogo</a> › <span id="crumbcat"></span></div>
  <div class="pdp" id="pdp"></div>
  <section class="blk" style="padding-top:0">
    <div class="head"><h2>Quem viu esta peça também levou</h2></div>
    <div class="grid" id="relacionados" style="padding-bottom:20px"></div>
  </section>
</div>

</main>

<footer class="site">
  <div class="wrap">
    <b>Auto Peças Ferreira</b> · Salto, Itu e Pardinho · WhatsApp (14) 98147-3778<br>
    <a href="oficina/">Oficina e serviços</a><br>
    Garantia de 3 meses · Troca em até 7 dias · Confirme a aplicação pelo código antes de comprar.
  </div>
</footer>

<script src="assets/produtos.js"></script>
<script src="assets/pdp.js"></script>
<script src="assets/app.js"></script>
<script>
  const id = window.FORCED_ID || new URLSearchParams(location.search).get("id");
  const p = byId(id) || window.PRODUTOS[0];
  document.title = `${p.nome} — ${p.marca} ${p.ref} | Auto Peças Ferreira`;
  document.getElementById("crumbcat").textContent = p.cat;

  const esgotado = p.estoque <= 0;
  document.getElementById("pdp").innerHTML = pdpHTML(p, {ICONE, arteDe, iconeCat, fmt, parcelas, cfg});

  let qtd = 1;
  function mais(){ qtd++; document.getElementById("qtd").textContent = qtd; }
  function menos(){ if(qtd>1){ qtd--; document.getElementById("qtd").textContent = qtd; } }
  function comprar(){ addToCart(p.id, qtd); }

  const rel = window.PRODUTOS.filter(x=>x.cat===p.cat && x.id!==p.id);
  const resto = window.PRODUTOS.filter(x=>x.id!==p.id && x.cat!==p.cat);
  renderList("relacionados", rel.concat(resto).slice(0,4));
</script>
</body>
</html>
