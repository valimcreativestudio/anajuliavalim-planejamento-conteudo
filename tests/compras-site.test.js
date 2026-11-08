// Minhas Compras: telas no navegador (celular), usando o servidor simulado
const assert = require('assert');
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const { criar } = require('./simulador-compras.js');
const dir = path.join(__dirname, '..', 'compras'), cap = path.join(__dirname, 'capturas');
const G = criar(); G.ctx.configurar(); const chave = G.props.CHAVE;
G.paginas['https://www.tokstok.com.br/abajur'] = { html: '<meta property="og:title" content="Abajur de mesa Lumi"><meta property="og:image" content="https://img.test/a.jpg"><script type="application/ld+json">{"@type":"Product","offers":{"@type":"Offer","price":"189.90"}}</script>' };
G.paginas['https://www.amazon.com.br/dp/1'] = { codigo: 503 };
async function abrir(b, nome) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  const erros = []; pg.on('pageerror', e => erros.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/fonts|img\.test|Failed to load resource/.test(m.text())) erros.push(m.text()); });
  await pg.route('http://site.test/**', r => { const u = new URL(r.request().url()); const f = path.join(dir, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); let body = fs.readFileSync(f); if (f.endsWith('index.html')) body = body.toString().replace("connect-src 'self'", "connect-src 'self' https://script.google.com"); r.fulfill({ body, contentType: f.endsWith('.js') ? 'text/javascript' : f.endsWith('.png') ? 'image/png' : 'text/html' }); });
  await pg.route('https://script.google.com/**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(G.post(r.request().postData())) }));
  await pg.route(/fonts|img\.test/, r => r.abort());
  await pg.goto('http://site.test/'); await pg.waitForTimeout(300);
  return { pg, ctx, erros };
}
const espera = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  const { pg, erros } = await abrir(b);
  // Mercado: começa sem itens, cria básicos em Inhumas
  assert.ok(await pg.isVisible('text=Vamos montar a lista de Inhumas'));
  await pg.click('text=Começar com itens básicos'); await espera(150);
  assert.ok(await pg.isVisible('text=Toque no que acabou'));
  for (const n of ['Arroz', 'Feijão', 'Detergente']) await pg.click(`button[aria-label="Acabou: pôr na lista: ${n}"]`);
  await pg.fill('#mNome', 'leite condensado'); await pg.press('#mNome', 'Enter'); await espera(100);
  const lista = await pg.textContent('main');
  assert.ok(/Para comprar \(4\)/.test(lista), 'quatro itens para comprar');
  assert.ok(/Mercearia[\s\S]*Leite condensado/.test(lista), 'leite condensado foi para mercearia');
  assert.ok(/Limpeza[\s\S]*Detergente/.test(lista));
  await pg.screenshot({ path: path.join(cap, 'compras-mercado.png') });
  // a outra casa é separada
  await pg.click('button[data-act="casa"]:has-text("Goiânia")'); await espera(100);
  assert.ok(await pg.isVisible('text=Vamos montar a lista de Goiânia'));
  await pg.click('button[data-act="casa"]:has-text("Inhumas")'); await espera(100);
  // modo mercado
  await pg.click('text=Estou no mercado'); await espera(100);
  await pg.click('#feira button[data-act="fcheck"]:has-text("Arroz")');
  await pg.click('#feira button[data-act="fcheck"]:has-text("Feijão")');
  assert.ok(/2\s*de 4 no carrinho/.test(await pg.textContent('#feira')));
  await pg.screenshot({ path: path.join(cap, 'compras-feira.png') });
  await pg.click('text=Terminei a compra (2)'); await espera(150);
  assert.ok(/Para comprar \(2\)/.test(await pg.textContent('main')));
  await pg.click('#toastBtn'); await espera(150);
  assert.ok(/Para comprar \(4\)/.test(await pg.textContent('main')), 'desfazer volta os itens');

  // Desejos sem planilha: texto simples vai para Não organizados
  await pg.click('nav button[data-v="desejos"]'); await espera(100);
  await pg.fill('#dTexto', 'Tapete para a sala'); await pg.press('#dTexto', 'Enter'); await espera(100);
  assert.ok(await pg.isVisible('.card:has-text("Tapete para a sala")'));
  assert.ok(await pg.isVisible('.card:has-text("Não organizado")'));
  assert.ok(await pg.isVisible('.card .tag.espera'), 'novo desejo fica esfriando');

  // Conectar à planilha
  await pg.click('nav button[data-v="ajustes"]'); await espera(100);
  await pg.fill('#cApi', 'https://script.google.com/macros/s/ABC/exec');
  await pg.fill('#cChave', 'errada'); await pg.click('text=Conectar'); await espera(300);
  assert.ok(/Chave errada/.test(await pg.textContent('#toast')));
  delete G.cache.erros;
  await pg.fill('#cChave', chave.toLowerCase()); await pg.click('[data-form="conectar"] button'); await espera(600);
  assert.ok(/Tudo salvo/.test(await pg.textContent('#syncTxt')), 'sincronizado');
  const linhas = G.SS.getSheetByName('DADOS').getLastRow();
  assert.ok(linhas > 40, 'dados foram para a planilha: ' + linhas);

  // Link com preço lido automaticamente
  await pg.click('nav button[data-v="desejos"]'); await espera(100);
  await pg.fill('#dTexto', 'Olha que lindo https://www.tokstok.com.br/abajur'); await pg.press('#dTexto', 'Enter'); await espera(700);
  const card = pg.locator('.card:has-text("R$")').first();
  assert.ok(/189,90/.test(await card.textContent()), 'preço lido: ' + await card.textContent());
  assert.ok(/Olha que lindo/.test(await card.textContent()), 'texto colado vira o nome');
  // editar: categoria em 3 níveis, segundo link bloqueado com preço digitado
  await card.click(); await espera(150);
  await pg.selectOption('select[data-edcat="0"]', 'cat-casa'); await espera(50);
  await pg.selectOption('select[data-edcat="1"]', 'cat-casa-decor'); await espera(50);
  await pg.selectOption('select[data-edcat="2"]', 'cat-casa-decor-quarto'); await espera(50);
  await pg.click('button[data-act="edprio"][data-v="preciso"]');
  await pg.fill('#novoLink', 'https://www.amazon.com.br/dp/1'); await pg.click('button[data-act="edaddlink"]'); await espera(500);
  assert.ok(/não deixou ler o preço/.test(await pg.textContent('#modal')), 'avisa que a loja bloqueou');
  await pg.fill('#lp1', '149,90'); await pg.press('#lp1', 'Tab'); await espera(100);
  assert.ok(/Amazon · mais barato/.test(await pg.textContent('#modal')), 'destaca o mais barato na hora');
  await pg.screenshot({ path: path.join(cap, 'compras-editar.png'), fullPage: false });
  await pg.click('button[data-act="edsalvar"]'); await espera(200);
  await pg.click('button[data-act="dcat"][data-v="cat-casa"]'); await espera(100);
  assert.ok(await pg.isVisible('text=Tudo em Casa'), 'subcategorias aparecem');
  const c2 = await pg.textContent('.card:has-text("Olha que lindo")');
  assert.ok(/149,90/.test(c2) && /Amazon/.test(c2) && /2 lojas/.test(c2) && /Casa › Decoração › Quarto/.test(c2), 'mostra o mais barato e o caminho: ' + c2);
  await pg.screenshot({ path: path.join(cap, 'compras-desejos.png') });
  // nova categoria
  await pg.click('button[data-act="cats"]'); await espera(100);
  await pg.click('button[data-act="cmnova"][data-pai="cat-casa"]'); await espera(50);
  await pg.fill('[data-cm="nome"]', 'Jardim'); await pg.click('button[data-act="cmsalvar"]'); await espera(100);
  assert.ok(await pg.isVisible('#modal .no:has-text("Jardim")'));
  await pg.keyboard.press('Escape'); await espera(100);
  // marcar como comprado e apagar com desfazer
  await pg.click('.card:has-text("Olha que lindo")'); await pg.click('button[data-act="edstatus"][data-v="comprei"]'); await pg.click('button[data-act="edsalvar"]'); await espera(100);
  await pg.click('button[data-act="dstatus"][data-v="comprei"]'); await espera(100);
  assert.ok(await pg.isVisible('.card:has-text("Olha que lindo")'));
  await pg.waitForTimeout(1500);

  // Segundo aparelho recebe tudo
  const B = await abrir(b);
  await B.pg.evaluate(c => localStorage.setItem('compras.conexao', JSON.stringify({ api: 'https://script.google.com/macros/s/ABC/exec', chave: c })), chave);
  await B.pg.reload(); await espera(800);
  await B.pg.click('nav button[data-v="desejos"]'); await B.pg.click('button[data-act="dstatus"][data-v="comprei"]'); await espera(100);
  assert.ok(await B.pg.isVisible('.card:has-text("Olha que lindo")'), 'outro aparelho vê o desejo');
  await B.pg.click('nav button[data-v="mercado"]'); await espera(100);
  assert.ok(/Para comprar \(4\)/.test(await B.pg.textContent('main')), 'outro aparelho vê a lista do mercado');
  // tema escuro e letra grande
  await B.pg.click('nav button[data-v="ajustes"]'); await B.pg.selectOption('#aTema', 'escuro'); await B.pg.check('#aLetra'); await espera(100);
  assert.strictEqual(await B.pg.evaluate(() => document.documentElement.dataset.tema), 'escuro');
  await B.pg.click('nav button[data-v="desejos"]'); await espera(100);
  await B.pg.screenshot({ path: path.join(cap, 'compras-escuro.png') });
  const largura = await B.pg.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(largura <= 390, 'sem rolagem para o lado: ' + largura);

  console.log('erros:', erros.concat(B.erros));
  await b.close();
  if (erros.length || B.erros.length) process.exit(1);
  console.log('compras-site: ok');
})().catch(e => { console.error(e); process.exit(1); });
