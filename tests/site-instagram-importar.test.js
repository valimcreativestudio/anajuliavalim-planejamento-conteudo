// Tela: puxar posts do Instagram para o calendário
const G = require('./simulador-google.js');
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..'), cap = n => path.join(__dirname, 'capturas', n);
const P = o => G.post(JSON.stringify(o));
let falhas = 0; const ok = (nome, cond, extra) => { if (!cond) falhas++; console.log((cond ? 'ok   ' : 'FALHA') + ' ' + nome + (extra !== undefined ? ' → ' + extra : '')); };
G.configurar(); const senha = G.logs[0].match(/Senha provisória: (\S+)/)[1];
const ta = P({ action: 'login', login: 'ana@agencia.com', senha }).token;
const liso = P({ action: 'salvarMarca', token: ta, marca: { nome: 'Liso' } }).id;
const mes = new Date().toISOString().slice(0, 7);
G.props['ig_' + liso] = JSON.stringify({ token: 'TK', usuario: 'liso', renovado: Date.now() });
global.IG.data = [
  { id: '901', caption: 'Coleção de verão ☀️\nChegou!', media_type: 'CAROUSEL_ALBUM', permalink: 'https://www.instagram.com/p/CARR001/', timestamp: `${mes}-10T21:15:00+0000` },
  { id: '902', caption: 'Bastidores do ensaio', media_type: 'VIDEO', permalink: 'https://www.instagram.com/reel/REEL002/', timestamp: `${mes}-12T13:00:00+0000` },
  { id: '903', caption: 'Promo relâmpago', media_type: 'IMAGE', permalink: 'https://www.instagram.com/p/IMG003/', timestamp: `${mes}-14T15:00:00+0000` }
];
(async () => {
  fs.mkdirSync(path.join(__dirname, 'capturas'), { recursive: true });
  const b = await chromium.launch(); const erros = [];
  const pg = await b.newPage({ viewport: { width: 1280, height: 900 } }); pg.on('pageerror', e => erros.push(e.message));
  await pg.route('http://site.test/**', r => { const u = new URL(r.request().url()); const f = path.join(dir, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); let body = fs.readFileSync(f); if (f.endsWith('index.html')) body = body.toString().replace("connect-src 'self'", "connect-src 'self' https://api.test"); if (f.endsWith('config.js')) body = body.toString().replace(/API_URL: "[^"]*"/, 'API_URL: "https://api.test/exec"'); r.fulfill({ body, contentType: f.endsWith('.js') ? 'text/javascript' : 'text/html' }); });
  await pg.route('https://api.test/**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(G.post(r.request().postData())) }));
  await pg.route(/fonts|drive|accounts\.google|cdninstagram|fbcdn/, r => r.abort());
  await pg.goto('http://site.test/#calendario'); await pg.waitForTimeout(300);
  await pg.fill('#lgLogin', 'ana@agencia.com'); await pg.fill('#lgSenha', senha); await pg.click('#lgBtn'); await pg.waitForTimeout(900);
  await pg.goto('http://site.test/#calendario'); await pg.waitForTimeout(400);
  await pg.click('button:has-text("Puxar do Instagram")'); await pg.waitForTimeout(700);
  ok('lista os 3 posts do perfil que faltam', (await pg.$$('#igForm .ig-it')).length === 3, (await pg.textContent('#igForm')).slice(0, 120));
  await pg.click('#igForm button:has-text("Marcar todos")'); await pg.waitForTimeout(100);
  await pg.click('#igForm .ig-it:has-text("Promo relâmpago") input'); await pg.waitForTimeout(100);
  await pg.screenshot({ path: cap('instagram-puxar.png') });
  await pg.click('#igSel'); await pg.waitForTimeout(1000);
  ok('mostra o resultado', /2 posts no calendário/.test(await pg.textContent('#igForm .ig-res')));
  ok('o que foi puxado sai da lista', (await pg.$$('#igForm .ig-it')).length === 1);
  // colar link de um post que não está no perfil conectado (usa a data escolhida)
  await pg.fill('#igLinks', 'https://www.instagram.com/p/ANTIGO99/?igsh=abc');
  await pg.fill('#igForm input[type=date]', `${mes}-02`); await pg.selectOption('#igForm select', 'Carrossel');
  await pg.click('#igLnk'); await pg.waitForTimeout(900);
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(400);
  const ps = P({ action: 'listar', token: ta }).pautas;
  const c = ps.find(p => p.igMidia === '901'), a = ps.find(p => /ANTIGO99/.test(p.postLink || ''));
  ok('posts aparecem no calendário como Postado', c && c.status === 'Postado' && c.data === `${mes}-10` && c.formato === 'Carrossel' && a && a.data === `${mes}-02` && a.status === 'Postado', JSON.stringify([c && c.data, a && a.data]));
  ok('calendário mostra os posts puxados', (await pg.textContent('#app')).includes('Coleção de verão') && (await pg.textContent('#app')).includes('Bastidores do ensaio'));
  await pg.screenshot({ path: cap('instagram-calendario.png') });
  // marca sem Instagram conectado
  const sem = P({ action: 'salvarMarca', token: ta, marca: { nome: 'Sem Insta' } }).id;
  await pg.evaluate(id => { S.carimbo = ''; S.marcaId = id; return carregar(); }, sem); await pg.goto('http://site.test/#calendario'); await pg.waitForTimeout(400);
  await pg.click('button:has-text("Puxar do Instagram")'); await pg.waitForTimeout(300);
  ok('sem conexão: explica e deixa colar o link', (await pg.textContent('#igForm')).includes('não conectado') && await pg.isVisible('#igLinks'));
  const pm = await b.newPage({ viewport: { width: 390, height: 800 } }); pm.on('pageerror', e => erros.push(e.message));
  await pm.route('http://site.test/**', r => { const u = new URL(r.request().url()); const f = path.join(dir, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); let body = fs.readFileSync(f); if (f.endsWith('index.html')) body = body.toString().replace("connect-src 'self'", "connect-src 'self' https://api.test"); if (f.endsWith('config.js')) body = body.toString().replace(/API_URL: "[^"]*"/, 'API_URL: "https://api.test/exec"'); r.fulfill({ body, contentType: f.endsWith('.js') ? 'text/javascript' : 'text/html' }); });
  await pm.route('https://api.test/**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(G.post(r.request().postData())) }));
  await pm.route(/fonts|drive|accounts\.google/, r => r.abort());
  await pm.goto('http://site.test/#calendario'); await pm.waitForTimeout(300);
  await pm.fill('#lgLogin', 'ana@agencia.com'); await pm.fill('#lgSenha', senha); await pm.click('#lgBtn'); await pm.waitForTimeout(900);
  await pm.goto('http://site.test/#calendario'); await pm.waitForTimeout(400);
  await pm.click('button:has-text("Puxar do Instagram")'); await pm.waitForTimeout(600);
  ok('celular: janela sem rolar de lado', await pm.evaluate(() => document.querySelector('#igDlg').scrollWidth <= innerWidth + 1));
  await pm.screenshot({ path: cap('instagram-puxar-m.png') });
  ok('sem erros', !erros.length, erros.join(' | '));
  await b.close(); console.log(falhas ? falhas + ' FALHA(S)' : 'tudo certo'); process.exit(falhas ? 1 : 0);
})();
