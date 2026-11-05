const G = require('./simulador-google.js');
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const dir = require('path').join(__dirname, '..');
const P = o => G.post(JSON.stringify(o));
G.configurar(); const senha = G.logs[0].match(/Senha provisória: (\S+)/)[1];
const ta = P({ action: 'login', login: 'ana@agencia.com', senha }).token;
const liso = P({ action: 'salvarMarca', token: ta, marca: { nome: 'Liso' } }).id;
P({ action: 'salvarPauta', token: ta, pauta: { marcaId: liso, data: new Date().toISOString().slice(0, 10), postagem: '=HYPERLINK("http://x","clique")', formato: 'Carrossel' } });
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const csp = []; pg.on('console', m => { if (/Content Security Policy|Refused/i.test(m.text())) csp.push(m.text().slice(0, 160)); });
  const erros = []; pg.on('pageerror', e => erros.push(e.message));
  await pg.route('http://site.test/**', r => { const u = new URL(r.request().url()); const f = path.join(dir, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); let body = fs.readFileSync(f); if (f.endsWith('index.html')) body = body.toString().replace("connect-src 'self'", "connect-src 'self' https://api.test"); if (f.endsWith('config.js')) body = body.toString().replace(/API_URL: "[^"]*"/, 'API_URL: "https://api.test/exec"'); r.fulfill({ body, contentType: f.endsWith('.js') ? 'text/javascript' : 'text/html' }); });
  await pg.route('https://api.test/**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(G.post(r.request().postData())) }));
  await pg.route(/fonts|drive/, r => r.abort());
  await pg.goto('http://site.test/#resumo'); await pg.waitForTimeout(300); await pg.fill('#lgLogin', 'ana@agencia.com'); await pg.fill('#lgSenha', senha); await pg.click('#lgBtn'); await pg.waitForTimeout(800);
  await pg.goto('http://site.test/#resumo'); await pg.waitForTimeout(500);
  for (const h of ['calendario', 'pautas', 'fluxo', 'grade', 'resumo', 'marca', 'marca-sobre', 'marca-arquivos', 'marca-midias', 'marca-plano', 'stories', 'agenda', 'tarefas', 'ideias', 'equipe', 'permissoes', 'mural', 'horas', 'financeiro', 'propostas', 'painel', 'empresa', 'empresas', 'registro', 'conta', 'aprovacoes', 'ajuda']) { await pg.goto('http://site.test/#' + h); await pg.waitForTimeout(250); }
  await pg.evaluate(() => { const p = S.posts[0]; if (p) openEditor(p.id); }); await pg.waitForTimeout(300);
  console.log('bloqueios de CSP:', csp.length ? csp : 'nenhum', '| erros:', erros);
  await b.close();
  if (csp.length || erros.length) process.exit(1);
})();
