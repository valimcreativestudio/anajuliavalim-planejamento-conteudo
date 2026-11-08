// Minhas Compras: servidor (chave, sincronização, leitura de preço dos links, gatilho diário)
const assert = require('assert');
const { criar } = require('./simulador-compras.js');
const G = criar();
G.ctx.configurar();
const chave = G.props.CHAVE;
assert.match(chave, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/, 'chave no formato XXXX-XXXX-XXXX');
assert.ok(G.enviados[0].body.includes(chave), 'chave enviada por e-mail');
assert.strictEqual(G.gatilhos.length, 1); G.ctx.configurar(); assert.strictEqual(G.gatilhos.length, 1, 'não duplica o gatilho');
assert.strictEqual(G.props.CHAVE, chave, 'configurar de novo mantém a chave');

// chave
assert.strictEqual(G.post({ action: 'ping', chave: 'ERRADA' }).erro, 'chave');
assert.ok(G.post({ action: 'ping', chave: chave.toLowerCase().replace(/-/g, ' ') }).ok, 'aceita minúscula e sem traço');
for (let i = 0; i < 25; i++) G.post({ action: 'ping', chave: 'x' });
assert.strictEqual(G.post({ action: 'ping', chave }).erro, 'chave', 'trava depois de muitas tentativas');
delete G.cache.erros;

// sincronização
const P = o => G.post(Object.assign({ chave }, o));
let r = P({ action: 'sync', desde: 0, mudancas: [
  { id: 'casa-inhumas', tipo: 'casa', atualizadoEm: 1, dados: { nome: 'Inhumas' } },
  { id: 'm1', tipo: 'mercado', atualizadoEm: 100, dados: { nome: 'Arroz', casaId: 'casa-inhumas', precisa: true } },
  { id: 'ruim id', tipo: 'mercado', atualizadoEm: 1, dados: {} },
  { id: 'x1', tipo: 'hack', atualizadoEm: 1, dados: {} }
] });
assert.ok(r.ok); assert.strictEqual(r.rev, 2, 'ignora id e tipo inválidos'); assert.strictEqual(r.registros.length, 2);
const rev1 = r.rev;
// outro aparelho manda versão mais antiga: não sobrescreve
r = P({ action: 'sync', desde: rev1, mudancas: [{ id: 'm1', tipo: 'mercado', atualizadoEm: 50, dados: { nome: 'Velho' } }] });
assert.strictEqual(r.registros.length, 0, 'versão velha não entra');
// versão mais nova entra e volta para os outros
r = P({ action: 'sync', desde: rev1, mudancas: [{ id: 'm1', tipo: 'mercado', atualizadoEm: 200, apagado: true, dados: { nome: 'Arroz' } }] });
assert.strictEqual(r.registros.length, 1); assert.strictEqual(r.registros[0].apagado, true);
// aparelho novo recebe tudo, inclusive o que foi apagado (para sumir lá também)
r = P({ action: 'sync', desde: 0, mudancas: [] });
assert.deepStrictEqual(r.registros.map(x => x.id).sort(), ['casa-inhumas', 'm1']);
assert.strictEqual(G.SS.getSheetByName('DADOS').cell(2, 3), 'Inhumas', 'nome legível na planilha');

// leitura de link
const ex = G.ctx.extrair_;
let e = ex(`<html><head><meta property="og:title" content="Luminária &amp; Cia"><meta property="og:image" content="/img/a.jpg"><script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"X","offers":{"@type":"Offer","price":"189.90","priceCurrency":"BRL"}}</script></head></html>`, 'https://www.tokstok.com.br/p/1');
assert.strictEqual(e.nome, 'Luminária & Cia'); assert.strictEqual(e.preco, 189.9); assert.strictEqual(e.foto, 'https://www.tokstok.com.br/img/a.jpg'); assert.strictEqual(e.loja, 'Tok&Stok');
e = ex(`<script type="application/ld+json">{"@graph":[{"@type":"WebPage"},{"@type":"Product","image":["https://c.dn/f.jpg"],"offers":[{"@type":"AggregateOffer","lowPrice":1299}]}]}</script><title>Sofá</title>`, 'https://www.mobly.com.br/x');
assert.strictEqual(e.preco, 1299); assert.strictEqual(e.foto, 'https://c.dn/f.jpg'); assert.strictEqual(e.nome, 'Sofá');
e = ex(`<meta content="49,90" property="product:price:amount"><title>Caneca</title>`, 'https://loja.com/c');
assert.strictEqual(e.preco, 49.9, 'meta com vírgula');
e = ex(`<span itemprop="price" content="1234.5">`, 'https://loja.com/c'); assert.strictEqual(e.preco, 1234.5);
e = ex(`<script>window.x={"salePrice":79.99}</script>`, 'https://loja.com/c'); assert.strictEqual(e.preco, 79.99); assert.strictEqual(e.fonte, 'pagina');
e = ex(`<div>Por apenas <b>R$ 2.349,00</b> à vista</div>`, 'https://loja.com/c'); assert.strictEqual(e.preco, 2349); assert.strictEqual(e.fonte, 'texto');
e = ex(`<title>Nada</title>`, 'https://www.amazon.com.br/dp/1'); assert.strictEqual(e.preco, null); assert.strictEqual(e.loja, 'Amazon');
assert.strictEqual(ex('<meta property="og:image" content="javascript:alert(1)">', 'https://a.com').foto, '', 'foto só https');

G.paginas['https://loja.com/abajur'] = { html: '<meta property="og:title" content="Abajur"><meta property="product:price:amount" content="120.00">' };
G.paginas['https://www.amazon.com.br/dp/9'] = { codigo: 503, html: '' };
r = P({ action: 'lerLink', url: 'https://loja.com/abajur' }); assert.ok(r.lido); assert.strictEqual(r.preco, 120); assert.strictEqual(r.nome, 'Abajur');
r = P({ action: 'lerLink', url: 'https://www.amazon.com.br/dp/9' }); assert.strictEqual(r.lido, false); assert.strictEqual(r.motivo, 'bloqueado'); assert.strictEqual(r.loja, 'Amazon');
r = P({ action: 'lerLink', url: 'file:///etc/passwd' }); assert.strictEqual(r.lido, false); assert.strictEqual(r.motivo, 'link');

// gatilho diário: atualiza preço, guarda o anterior; ignora digitado à mão e o que já foi comprado
P({ action: 'sync', desde: 0, mudancas: [
  { id: 'd1', tipo: 'desejo', atualizadoEm: 300, dados: { nome: 'Abajur', status: 'quero', links: [{ id: 'l1', url: 'https://loja.com/abajur', preco: 150 }, { id: 'l2', url: 'https://loja.com/abajur', preco: 99, precoManual: true }] } },
  { id: 'd2', tipo: 'desejo', atualizadoEm: 300, dados: { nome: 'Comprado', status: 'comprei', links: [{ id: 'l3', url: 'https://loja.com/abajur', preco: 150 }] } }
] });
const antes = G.buscados.length;
G.ctx.atualizarPrecosDiario();
assert.strictEqual(G.buscados.length - antes, 1, 'só busca o link automático do item que ainda quer');
r = P({ action: 'sync', desde: 0, mudancas: [] });
const d1 = r.registros.find(x => x.id === 'd1').dados;
assert.strictEqual(d1.links[0].preco, 120); assert.strictEqual(d1.links[0].antes, 150); assert.strictEqual(d1.links[0].hist.length, 1);
assert.strictEqual(d1.links[1].preco, 99);
console.log('compras-servidor: ok');
