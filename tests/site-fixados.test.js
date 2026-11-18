// 📌 Fixar no topo: os fixados aparecem primeiro na grade, como no perfil do Instagram
const G = require('./simulador-google.js');
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..'), cap = n => path.join(__dirname, 'capturas', n);
const P = o => G.post(JSON.stringify(o));
let falhas = 0; const ok = (nome, cond, extra) => { if (!cond) falhas++; console.log((cond ? 'ok   ' : 'FALHA') + ' ' + nome + (extra !== undefined ? ' → ' + extra : '')); };
G.configurar(); const senha = G.logs[0].match(/Senha provisória: (\S+)/)[1];
const ta = P({ action: 'login', login: 'ana@agencia.com', senha }).token;
const liso = P({ action: 'salvarMarca', token: ta, marca: { nome: 'Liso Obrigatório' } }).id;
P({ action: 'salvarUsuario', token: ta, usuario: { nome: 'Cli', login: 'cli@x.com', papel: 'cliente', marcas: [liso], senha: 'Teste#2026' } });
const tc = P({ action: 'login', login: 'cli@x.com', senha: 'Teste#2026' }).token;
G.props['ig_' + liso] = JSON.stringify({ token: 'TK', usuario: 'lisoobrigatorio', renovado: Date.now() });
// perfil: 40 posts, do mais novo (dia 30/11) para o mais antigo; os 3 "fixados" são antigos (fora dos 36 mais recentes)
const nomes = { P38: 'Tecnologia Xpert Liss', P39: 'Xpert Liss Mask', P37: 'O que faz Xpert Liss entregar na prática?' };
global.IG.data = Array.from({ length: 40 }, (_, i) => { const d = new Date(Date.UTC(2026, 10, 30, 15) - i * 864e5 * 1.5); return { id: String(900 + i), caption: nomes['P' + i] || 'Post ' + i, media_type: 'IMAGE', media_url: 'https://cdn.test/' + i + '.jpg', permalink: `https://www.instagram.com/p/CODE${String(i).padStart(2, '0')}x/`, timestamp: d.toISOString().replace('Z', '+0000') }; });
// ---- servidor
ok('cliente não fixa', !!P({ action: 'fixarGrade', token: tc, marcaId: liso, codigo: 'CODE38x', posicao: 1 }).error);
ok('posição inválida recusada', !!P({ action: 'fixarGrade', token: ta, marcaId: liso, codigo: 'CODE38x', posicao: 5 }).error);
P({ action: 'fixarGrade', token: ta, marcaId: liso, codigo: 'CODE38x', posicao: 1 });
P({ action: 'fixarGrade', token: ta, marcaId: liso, codigo: 'CODE39x', posicao: 2 });
ok('registro anota quem mudou os fixados', P({ action: 'auditoria', token: ta }).itens.some(x => /Mudou os fixados da grade/.test(x.acao)));
P({ action: 'fixarGrade', token: ta, marcaId: liso, codigo: 'CODE37x', posicao: 3 });
let fx = P({ action: 'listar', token: ta }).marcas.find(m => m.id === liso).fixados;
ok('fixados guardados na marca, na ordem', fx.join(',') === 'CODE38x,CODE39x,CODE37x', fx.join(','));
const md = P({ action: 'instaMidias', token: ta, marcaId: liso, forcar: true }).midias;
ok('fixados antigos (fora dos 36) vêm junto da sincronização', ['CODE37x', 'CODE38x', 'CODE39x'].every(c => md.some(x => x.link.includes('/' + c + '/'))) && md.length === 39, md.length);
P({ action: 'fixarGrade', token: ta, marcaId: liso, codigo: 'CODE05x', posicao: 2 });
fx = P({ action: 'listar', token: ta }).marcas.find(m => m.id === liso).fixados;
ok('fixar outro na posição 2 tira o anterior dela', fx.join(',') === 'CODE38x,CODE05x,CODE37x', fx.join(','));
P({ action: 'fixarGrade', token: ta, marcaId: liso, codigo: 'CODE39x', posicao: 2 });
(async () => {
  fs.mkdirSync(path.join(__dirname, 'capturas'), { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 900 }, timezoneId: 'America/Sao_Paulo' }); const erros = [];
  pg.on('pageerror', e => erros.push(e.message));
  await pg.route('http://site.test/**', r => { const u = new URL(r.request().url()); const f = path.join(dir, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); let body = fs.readFileSync(f); if (f.endsWith('index.html')) body = body.toString().replace("connect-src 'self'", "connect-src 'self' https://api.test"); if (f.endsWith('config.js')) body = body.toString().replace(/API_URL: "[^"]*"/, 'API_URL: "https://api.test/exec"'); r.fulfill({ body, contentType: f.endsWith('.js') ? 'text/javascript' : 'text/html' }); });
  await pg.route('https://api.test/**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(G.post(r.request().postData())) }));
  await pg.route(/fonts|drive|accounts\.google|cdn\.test/, r => r.abort());
  await pg.goto('http://site.test/#grade'); await pg.waitForTimeout(300);
  await pg.fill('#lgLogin', 'ana@agencia.com'); await pg.fill('#lgSenha', senha); await pg.click('#lgBtn'); await pg.waitForTimeout(900);
  await pg.evaluate(() => { S.month = '2026-11'; }); await pg.goto('http://site.test/#grade'); await pg.waitForTimeout(1200);
  const ordem = async () => pg.$$eval('.grade .tile', x => x.map(e => (e.querySelector('img') || {}).alt || (e.querySelector('.tt') || {}).textContent || ''));
  let o = await ordem();
  ok('grade: os 3 fixados no topo, na posição marcada', o.slice(0, 3).join(' | ') === 'Tecnologia Xpert Liss | Xpert Liss Mask | O que faz Xpert Liss entregar na prática?', o.slice(0, 3).join(' | '));
  ok('grade: depois, o resto do mais novo para o mais antigo', o.slice(3, 6).join(',') === 'Post 0,Post 1,Post 2', o.slice(3, 6).join(','));
  ok('selo 📌 1, 2, 3 nos fixados', (await pg.$$eval('.pin-tag', x => x.map(e => e.textContent.trim()))).join(',') === '📌 1,📌 2,📌 3');
  await pg.screenshot({ path: cap('grade-fixados.png'), fullPage: true });
  // desafixar e fixar pela tela
  await pg.hover('.grade .tile:nth-child(3)'); await pg.click('.grade .tile:nth-child(3) .pin-btn'); await pg.waitForTimeout(200);
  await pg.screenshot({ path: cap('grade-fixar-menu.png') });
  await pg.click('.pin-menu button:has-text("Desafixar")'); await pg.waitForTimeout(900);
  o = await ordem();
  ok('desafixar pela tela: volta para o lugar da data', o.slice(0, 2).join(' | ') === 'Tecnologia Xpert Liss | Xpert Liss Mask' && o[2] === 'Post 0', o.slice(0, 4).join(' | '));
  const alvo = await pg.$('.grade .tile:has(img[alt="Post 4"])'); await alvo.hover(); await (await alvo.$('.pin-btn')).click(); await pg.waitForTimeout(200);
  await pg.click('.pin-menu button:has-text("Posição 1")'); await pg.waitForTimeout(900);
  o = await ordem();
  ok('fixar pela tela na posição 1', o[0] === 'Post 4' && o[1] === 'Xpert Liss Mask', o.slice(0, 3).join(' | '));
  ok('quem estava na posição 1 sai dos fixados', !o.slice(0, 2).includes('Tecnologia Xpert Liss'));
  // botões com / sem posts do Insta
  await pg.click('.grade-modo button:has-text("Sem posts do Insta")'); await pg.waitForTimeout(300);
  ok('sem posts do Insta: só os planejados', (await pg.$$('.grade .tile.ig')).length === 0);
  await pg.click('.grade-modo button:has-text("Com posts do Insta")'); await pg.waitForTimeout(300);
  ok('com posts do Insta: volta o perfil', (await pg.$$('.grade .tile.ig')).length > 30);
  // ordem pelo instante real: 15:00 UTC (Instagram) é 12:00 em Brasília, então vem antes de um planejado às 12:30 local
  ok('fuso: Instagram em UTC comparado com a hora local', await pg.evaluate(() => epocaDe('2026-11-30T12:30') > epocaDe('2026-11-30T15:00:00+0000') && epocaDe('2026-11-30T12:00') === epocaDe('2026-11-30T15:00:00+0000')));
  // cliente vê os fixados, mas não tem o botão
  const pc = await b.newPage({ viewport: { width: 390, height: 800 } }); pc.on('pageerror', e => erros.push(e.message));
  await pc.route('http://site.test/**', r => { const u = new URL(r.request().url()); const f = path.join(dir, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); let body = fs.readFileSync(f); if (f.endsWith('index.html')) body = body.toString().replace("connect-src 'self'", "connect-src 'self' https://api.test"); if (f.endsWith('config.js')) body = body.toString().replace(/API_URL: "[^"]*"/, 'API_URL: "https://api.test/exec"'); r.fulfill({ body, contentType: f.endsWith('.js') ? 'text/javascript' : 'text/html' }); });
  await pc.route('https://api.test/**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(G.post(r.request().postData())) }));
  await pc.route(/fonts|drive|accounts\.google|cdn\.test/, r => r.abort());
  await pc.goto('http://site.test/#grade'); await pc.waitForTimeout(300);
  await pc.fill('#lgLogin', 'cli@x.com'); await pc.fill('#lgSenha', 'Teste#2026'); await pc.click('#lgBtn'); await pc.waitForTimeout(900);
  await pc.evaluate(() => { S.month = '2026-11'; location.hash = '#grade'; }); await pc.waitForTimeout(1200);
  ok('cliente vê os fixados no topo, sem o botão 📌', (await pc.$$('.pin-tag')).length >= 1 && (await pc.$$('.pin-btn')).length === 0);
  ok('celular sem rolar de lado', await pc.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  ok('sem erros', !erros.length, erros.join(' | '));
  await b.close(); console.log(falhas ? falhas + ' FALHA(S)' : 'tudo certo'); process.exit(falhas ? 1 : 0);
})();
