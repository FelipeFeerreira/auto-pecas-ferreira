/* ==========================================================
   Auto Peças Ferreira — núcleo compartilhado (carrinho, cards,
   busca, WhatsApp). Usado por todas as páginas.
   ========================================================== */
const P = window.PRODUTOS || [];
const cfg = window.LOJA || {};
const WPP = window.WHATSAPP || "";

const fmt = n => n.toLocaleString("pt-BR", {style:"currency", currency:"BRL"});
const byId = id => P.find(p => p.id === id);
const parcelas = n => fmt(n / 3);

const ICONE = `<svg viewBox="0 0 24 24" fill="none" stroke="#5b6b82" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
<path d="M14.7 6.3a5 5 0 0 0 6.6 6.6l-8.6 8.6a2 2 0 0 1-2.8 0l-4.4-4.4a2 2 0 0 1 0-2.8l8.6-8.6z"/><circle cx="16.5" cy="7.5" r="1.2" fill="#5b6b82"/></svg>`;

/* ---------- carrinho ---------- */
const CART_KEY = "apf_cart";
let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch(e){ cart = []; }

function saveCart(){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  paintCart();
}
function addToCart(id, qtd=1){
  const it = cart.find(c => c.id === id);
  if (it) it.q += qtd; else cart.push({id, q:qtd});
  saveCart();
  toast("Adicionado ao orçamento");
  openCart();
}
function changeQty(id, d){
  const it = cart.find(c => c.id === id); if(!it) return;
  it.q += d;
  if (it.q <= 0) cart = cart.filter(c => c.id !== id);
  saveCart();
}
function cartCount(){ return cart.reduce((s,c) => s + c.q, 0); }
function cartTotal(){ return cart.reduce((s,c) => s + (byId(c.id)?.preco || 0) * c.q, 0); }

function cartLines(){
  return cart.map(c => {
    const p = byId(c.id); if(!p) return "";
    return `• ${c.q}x ${p.nome} (${p.marca} ${p.ref}) — ${fmt(p.preco * c.q)}`;
  }).filter(Boolean).join("\n");
}
function whatsappLink(extra=""){
  const total = fmt(cartTotal());
  const msg = `Olá! Quero um orçamento na Auto Peças Ferreira:\n\n${cartLines()}\n\nTotal: ${total}\n\n${extra}`.trim();
  return `https://wa.me/${WPP}?text=${encodeURIComponent(msg)}`;
}

/* ---------- UI: drawer, toast ---------- */
function drawerHTML(){
  if (document.getElementById("drawer")) return;
  const el = document.createElement("div");
  el.innerHTML = `
  <div class="overlay" id="overlay" onclick="closeCart()"></div>
  <aside class="drawer" id="drawer">
    <div class="dh"><h2>Seu orçamento</h2><button class="x" onclick="closeCart()">×</button></div>
    <div class="dbody" id="dbody"></div>
    <div class="dfoot">
      <div class="row tot" style="border:0;margin:0 0 12px;padding:0"><span>Total</span><span id="dtotal">R$ 0,00</span></div>
      <a class="btn wpp block" id="dlink" href="#" target="_blank" rel="noopener">Enviar no WhatsApp</a>
      <a class="btn ghost block" href="carrinho.html" style="margin-top:8px">Revisar pedido</a>
    </div>
  </aside>
  <div class="toast" id="toast"></div>`;
  document.body.appendChild(el);
}
function openCart(){ drawerHTML(); document.getElementById("drawer").classList.add("on"); document.getElementById("overlay").classList.add("on"); }
function closeCart(){ drawerHTML(); document.getElementById("drawer").classList.remove("on"); document.getElementById("overlay").classList.remove("on"); }

let toastTimer;
function toast(msg){
  drawerHTML();
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("on"), 1900);
}

function paintCart(){
  drawerHTML();
  const badge = document.getElementById("badge");
  if (badge) badge.textContent = cartCount();
  const body = document.getElementById("dbody");
  if (body){
    body.innerHTML = cart.length ? cart.map(c => {
      const p = byId(c.id); if(!p) return "";
      return `<div class="line">
        <div style="width:56px;height:56px;border-radius:9px;background:var(--panel2);display:grid;place-items:center;flex:none">
          <span style="transform:scale(.55);display:block">${ICONE}</span></div>
        <div style="flex:1;min-width:0">
          <div class="nm">${p.nome}</div>
          <div class="rf">${p.marca} · ${p.ref}</div>
          <div class="qty" style="margin-top:7px">
            <button onclick="changeQty('${p.id}',-1)">−</button><span>${c.q}</span><button onclick="changeQty('${p.id}',1)">+</button>
          </div>
        </div>
        <div style="font-weight:700;font-size:13.5px">${fmt(p.preco * c.q)}</div>
      </div>`;
    }).join("") : `<p style="color:var(--muted);font-size:13.5px;padding:18px 0">Seu orçamento está vazio. Escolha as peças no catálogo.</p>`;
  }
  const dt = document.getElementById("dtotal");
  if (dt) dt.textContent = fmt(cartTotal());
  const link = document.getElementById("dlink");
  if (link){
    link.href = cart.length ? whatsappLink() : "#";
    link.style.opacity = cart.length ? 1 : .45;
  }
}

/* ---------- cards ---------- */
function cardHTML(p){
  const tagClass = (p.tag === "Oferta" || p.tag === "Mais vendido") ? "hot" : "";
  return `<article class="pcard">
    ${p.tag ? `<span class="tag ${tagClass}">${p.tag}</span>` : ""}
    <a class="thumb" href="produto.html?id=${p.id}">${ICONE}</a>
    <div class="info">
      <div class="brandline">${p.marca}</div>
      <a class="nm" href="produto.html?id=${p.id}">${p.nome}</a>
      <div class="ref">${p.ref} · ${p.cat}</div>
      <div class="pr"><b>${fmt(p.preco)}</b><small>ou 3x ${parcelas(p.preco)}</small></div>
      <div class="actions">
        <a class="btn ghost" href="produto.html?id=${p.id}">Ver</a>
        <button class="btn primary" onclick="addToCart('${p.id}')">Adicionar</button>
      </div>
    </div>
  </article>`;
}

function renderList(target, lista){
  const el = typeof target === "string" ? document.getElementById(target) : target;
  if (!el) return;
  el.innerHTML = lista.length
    ? lista.map(cardHTML).join("")
    : `<div class="empty" style="grid-column:1/-1">Nenhuma peça encontrada. Mande o modelo e o ano no WhatsApp que a gente busca na distribuidora.</div>`;
}

/* ---------- busca no cabeçalho ---------- */
function wireSearch(){
  const q = document.getElementById("q");
  if (!q) return;
  q.addEventListener("keydown", e => {
    if (e.key === "Enter"){
      const v = q.value.trim();
      location.href = v ? `produtos.html?busca=${encodeURIComponent(v)}` : "produtos.html";
    }
  });
  const b = document.getElementById("qbtn");
  if (b) b.onclick = () => {
    const v = q.value.trim();
    location.href = v ? `produtos.html?busca=${encodeURIComponent(v)}` : "produtos.html";
  };
}

document.addEventListener("DOMContentLoaded", () => {
  drawerHTML();
  paintCart();
  wireSearch();
  const badge = document.getElementById("badge");
  if (badge) badge.onclick = openCart;
});
