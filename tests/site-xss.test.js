const G = require('./simulador-google.js');
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const dir = require('path').join(__dirname, '..');
const P = o => G.post(JSON.stringify(o));
G.configurar(); const senha = G.logs[0].match(/Senha provisória: (\S+)/)[1];
const ta = P({ action: 'login', login: 'ana@agencia.com', senha }).token;
const liso = P({ action: 'salvarMarca', token: ta, marca: { nome: 'Liso' } }).id;
const pid = P({ action: 'salvarPauta', token: ta, pauta: { marcaId: liso, data: '2026-11-05', postagem: 'P' } }).id;
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await pg.route('http://site.test/**', r => { const u = new URL(r.request().url()); const f = path.join(dir, u.pathname === '/' ? 'index.html' : u.pathname); let body = fs.readFileSync(f); if (f.endsWith('index.html')) body = body.toString().replace("connect-src 'self'", "connect-src 'self' https://api.test"); if (f.endsWith('config.js')) body = body.toString().replace(/API_URL: "[^"]*"/, 'API_URL: "https://api.test/exec"'); r.fulfill({ body, contentType: f.endsWith('.js') ? 'text/javascript' : 'text/html' }); });
  await pg.route('https://api.test/**', r => {
    const req = JSON.parse(r.request().postData()); const j = G.post(r.request().postData());
    if (req.action === 'listar' && j.marcas) {
      j.marcas.forEach(m => { m.arquivos = [{ id: "A1');window.__xc=1;//", nome: 'Contrato', tipo: 'Outros', url: "https://x.example/a');window.__xss3=1;//" }]; m.perfil = Object.assign({}, m.perfil, { biblioteca: [{ id: "IMG1');window.__xa=1;//", nome: 'x', tipo: 'imagem', tags: ["a';window.__xss1=1;//", 'b"onmouseover="window.__xb=1'] }], arquivos: [{ id: "A1');window.__xc=1;//", nome: 'Contrato', tipo: 'Outros', url: "https://x.example/a');window.__xss3=1;//" }], site: 'javascript:window.__xs=1' }); });
      (j.pautas || []).forEach(p => { p.postLink = 'javascript:window.__xss2=1'; p.canva = 'javascript:window.__xcv=1//canva.com'; p.criativo = 'javascript:window.__xcr=1'; p.status = 'Postado'; });
    }
    r.fulfill({ contentType: 'application/json', body: JSON.stringify(j) });
  });
  await pg.route(/fonts|drive/, r => r.abort());
  const erros = []; pg.on('pageerror', e => erros.push(e.message));
  await pg.goto('http://site.test/#marca-midias'); await pg.waitForTimeout(300); await pg.fill('#lgLogin', 'ana@agencia.com'); await pg.fill('#lgSenha', senha); await pg.click('#lgBtn'); await pg.waitForTimeout(800);
  await pg.goto('http://site.test/#marca-midias'); await pg.waitForTimeout(400);
  for (const t of await pg.$$eval('#app .legenda .lg-it', x => x.map((e, i) => i))) { await pg.click(`#app .legenda .lg-it >> nth=${t}`, { timeout: 800 }).catch(() => {}); await pg.waitForTimeout(50); }
  await pg.goto('http://site.test/#marca-arquivos'); await pg.waitForTimeout(400);
  for (const sel of ['button:has-text("Copiar link")', 'button:has-text("Remover")', 'button:has-text("Sim")']) await pg.click(sel, { timeout: 1500 }).catch(() => console.log('não achei', sel));
  await pg.evaluate(id => openEditor(id), pid); await pg.waitForTimeout(400);
  const hrefs = await pg.$$eval('a[href]', x => x.map(e => e.getAttribute('href')).filter(h => /javascript/i.test(h)));
  console.log('links javascript: na tela:', hrefs.length ? hrefs : 'nenhum');
  const flags = await pg.evaluate(() => Object.keys(window).filter(k => /^__x/.test(k)));
  console.log('código do atacante rodou?', flags.length ? 'SIM ' + flags : 'não');
  console.log('erros de página:', erros.slice(0, 5));
  await b.close();
  if (hrefs.length || flags.length || erros.length) process.exit(1);
})();
