/* ==========================================================
   Auto Peças Ferreira — dados do catálogo
   Trocar preço/estoque aqui. NUNCA colocar custo neste arquivo:
   ele é público (vai para o site).

   FOTO DA PEÇA (campo opcional `foto`):
   - valor: caminho relativo a partir da raiz do site, ex. "assets/pecas/F000TE159A.jpg"
   - formato: JPG ou WebP, fundo branco liso, peça centralizada, sem texto
   - proporção: 4:3 deitada (ex. 1600x1200 ou 800x600)
   - tamanho: até 150 KB por foto
   - nome do arquivo: a referência do produto (F000TE159A.jpg) ou o id (bomba-bosch-flex.jpg)
   - sem o campo (ou vazio), o card mostra o ícone de categoria atual
   ========================================================== */
window.WHATSAPP = "5514981473778";
window.LOJA = {
  nome: "Auto Peças Ferreira",
  cidade: "Salto · Itu · Pardinho",
  entrega: "Entrega no mesmo dia para pedidos confirmados até 15h",
  garantia: "3 meses de garantia em todas as peças",
  pix: "Pix na entrega ou retirada no balcão"
};

window.PRODUTOS = [
  {id:"bomba-bosch-flex", nome:"Bomba de combustível Bosch flex", marca:"Bosch", ref:"F000TE159A",
   cat:"Combustível", aplicacao:["Gol G5/G6 1.0 2008–2013","Fox 1.0/1.6 2004–2014","Voyage 1.0 2009–2014","Saveiro 1.6 2010–2014"],
   preco:370, de:0, estoque:2, destaque:true, tag:"Oferta", foto:"",
   desc:"Bomba elétrica interna original Bosch para sistema flex. Substitui a peça original sem adaptação. Acompanha anel de vedação."},

  {id:"bomba-bosch-3bar", nome:"Bomba de combustível elétrica 3 bar 12V", marca:"Bosch", ref:"F000TE181A",
   cat:"Combustível", aplicacao:["HB20 1.0/1.6 2012–2019","C3 Picasso 1.6 2010–2015","Aircross 1.6 2010–2016"],
   preco:529, de:0, estoque:1, destaque:true, tag:"",
   desc:"Bomba interna 3 bar para motores flex. Peça de reposição original Bosch, com conector e filtro de sucção."},

  {id:"refil-bosch", nome:"Refil de bomba de combustível Bosch", marca:"Bosch", ref:"F000TE159A-R",
   cat:"Combustível", aplicacao:["Gol","Fox","Polo","Saveiro — sistema Bosch"],
   preco:189, de:0, estoque:3, destaque:false, tag:"",
   desc:"Refil (somente a bomba) para quem já tem o copo e a boia em bom estado. Mesma vazão da bomba completa."},

  {id:"filtro-oleo-bosch", nome:"Filtro de óleo Bosch", marca:"Bosch", ref:"F026407084",
   cat:"Filtros", aplicacao:["Gol","Fox","Polo","Voyage 1.0/1.6"],
   preco:39, de:0, estoque:12, destaque:false, tag:"",
   desc:"Filtro de óleo com válvula antidreno. Troca a cada 10 mil km ou junto com o óleo."},

  {id:"filtro-ar-bosch", nome:"Filtro de ar Bosch", marca:"Bosch", ref:"F026400208",
   cat:"Filtros", aplicacao:["Gol G5/G6","Fox","Voyage 1.0–1.6"],
   preco:69, de:0, estoque:8, destaque:false, tag:"",
   desc:"Elemento filtrante de papel plissado. Melhora consumo e protege o motor de poeira."},

  {id:"filtro-comb-bosch", nome:"Filtro de combustível Bosch", marca:"Bosch", ref:"F026402047",
   cat:"Filtros", aplicacao:["Gol","Fox","Polo","Saveiro flex"],
   preco:59, de:0, estoque:6, destaque:false, tag:"",
   desc:"Filtro de linha para sistema flex. Troca recomendada a cada 20 mil km."},

  {id:"pastilha-bosch", nome:"Pastilha de freio dianteira Bosch", marca:"Bosch", ref:"0986494745",
   cat:"Freios", aplicacao:["Gol G5/G6","Fox","Voyage","Saveiro"],
   preco:179, de:0, estoque:4, destaque:true, tag:"Mais vendido",
   desc:"Jogo com 4 pastilhas, composto semi-metálico de baixo ruído. Não acompanha sensor."},

  {id:"disco-freio", nome:"Disco de freio ventilado dianteiro", marca:"Fremax", ref:"BD-1204",
   cat:"Freios", aplicacao:["Gol G5/G6 1.0","Fox 1.0 2004–2010"],
   preco:259, de:0, estoque:2, destaque:false, tag:"",
   desc:"Par de discos ventilados, diâmetro 256 mm. Recomenda-se trocar em par com as pastilhas."},

  {id:"lona-freio", nome:"Lona de freio traseira (jogo)", marca:"Nakata", ref:"LN-3320",
   cat:"Freios", aplicacao:["Gol","Parati","Saveiro — tambor traseiro"],
   preco:149, de:0, estoque:3, destaque:false, tag:"",
   desc:"Jogo para os dois lados, com rebite. Para veículos com freio a tambor na traseira."},

  {id:"correia-dentada", nome:"Kit correia dentada + tensor", marca:"Gates", ref:"CT-1088-K",
   cat:"Motor", aplicacao:["Gol 1.0 8v","Fox 1.0 8v","Voyage 1.0 8v"],
   preco:289, de:0, estoque:2, destaque:true, tag:"",
   desc:"Correia dentada e tensor originais. Troca a cada 60 mil km. Recomendado trocar junto com a bomba d'água."},

  {id:"bomba-agua", nome:"Bomba d'água", marca:"Urba", ref:"BA-2210",
   cat:"Motor", aplicacao:["Gol 1.0/1.6 8v","Fox 1.0","Saveiro 1.6"],
   preco:315, de:0, estoque:1, destaque:false, tag:"",
   desc:"Bomba d'água com polia, para motor 8v. Evita superaquecimento; troque junto com a correia."},

  {id:"vela-iridium", nome:"Vela de ignição iridium (jogo 4)", marca:"NGK", ref:"FR7DC+",
   cat:"Motor", aplicacao:["Gol","Fox","Polo","Voyage 1.0/1.6"],
   preco:195, de:0, estoque:5, destaque:false, tag:"",
   desc:"Jogo com 4 velas de irídio, vida útil de até 60 mil km. Melhora partida a frio."},

  {id:"amortecedor", nome:"Amortecedor dianteiro Monroe", marca:"Monroe", ref:"M-7412",
   cat:"Suspensão", aplicacao:["Gol G5/G6","Fox 2004–2014","Voyage"],
   preco:399, de:0, estoque:2, destaque:false, tag:"",
   desc:"Amortecedor a gás, unidade. Recomendado trocar em par e revisar batentes e coxins."},

  {id:"pivo", nome:"Pivô de suspensão", marca:"Nakata", ref:"PV-1140",
   cat:"Suspensão", aplicacao:["Gol","Fox","Voyage","Saveiro"],
   preco:89, de:0, estoque:6, destaque:false, tag:"",
   desc:"Pivô de suspensão dianteiro com pino e porca. Sintoma de folga: estalo em lombada."},

  {id:"terminal-direcao", nome:"Terminal de direção", marca:"Nakata", ref:"TD-2218",
   cat:"Suspensão", aplicacao:["Gol G5/G6","Fox","Voyage"],
   preco:82, de:0, estoque:4, destaque:false, tag:"",
   desc:"Terminal de direção externo. Folga no volante e pneu com desgaste irregular indicam troca."},

  {id:"bateria-60", nome:"Bateria 60Ah 18 meses", marca:"Moura", ref:"B60-18M",
   cat:"Elétrica", aplicacao:["Carros de passeio em geral","Utilitários leves"],
   preco:489, de:0, estoque:3, destaque:true, tag:"Entrega hoje",
   desc:"Bateria selada 60Ah, garantia de 18 meses. Levamos e instalamos na sua oficina."},

  {id:"sensor-rotacao", nome:"Sensor de rotação (fase/rotação)", marca:"Bosch", ref:"SR-1042",
   cat:"Elétrica", aplicacao:["Gol","Fox","Polo 1.6"],
   preco:139, de:0, estoque:2, destaque:false, tag:"",
   desc:"Sensor indutivo do virabrequim. Sintoma de falha: motor morre quente e não pega."},

  {id:"bobina", nome:"Bobina de ignição", marca:"Bosch", ref:"BI-3310",
   cat:"Elétrica", aplicacao:["Gol 1.0 8v","Fox 1.0","Voyage 1.0"],
   preco:219, de:0, estoque:2, destaque:false, tag:"",
   desc:"Bobina de ignição com módulo. Falha causa perda de potência e luz de injeção acesa."},

  {id:"oleo-5w30", nome:"Óleo 5W30 sintético 1L", marca:"Mobil", ref:"5W30-S1",
   cat:"Óleo e fluidos", aplicacao:["Motores flex e gasolina","Recomendado para uso urbano"],
   preco:49, de:0, estoque:24, destaque:false, tag:"",
   desc:"Óleo sintético API SP. Para motor 1.0 a 2.0. Embalagem de 1 litro."},

  {id:"fluido-dot4", nome:"Fluido de freio DOT 4 500ml", marca:"Bosch", ref:"DOT4-500",
   cat:"Óleo e fluidos", aplicacao:["Todos os veículos com freio hidráulico"],
   preco:33, de:0, estoque:10, destaque:false, tag:"",
   desc:"Fluido DOT 4, ponto de ebulição alto. Troca a cada 2 anos."}
];
