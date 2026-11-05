global.SEM_AUTOCODIGO = true;
const G = require('./simulador-google.js');
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const dir = require('path').join(__dirname, '..');
const P = o => G.post(JSON.stringify(o));
let falhas = 0; const ok = (nome, cond, extra) => { if (!cond) falhas++; console.log((cond ? 'ok   ' : 'FALHA') + ' ' + nome + (extra !== undefined ? ' → ' + extra : '')); };
G.configurar(); const senha = G.logs[0].match(/Senha provisória: (\S+)/)[1];
// sessão do admin pelo servidor (com código)
const r0 = P({ action: 'login', login: 'ana@agencia.com', senha, dispositivo: 'f'.repeat(32) });
const ta = P({ action: 'confirmarCodigo', desafio: r0.desafio, codigo: G.enviados[G.enviados.length - 1].subject.match(/(\d{6})/)[1] }).token;
const liso = P({ action: 'salvarMarca', token: ta, marca: { nome: 'Liso' } }).id;
P({ action: 'salvarUsuario', token: ta, usuario: { nome: 'Sofi', login: 'sofi@x.com', papel: 'social', marcas: [liso], senha: 'Teste#2026' } });
P({ action: 'salvarUsuario', token: ta, usuario: { nome: 'Bia', login: 'bia@x.com', papel: 'social', marcas: [liso], senha: 'Teste#2026' } });
const eq = P({ action: 'listar', token: ta }).usuarios, sofi = eq.find(u => u.nome === 'Sofi').id;
const h = new Date(); const iso = d => d.toISOString().slice(0, 10); const hoje = iso(h);
const mes = hoje.slice(0, 7), ant = iso(new Date(h.getFullYear(), h.getMonth() - 1, 10)).slice(0, 7);
for (let i = 0; i < 6; i++) P({ action: 'salvarTarefa', token: ta, tarefa: { titulo: 'Tarefa ' + i, responsavelId: sofi, prazo: hoje } });
P({ action: 'salvarTarefa', token: ta, tarefa: { titulo: 'Atrasada', responsavelId: sofi, prazo: '2026-01-01' } });
const pid = P({ action: 'salvarPauta', token: ta, pauta: { marcaId: liso, data: mes + '-14', postagem: 'Carrossel novembro', formato: 'Carrossel', midias: [{ id: 'IMG1xxxxxxxxxxxxxxxxx', tipo: 'imagem' }, { id: 'IMG2xxxxxxxxxxxxxxxxx', tipo: 'imagem' }] } }).id;
P({ action: 'salvarPauta', token: ta, pauta: { marcaId: liso, data: mes + '-20', postagem: 'Reels', formato: 'Reels' } });
P({ action: 'salvarPauta', token: ta, pauta: { marcaId: liso, data: ant + '-12', postagem: 'Mês passado', formato: 'Reels' } });
const png = fs.readFileSync(path.join(dir, 'icone-512.png'));
(async () => {
  const b = await chromium.launch();
  const abrir = async vp => {
    const pg = await b.newPage({ viewport: vp }); pg.erros = []; pg.csp = [];
    pg.on('pageerror', e => pg.erros.push(e.message)); pg.on('console', m => { if (/Content Security Policy/.test(m.text())) pg.csp.push(m.text().slice(0, 140)); });
    pg.on('dialog', d => d.accept());
    await pg.route('http://site.test/**', r => { const u = new URL(r.request().url()); const f = path.join(dir, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); let body = fs.readFileSync(f); if (f.endsWith('index.html')) body = body.toString().replace("connect-src 'self'", "connect-src 'self' https://api.test"); if (f.endsWith('config.js')) body = body.toString().replace(/API_URL: "[^"]*"/, 'API_URL: "https://api.test/exec"'); r.fulfill({ body, contentType: f.endsWith('.js') ? 'text/javascript' : f.endsWith('.png') ? 'image/png' : 'text/html' }); });
    await pg.route('https://api.test/**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(G.post(r.request().postData())) }));
    await pg.route(/fonts|drive|accounts\.google/, r => r.abort());
    await pg.route(/drive\.google\.com\/thumbnail/, r => r.fulfill({ body: png, contentType: 'image/png' }));
    return pg;
  };
  const pg = await abrir({ width: 1280, height: 900 });
  // ---- login com código
  await pg.goto('http://site.test/#calendario'); await pg.waitForTimeout(300);
  await pg.fill('#lgLogin', 'ana@agencia.com'); await pg.fill('#lgSenha', senha); await pg.click('#lgBtn'); await pg.waitForTimeout(500);
  ok('pede o código no aparelho novo', await pg.isVisible('#cdCod'), await pg.textContent('.login .muted'));
  await pg.screenshot({ path: require('path').join(__dirname, 'capturas', 'n-codigo.png') });
  await pg.fill('#cdCod', '123456'); await pg.click('#cdBtn'); await pg.waitForTimeout(300);
  ok('código errado mostra erro', /errado/.test(await pg.textContent('#lgErr')));
  await pg.fill('#cdCod', G.enviados[G.enviados.length - 1].subject.match(/(\d{6})/)[1]); await pg.click('#cdBtn'); await pg.waitForTimeout(900);
  ok('entra com o código certo', await pg.isVisible('#me'));
  // ---- tarefa completa
  await pg.goto('http://site.test/#tarefas'); await pg.waitForTimeout(400);
  await pg.click('button:has-text("+ Nova tarefa")'); await pg.waitForTimeout(200);
  await pg.fill('#tTitulo', 'Reels da semana'); await pg.selectOption('#tRep', 'semana'); await pg.selectOption('#tResp', sofi);
  for (const t of ['Roteiro', 'Gravar', 'Editar']) { await pg.fill('#tCkNovo', t); await pg.press('#tCkNovo', 'Enter'); }
  await pg.click('#tCheck .ck-it:first-child input[type=checkbox]');
  await pg.click('button:has-text("+ Link")'); const an = await pg.$$('#tAnexos .an-it input'); await an[0].fill('Referência'); await an[1].fill('https://www.instagram.com/p/abc');
  await pg.screenshot({ path: require('path').join(__dirname, 'capturas', 'n-tarefa-nova.png') });
  await pg.click('#tSalvar'); await pg.waitForTimeout(700);
  let t = P({ action: 'listar', token: ta }).tarefas.find(x => x.titulo === 'Reels da semana');
  ok('tarefa salva com checklist, link e repetição', t && t.checklist.length === 3 && t.checklist[0].ok && t.anexos.length === 1 && t.repetir === 'semana', t && JSON.stringify([t.checklist.map(i => i.t + (i.ok ? '✓' : '')), t.anexos, t.repetir]));
  await pg.selectOption('#tfQuem', 'todas'); await pg.waitForTimeout(200);
  await pg.click(`.tf:has-text("Reels da semana") .corpo`); await pg.waitForTimeout(300);
  await pg.click('#tCheck .ck-it:nth-child(2) input[type=checkbox]'); await pg.waitForTimeout(400);
  ok('marcar item salva na hora', P({ action: 'listar', token: ta }).tarefas.find(x => x.id === t.id).checklist[1].ok);
  await pg.fill('#tComTxt', 'Gravação na quinta'); await pg.click('#tComs button:has-text("Comentar")'); await pg.waitForTimeout(400);
  ok('comentário na tarefa', (await pg.textContent('#tComs')).includes('Gravação na quinta'));
  await pg.screenshot({ path: require('path').join(__dirname, 'capturas', 'n-tarefa.png') });
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
  ok('selos na lista (☑ 2/3, 💬, 📎, 🔁)', /☑ 2\/3.*💬 1.*📎 1.*🔁/.test(await pg.textContent('.tf:has-text("Reels da semana")')));
  // ---- desfazer no quadro de tarefas
  await pg.click('.tf-modo button:has-text("Quadro")'); await pg.waitForTimeout(300);
  await pg.click('.tf-board .card:has-text("Reels da semana") button[aria-label^="Passar"]'); await pg.waitForTimeout(500);
  ok('toast com Desfazer', await pg.isVisible('#toast .toast-desf'));
  await pg.click('#toast .toast-desf'); await pg.waitForTimeout(700);
  ok('desfazer voltou a tarefa', P({ action: 'listar', token: ta }).tarefas.find(x => x.id === t.id).status === 'Pendente');
  // ---- carga
  await pg.goto('http://site.test/#equipe-carga'); await pg.waitForTimeout(400);
  const carga = await pg.$$eval('.cg-it summary', x => x.map(e => e.innerText.replace(/\s+/g, ' ')));
  ok('carga mostra a Sofi primeiro, com atrasada', /Sofi/.test(carga[0]) && /atrasada/.test(carga[0]), carga[0]);
  await pg.click('.cg-it:first-child summary'); await pg.waitForTimeout(200);
  await pg.screenshot({ path: require('path').join(__dirname, 'capturas', 'n-carga.png'), fullPage: true });
  // ---- marcar na arte
  await pg.goto('http://site.test/#calendario'); await pg.waitForTimeout(400);
  await pg.evaluate(id => openEditor(id), pid); await pg.waitForTimeout(400);
  await pg.click('#dlg button:has-text("📍 Marcar na arte")'); await pg.waitForTimeout(300);
  await pg.click('.mk-tabs button:nth-child(2)'); await pg.waitForTimeout(200);
  for (let i = 0; i < 40 && !(await pg.evaluate(() => { const i = document.querySelector('.mk-img img'); return !!(i && i.complete && i.naturalWidth > 0); })); i++) await pg.waitForTimeout(100);
  await pg.waitForTimeout(150);
  const box = await pg.$('.mk-img img'); const bb = await box.boundingBox();
  await pg.evaluate(() => { document.querySelector('.mk-img').addEventListener('click', e => { const r = e.currentTarget.querySelector('img').getBoundingClientRect(), r2 = e.currentTarget.getBoundingClientRect(); window.__dbg = [e.clientY, r.top, r.height, r2.top, r2.height]; }, true); });
  await pg.click('.mk-img img', { position: { x: bb.width * 0.25, y: bb.height * 0.75 } });
  console.log('dbg', bb, await pg.evaluate(() => window.__dbg)); await pg.waitForTimeout(200);
  await pg.fill('#mkTxt', 'Trocar essa cor'); await pg.click('#mkBtn'); await pg.waitForTimeout(500);
  const c = P({ action: 'listar', token: ta }).pautas.find(p => p.id === pid).comentarios.slice(-1)[0];
  ok('ponto salvo na arte 2 no lugar clicado', c && c.arte === 2 && Math.abs(c.x - 25) < 1.5 && Math.abs(c.y - 75) < 1.5, c && JSON.stringify([c.arte, c.x, c.y]));
  ok('pino aparece numerado', (await pg.$$('.mk-img .mk-pin')).length === 1);
  await pg.screenshot({ path: require('path').join(__dirname, 'capturas', 'n-marcador.png') });
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
  ok('comentário do editor mostra "ver na arte"', await pg.isVisible('#dlg .mk-tag'));
  await pg.click('#dlg .mk-tag'); await pg.waitForTimeout(300);
  ok('"ver na arte" abre na arte certa com foco', await pg.isVisible('.mk-pin.foco') && (await pg.getAttribute('.mk-tabs button[aria-pressed=true]', 'onclick')).includes('MK.arte=2'));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(200); await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
  // ---- modelos
  await pg.goto('http://site.test/#calendario'); await pg.waitForTimeout(400);
  await pg.click('button:has-text("📐 Modelos de mês")'); await pg.waitForTimeout(200);
  await pg.fill('#mdNome', 'Padrão Liso'); await pg.click('#mdSalvar'); await pg.waitForTimeout(600);
  ok('modelo salvo aparece', (await pg.textContent('.md-lista')).includes('Padrão Liso'));
  await pg.screenshot({ path: require('path').join(__dirname, 'capturas', 'n-modelos.png') });
  await pg.keyboard.press('Escape');
  await pg.evaluate(() => { S.month = shiftMonth(S.month, 2); render(); }); await pg.waitForTimeout(300);
  await pg.click('button:has-text("📐 Modelos de mês")'); await pg.waitForTimeout(200);
  await pg.click('.md-it button:has-text("Aplicar")'); await pg.waitForTimeout(800);
  const m2 = await pg.evaluate(() => S.posts.filter(p => p.marcaId === S.marcaId && p.data.startsWith(S.month)).length);
  ok('modelo aplicado 2 meses depois', m2 === 2, m2);
  // ---- desfazer: mover no calendário
  const pm = await pg.evaluate(() => S.posts.find(p => p.data.startsWith(S.month)).id);
  const dia0 = await pg.evaluate(id => S.posts.find(p => p.id === id).data, pm);
  await pg.evaluate(([id, d]) => moverPostagem(id, d), [pm, dia0.slice(0, 8) + '27']); await pg.waitForTimeout(600);
  await pg.click('#toast .toast-desf'); await pg.waitForTimeout(800);
  ok('desfazer devolveu a postagem ao dia original', P({ action: 'listar', token: ta, desde: '2026-01' }).pautas.find(p => p.id === pm).data === dia0);
  // ---- desfazer: excluir postagem
  await pg.evaluate(id => openEditor(id), pm); await pg.waitForTimeout(300);
  await pg.evaluate(() => excluirPost()); await pg.waitForTimeout(600);
  await pg.click('#toast .toast-desf'); await pg.waitForTimeout(900);
  ok('desfazer recuperou a postagem apagada', P({ action: 'listar', token: ta, desde: '2026-01' }).pautas.some(p => p.id === pm));
  // ---- comparativo no relatório
  await pg.evaluate(() => { S.month = shiftMonth(S.month, -2); }); await pg.goto('http://site.test/#resumo'); await pg.waitForTimeout(500);
  const cmp = await pg.$$eval('.cmp tbody tr', x => x.map(e => e.innerText.replace(/\s+/g, ' ')));
  ok('comparativo com o mês anterior', cmp.length >= 4 && /Postagens planejadas 1 2/.test(cmp[0]), cmp.join(' | '));
  await (await pg.$('.cmp')).screenshot({ path: require('path').join(__dirname, 'capturas', 'n-comparativo.png') });
  // ---- empresas: Google + apagar
  P({ action: 'salvarEmpresa', token: ta, empresaDados: { nome: 'Belkit', ativo: true, admin: { nome: 'Bel', login: 'bel@b.com', senha: 'Teste#2026' } } });
  await pg.goto('http://site.test/#empresas'); await pg.evaluate(() => { S.carimbo = ''; return carregar(); }); await pg.waitForTimeout(500);
  ok('empresa da dona sem botão Apagar', (await pg.$$('tr:has-text("Valim") button:has-text("Apagar")')).length === 0 && (await pg.$$('tr:has-text("Belkit") button:has-text("Apagar")')).length === 1);
  await pg.fill('#gCli', '123-abc.apps.googleusercontent.com'); await pg.click('button:has-text("Ligar")'); await pg.waitForTimeout(400);
  ok('Google ligado pela dona', P({ action: 'configPublica' }).googleClientId === '123-abc.apps.googleusercontent.com');
  await pg.click('tr:has-text("Belkit") button:has-text("Apagar")'); await pg.waitForTimeout(200);
  ok('botão final começa travado', await pg.isDisabled('#empDelBtn'));
  await pg.fill('#empDelNome', 'belkit'); await pg.waitForTimeout(100);
  await pg.screenshot({ path: require('path').join(__dirname, 'capturas', 'n-empresa-apagar.png'), fullPage: true });
  await pg.click('#empDelBtn'); await pg.waitForTimeout(800);
  ok('Belkit apagada pela tela', !(await pg.textContent('#app')).includes('Belkit'));
  // ---- conta: avisos
  await pg.goto('http://site.test/#conta'); await pg.waitForTimeout(400);
  ok('conta mostra avisos', (await pg.textContent('#app')).includes('Avisar neste aparelho'));
  // ---- login: botão do Google aparece (script do Google bloqueado no teste → some sem erro)
  const pl = await abrir({ width: 390, height: 800 });
  await pl.goto('http://site.test/'); await pl.waitForTimeout(900);
  ok('login no celular sem erro mesmo sem o script do Google', pl.erros.length === 0);
  // celular: carga e marcador
  await pl.fill('#lgLogin', 'sofi@x.com'); await pl.fill('#lgSenha', 'Teste#2026'); await pl.click('#lgBtn'); await pl.waitForTimeout(800);
  ok('social entra sem código', await pl.isVisible('#me'));
  await pl.goto('http://site.test/#tarefas'); await pl.waitForTimeout(400);
  await pl.click('.tf:has-text("Reels da semana") .corpo'); await pl.waitForTimeout(300);
  ok('tarefa no celular sem rolagem lateral', await pl.evaluate(() => document.querySelector('#tfDlg').scrollWidth <= innerWidth + 1));
  await pl.screenshot({ path: require('path').join(__dirname, 'capturas', 'n-tarefa-m.png') });
  console.log('erros:', pg.erros, pl.erros, '| CSP:', pg.csp.concat(pl.csp));
  if (pg.erros.length || pl.erros.length) falhas++;
  await b.close();
  console.log(falhas ? falhas + ' FALHA(S)' : 'tudo certo'); process.exit(falhas ? 1 : 0);
})();
