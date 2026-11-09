// Tela: quadros livres e reordenar a grade
const G = require('./simulador-google.js');
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..'), cap = n => path.join(__dirname, 'capturas', n);
const P = o => G.post(JSON.stringify(o));
let falhas = 0; const ok = (nome, cond, extra) => { if (!cond) falhas++; console.log((cond ? 'ok   ' : 'FALHA') + ' ' + nome + (extra !== undefined ? ' → ' + extra : '')); };
G.configurar(); const senha = G.logs[0].match(/Senha provisória: (\S+)/)[1];
const ta = P({ action: 'login', login: 'ana@agencia.com', senha }).token;
const liso = P({ action: 'salvarMarca', token: ta, marca: { nome: 'Liso' } }).id;
P({ action: 'salvarUsuario', token: ta, usuario: { nome: 'Sofi', login: 'sofi@x.com', papel: 'social', marcas: [liso], senha: 'Teste#2026' } });
const mes = new Date().toISOString().slice(0, 7);
const ids = ['03', '10', '17', '24'].map((d, i) => P({ action: 'salvarPauta', token: ta, pauta: { marcaId: liso, data: `${mes}-${d}`, postagem: 'Post ' + (i + 1), formato: 'Carrossel' } }).id);
const fixo = P({ action: 'salvarPauta', token: ta, pauta: { marcaId: liso, data: `${mes}-28`, postagem: 'Já agendado' } }).id;
P({ action: 'acao', token: ta, id: fixo, acao: 'definir', status: 'Agendado' });
const datas = () => Object.fromEntries(P({ action: 'listar', token: ta }).pautas.filter(p => ids.includes(p.id)).map(p => [p.postagem, p.data.slice(8)]));
(async () => {
  fs.mkdirSync(path.join(__dirname, 'capturas'), { recursive: true });
  const b = await chromium.launch();
  const abrir = async vp => {
    const pg = await b.newPage({ viewport: vp }); pg.erros = []; pg.on('pageerror', e => pg.erros.push(e.message)); pg.on('dialog', d => d.accept());
    await pg.route('http://site.test/**', r => { const u = new URL(r.request().url()); const f = path.join(dir, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); let body = fs.readFileSync(f); if (f.endsWith('index.html')) body = body.toString().replace("connect-src 'self'", "connect-src 'self' https://api.test"); if (f.endsWith('config.js')) body = body.toString().replace(/API_URL: "[^"]*"/, 'API_URL: "https://api.test/exec"'); r.fulfill({ body, contentType: f.endsWith('.js') ? 'text/javascript' : 'text/html' }); });
    await pg.route('https://api.test/**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(G.post(r.request().postData())) }));
    await pg.route(/fonts|drive|accounts\.google/, r => r.abort());
    await pg.goto('http://site.test/#grade'); await pg.waitForTimeout(300);
    await pg.fill('#lgLogin', 'sofi@x.com'); await pg.fill('#lgSenha', 'Teste#2026'); await pg.click('#lgBtn'); await pg.waitForTimeout(900);
    return pg;
  };
  const pg = await abrir({ width: 1280, height: 900 });
  // ---------- reordenar grade
  await pg.goto('http://site.test/#grade'); await pg.waitForTimeout(400);
  await pg.click('button:has-text("Reordenar grade")'); await pg.waitForTimeout(300);
  ok('modo reordenar abre', await pg.isVisible('.rd-barra') && await pg.isDisabled('#rdSalvar'));
  ok('post agendado aparece travado', (await pg.$$('.tile.rd.fixo')).length === 1);
  // arrastar o Post 1 (o mais antigo, último) para o lugar do Post 4 (o mais recente, primeiro)
  await pg.dragAndDrop('.tile.rd:has-text("Post 1")', '.tile.rd:has-text("Post 4")'); await pg.waitForTimeout(200);
  ok('arrastar muda as datas na tela', /era/.test(await pg.textContent('.tile.rd:has-text("Post 1")')) && !(await pg.isDisabled('#rdSalvar')));
  ok('nada gravado antes de Salvar', JSON.stringify(datas()) === JSON.stringify({ 'Post 1': '03', 'Post 2': '10', 'Post 3': '17', 'Post 4': '24' }), JSON.stringify(datas()));
  await pg.screenshot({ path: cap('grade-reordenar.png'), fullPage: true });
  // sair sem salvar: volta como antes
  await pg.goto('http://site.test/#calendario'); await pg.waitForTimeout(300); await pg.goto('http://site.test/#grade'); await pg.waitForTimeout(300);
  ok('saiu sem salvar: volta como antes', !(await pg.isVisible('.rd-barra')) && datas()['Post 1'] === '03');
  // de novo, agora pelo toque (celular) e salvando
  await pg.click('button:has-text("Reordenar grade")'); await pg.waitForTimeout(200);
  await pg.click('.tile.rd:has-text("Post 1")'); await pg.click('.tile.rd:has-text("Post 4")'); await pg.waitForTimeout(200);
  await pg.click('#rdSalvar'); await pg.waitForTimeout(800);
  const d1 = datas();
  ok('toque + Salvar grava a nova ordem', d1['Post 1'] === '24' && d1['Post 4'] === '17' && d1['Post 3'] === '10' && d1['Post 2'] === '03', JSON.stringify(d1));
  ok('agendado não mudou', P({ action: 'listar', token: ta }).pautas.find(p => p.id === fixo).data.endsWith('-28'));
  await pg.click('#toast .toast-desf'); await pg.waitForTimeout(900);
  ok('Desfazer volta a ordem anterior', JSON.stringify(datas()) === JSON.stringify({ 'Post 1': '03', 'Post 2': '10', 'Post 3': '17', 'Post 4': '24' }), JSON.stringify(datas()));
  // ---------- quadros
  await pg.goto('http://site.test/#quadros'); await pg.waitForTimeout(400);
  await pg.click('button:has-text("+ Novo quadro")'); await pg.waitForTimeout(200);
  await pg.fill('#qfNome', 'Black Friday'); await pg.click('#qdDlg button:has-text("+ Coluna")'); await pg.fill('.qf-col:last-child input', 'Aprovado');
  await pg.click('#qfSalvar'); await pg.waitForTimeout(700);
  ok('quadro criado com 4 colunas', (await pg.$$('.qd-col')).length === 4);
  for (const t of ['Briefing', 'Arte do banner', 'Legenda']) { await pg.fill('.qd-col:first-child .qd-add input', t); await pg.press('.qd-col:first-child .qd-add input', 'Enter'); await pg.waitForTimeout(500); }
  ok('3 cartões na primeira coluna', (await pg.$$('.qd-col:first-child .qc')).length === 3);
  await pg.dragAndDrop('.qc:has-text("Legenda")', '.qd-col:nth-child(2)'); await pg.waitForTimeout(600);
  ok('arrastar para "Fazendo"', (await pg.textContent('.qd-col:nth-child(2)')).includes('Legenda'));
  await pg.dragAndDrop('.qc:has-text("Arte do banner")', '.qc:has-text("Briefing")', { targetPosition: { x: 20, y: 5 } }); await pg.waitForTimeout(600);
  ok('reordenar dentro da coluna', (await pg.$$eval('.qd-col:first-child .qc .t', x => x.map(e => e.textContent))).join(',') === 'Arte do banner,Briefing');
  ok('setas escondidas no computador', !(await pg.isVisible('.qc:has-text("Briefing") .mv button')));
  await pg.dragAndDrop('.qc:has-text("Briefing")', '.qd-col:nth-child(2)'); await pg.waitForTimeout(600);
  ok('arrastar Briefing para "Fazendo"', (await pg.textContent('.qd-col:nth-child(2)')).includes('Briefing'));
  await pg.click('.qc:has-text("Briefing")'); await pg.waitForTimeout(300);
  await pg.selectOption('#qcForm select >> nth=1', { label: 'Sofi (você)' }); await pg.fill('#qcForm input[type=date]', '2026-01-02');
  await pg.click('#qcForm .qc-c >> nth=3'); await pg.fill('#qcCk', 'Ligar para o cliente'); await pg.press('#qcCk', 'Enter');
  await pg.screenshot({ path: cap('quadro-cartao.png') });
  await pg.click('#qcSalvar'); await pg.waitForTimeout(700);
  const c = P({ action: 'listar', token: ta }).cartoes.find(x => x.titulo === 'Briefing');
  ok('cartão salvo com responsável, prazo, cor e checklist', c && c.responsavelId && c.prazo === '2026-01-02' && c.cor && c.checklist.length === 1);
  ok('prazo vencido em vermelho', await pg.isVisible('.qc:has-text("Briefing") .atraso'));
  await pg.screenshot({ path: cap('quadro.png'), fullPage: true });
  await pg.click('button:has-text("← Todos os quadros")'); await pg.waitForTimeout(300);
  ok('lista de quadros', (await pg.textContent('.qd-lista')).includes('Black Friday'));
  // ---------- celular
  const pm = await abrir({ width: 390, height: 800 });
  await pm.goto('http://site.test/#quadros'); await pm.waitForTimeout(400); await pm.click('.qd-it'); await pm.waitForTimeout(300);
  await pm.click('.qc:has-text("Arte do banner") button[aria-label^="Para"]'); await pm.waitForTimeout(700);
  ok('seta ▶ move no celular', (await pm.textContent('.qd-col:nth-child(2)')).includes('Arte do banner'));
  ok('quadro no celular sem rolar a página de lado', await pm.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await pm.screenshot({ path: cap('quadro-m.png') });
  await pm.goto('http://site.test/#grade'); await pm.waitForTimeout(300); await pm.click('button:has-text("Reordenar grade")'); await pm.waitForTimeout(300);
  ok('reordenar no celular sem rolar de lado', await pm.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await pm.screenshot({ path: cap('grade-reordenar-m.png') });
  ok('sem erros', !pg.erros.length && !pm.erros.length, pg.erros.concat(pm.erros).join(' | '));
  await b.close(); console.log(falhas ? falhas + ' FALHA(S)' : 'tudo certo'); process.exit(falhas ? 1 : 0);
})();
