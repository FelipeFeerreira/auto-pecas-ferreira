/* ==========================================================
   Auto Peças Ferreira — markup da página de peça (PDP).
   Fonte única: usado pelo build.js (pré-renderiza no HTML, para
   funcionar sem JavaScript) e pelo produto.html (reforço no carregamento).
   ========================================================== */
window.pdpHTML = function (p, u) {
  const ICONE = u.ICONE, fmt = u.fmt, parcelas = u.parcelas, cfg = u.cfg || {};
  const esgotado = p.estoque <= 0;
  return `
    <div class="gal">${p.foto ? `<img src="${p.foto}" alt="${p.nome}" width="640" height="480" loading="eager" decoding="async">` : ICONE}</div>
    <div>
      <div class="brandline">${p.marca}</div>
      <h1>${p.nome}</h1>
      <div class="ref" style="font-size:12.5px">Código: <b>${p.ref}</b> · Categoria: ${p.cat}</div>

      <div class="pricebox">
        <div class="big">${fmt(p.preco)}</div>
        <div class="inst">ou 3x de ${parcelas(p.preco)} sem juros no cartão · Pix com ${fmt(p.preco)} na entrega</div>
        <div class="price-note" style="font-size:11.5px;color:var(--muted);margin-top:6px">Preços sujeitos a alteração sem aviso. Confirme o valor pelo WhatsApp antes de fechar.</div>
        <div class="stock"><span class="dot"></span>${esgotado ? "Sob encomenda — consulte prazo" : `${p.estoque} em estoque · entrega hoje se confirmar até 15h`}</div>
      </div>

      <div class="buyrow">
        <div class="qty"><button type="button" onclick="menos()" aria-label="Diminuir quantidade">−</button><span id="qtd" aria-live="polite">1</span><button type="button" onclick="mais()" aria-label="Aumentar quantidade">+</button></div>
        <button class="btn primary" style="flex:1;min-width:200px" onclick="comprar()">Adicionar ao orçamento</button>
      </div>
      <div class="buyrow">
        <a class="btn wpp block" href="https://wa.me/5514981473778?text=${encodeURIComponent("Olá! Quero a peça " + p.nome + " (" + p.marca + " " + p.ref + ")")}" target="_blank" rel="noopener">Perguntar no WhatsApp</a>
      </div>

      <div class="specs">
        <div><span>Marca</span><span>${p.marca}</span></div>
        <div><span>Código do fabricante</span><span>${p.ref}</span></div>
        <div><span>Categoria</span><span>${p.cat}</span></div>
        <div><span>Garantia</span><span>3 meses (fabricante)</span></div>
        <div><span>Pagamento</span><span>Pix, dinheiro ou cartão na entrega</span></div>
        <div><span>Entrega</span><span>No mesmo dia em Salto, Itu e Pardinho</span></div>
      </div>

      <div class="applist">${p.aplicacao.map(a => `<span>${a}</span>`).join("")}</div>

      <details class="acc" open><summary>Descrição</summary><p>${p.desc}</p></details>
      <details class="acc"><summary>Aplicação — confira antes de comprar</summary><p>Compatível com: ${p.aplicacao.join("; ")}. Se o seu carro não estiver na lista, mande o modelo, o ano e o código do motor no WhatsApp que a gente confirma na distribuidora antes de você pagar.</p></details>
      <details class="acc"><summary>Garantia e troca</summary><p>Garantia de 3 meses do fabricante contra defeito de fabricação. Não cobre instalação incorreta, contaminação de combustível ou peça aplicada em veículo incompatível. Troca em até 7 dias com a peça sem uso e com a embalagem.</p></details>
      <details class="acc"><summary>Entrega e pagamento</summary><p>${cfg.entrega || ""}. Pagamento no Pix, dinheiro ou cartão na entrega. Retirada no balcão em Salto.</p></details>
    </div>`;
};
