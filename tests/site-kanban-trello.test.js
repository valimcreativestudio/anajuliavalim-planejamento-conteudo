// Kanban estilo Trello: etiquetas, concluído (ok), datas, anexos e capa colorida
const G = require('./simulador-google.js');
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..'), cap = n => path.join(__dirname, 'capturas', n);
const P = o => G.post(JSON.stringify(o));
let falhas = 0; const ok = (nome, cond, extra) => { if (!cond) falhas++; console.log((cond ? 'ok   ' : 'FALHA') + ' ' + nome + (extra !== undefined ? ' → ' + extra : '')); };
G.configurar(); const senha = G.logs[0].match(/Senha provisória: (\S+)/)[1];
const ta = P({ action: 'login', login: 'ana@agencia.com', senha }).token;
P({ action: 'salvarMarca', token: ta, marca: { nome: 'Liso' } });
const qid = P({ action: 'quadroSalvar', token: ta, quadro: { nome: 'BeCreator', visibilidade: 'equipe', estilo: { fundo: 'g:noite' }, colunas: [{ nome: 'Calendário nov/26' }, { nome: 'Em andamento' }, { nome: 'Concluído 🎉' }] } }).id;
let q = P({ action: 'listar', token: ta }).quadros[0];
ok('quadro novo já vem com 6 etiquetas de cor', q.etiquetas.length === 6, q.etiquetas.map(e => e.id).join(','));
const c1 = q.colunas[0].id;
const k = ['Aprovação das artes', 'Artes BeCreator', 'NOVEMBRO'].map((t, i) => P({ action: 'cartaoSalvar', token: ta, cartao: { quadroId: qid, coluna: c1, titulo: t, ordem: i + 1 } }).id);
const hoje = new Date(); const iso = d => d.toISOString().slice(0, 10);
(async () => {
  fs.mkdirSync(path.join(__dirname, 'capturas'), { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 860 } }); const erros = [];
  pg.on('pageerror', e => erros.push(e.message));
  await pg.route('http://site.test/**', r => { const u = new URL(r.request().url()); const f = path.join(dir, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); let body = fs.readFileSync(f); if (f.endsWith('index.html')) body = body.toString().replace("connect-src 'self'", "connect-src 'self' https://api.test"); if (f.endsWith('config.js')) body = body.toString().replace(/API_URL: "[^"]*"/, 'API_URL: "https://api.test/exec"'); r.fulfill({ body, contentType: f.endsWith('.js') ? 'text/javascript' : 'text/html' }); });
  await pg.route('https://api.test/**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(G.post(r.request().postData())) }));
  await pg.route(/fonts|drive|accounts\.google/, r => r.abort());
  await pg.goto('http://site.test/#quadros'); await pg.waitForTimeout(300);
  await pg.fill('#lgLogin', 'ana@agencia.com'); await pg.fill('#lgSenha', senha); await pg.click('#lgBtn'); await pg.waitForTimeout(900);
  await pg.goto('http://site.test/#quadros'); await pg.waitForTimeout(300);
  if (await pg.isVisible('.qd-it')) { await pg.click('.qd-it'); await pg.waitForTimeout(300); }
  // ---- círculo de concluído direto no quadro
  await pg.click('.qc:has-text("Aprovação das artes") .qc-ok'); await pg.waitForTimeout(500);
  ok('círculo marca como concluído sem abrir o cartão', !(await pg.isVisible('#qcDlg[open]')) && P({ action: 'listar', token: ta }).cartoes.find(c => c.id === k[0]).feito === true);
  // ---- cartão: etiquetas, data, anexo, capa
  await pg.click('.qc:has-text("Artes BeCreator")'); await pg.waitForTimeout(300);
  await pg.click('#qcForm button:has-text("Etiquetas")'); await pg.waitForTimeout(150);
  await pg.click('#qcForm button:has-text("Criar ou editar etiquetas")'); await pg.waitForTimeout(150);
  await pg.fill('#qcForm .etq-ed:nth-of-type(1) input:not([type=color])', 'Urgente');
  await pg.click('#qcForm button:has-text("+ Nova etiqueta")'); await pg.waitForTimeout(100);
  const eds = await pg.$$('#qcForm .etq-ed'); await (await eds[eds.length - 1].$('input:not([type=color])')).fill('Cliente');
  await pg.click('#etqSalvar'); await pg.waitForTimeout(700);
  q = P({ action: 'listar', token: ta }).quadros[0];
  ok('etiquetas criadas e nomeadas', q.etiquetas.length === 7 && q.etiquetas[0].nome === 'Urgente' && q.etiquetas[6].nome === 'Cliente', q.etiquetas.map(e => e.nome || e.id).join(','));
  await pg.click('#qcForm .etq-op:has-text("Urgente")'); await pg.click('#qcForm .etq-op:has-text("Cliente")'); await pg.waitForTimeout(150);
  await pg.click('#qcForm button:has-text("Pronto")'); await pg.waitForTimeout(150);
  await pg.fill('#qcPrazo', iso(new Date(hoje.getTime() - 3 * 864e5)));
  await pg.click('#qcForm button:has-text("📎 Anexo")'); await pg.waitForTimeout(150);
  const an = await pg.$$('#qcForm .an-it input'); await an[0].fill('Pasta das artes'); await an[1].fill('https://drive.google.com/drive/folders/abc');
  await pg.screenshot({ path: cap('kanban-cartao.png') });
  await pg.click('#qcSalvar'); await pg.waitForTimeout(800);
  const c2 = P({ action: 'listar', token: ta }).cartoes.find(c => c.id === k[1]);
  ok('cartão salvo com 2 etiquetas, prazo e anexo', c2.etiquetas.length === 2 && c2.prazo && c2.anexos.length === 1, JSON.stringify([c2.etiquetas, c2.prazo, c2.anexos]));
  ok('no quadro: etiquetas com nome, data vencida em vermelho e 📎 1', (await pg.textContent('.qc:has-text("Artes BeCreator") .qc-etq')).includes('Urgente') && await pg.isVisible('.qc:has-text("Artes BeCreator") .qc-data.atraso') && (await pg.textContent('.qc:has-text("Artes BeCreator") .meta')).includes('📎 1'));
  // capa cheia
  await pg.click('.qc:has-text("NOVEMBRO")'); await pg.waitForTimeout(300);
  await pg.click('#qcForm .qc-c >> nth=4'); await pg.waitForTimeout(150);
  await pg.check('#qcForm input[name=qcCapa] >> nth=1'); await pg.waitForTimeout(150);
  await pg.click('#qcSalvar'); await pg.waitForTimeout(800);
  ok('capa: cartão todo colorido', await pg.isVisible('.qc.capa-cheia:has-text("NOVEMBRO")') && P({ action: 'listar', token: ta }).cartoes.find(c => c.id === k[2]).capa === 'cheia');
  // concluir dentro do cartão: data fica verde
  await pg.click('.qc:has-text("Artes BeCreator")'); await pg.waitForTimeout(300);
  await pg.click('#qcForm .qc-ok.grande'); await pg.click('#qcSalvar'); await pg.waitForTimeout(800);
  ok('concluído: data fica verde', await pg.isVisible('.qc:has-text("Artes BeCreator") .qc-data.ok'));
  await pg.screenshot({ path: cap('kanban-trello.png') });
  // segurança: etiqueta inventada e link perigoso são ignorados
  P({ action: 'cartaoSalvar', token: ta, cartao: { id: k[2], titulo: 'NOVEMBRO', etiquetas: ['naoexiste'], anexos: [{ nome: 'x', url: 'javascript:alert(1)' }] } });
  const c3 = P({ action: 'listar', token: ta }).cartoes.find(c => c.id === k[2]);
  ok('etiqueta inventada e link javascript: descartados', c3.etiquetas.length === 0 && c3.anexos.length === 0);
  ok('sem erros', !erros.length, erros.join(' | '));
  await b.close(); console.log(falhas ? falhas + ' FALHA(S)' : 'tudo certo'); process.exit(falhas ? 1 : 0);
})();
