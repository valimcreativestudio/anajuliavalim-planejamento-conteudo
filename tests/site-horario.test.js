// Horário dos posts: vários posts no mesmo dia ficam em ordem
const G = require('./simulador-google.js');
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..'), cap = n => path.join(__dirname, 'capturas', n);
const P = o => G.post(JSON.stringify(o));
let falhas = 0; const ok = (nome, cond, extra) => { if (!cond) falhas++; console.log((cond ? 'ok   ' : 'FALHA') + ' ' + nome + (extra !== undefined ? ' → ' + extra : '')); };
G.configurar(); const senha = G.logs[0].match(/Senha provisória: (\S+)/)[1];
const ta = P({ action: 'login', login: 'ana@agencia.com', senha }).token;
const liso = P({ action: 'salvarMarca', token: ta, marca: { nome: 'Liso' } }).id;
const mes = new Date().toISOString().slice(0, 7), dia = `${mes}-12`;
// criados fora de ordem: Noite, Manhã, Tarde
const ids = { noite: P({ action: 'salvarPauta', token: ta, pauta: { marcaId: liso, data: dia, postagem: 'Post Noite', hora: '19:00' } }).id,
  manha: P({ action: 'salvarPauta', token: ta, pauta: { marcaId: liso, data: dia, postagem: 'Post Manhã', hora: '09:00' } }).id,
  tarde: P({ action: 'salvarPauta', token: ta, pauta: { marcaId: liso, data: dia, postagem: 'Post Tarde' } }).id };
const horas = () => Object.fromEntries(P({ action: 'listar', token: ta }).pautas.filter(p => p.data === dia).map(p => [p.postagem, p.hora || '']));
ok('servidor guarda o horário', horas()['Post Noite'] === '19:00' && horas()['Post Manhã'] === '09:00');
P({ action: 'salvarPauta', token: ta, pauta: { id: ids.tarde, hora: '25:99' } });
ok('horário inválido é ignorado', horas()['Post Tarde'] === '');
(async () => {
  fs.mkdirSync(path.join(__dirname, 'capturas'), { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 900 } }); const erros = [];
  pg.on('pageerror', e => erros.push(e.message));
  await pg.route('http://site.test/**', r => { const u = new URL(r.request().url()); const f = path.join(dir, u.pathname === '/' ? 'index.html' : u.pathname); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); let body = fs.readFileSync(f); if (f.endsWith('index.html')) body = body.toString().replace("connect-src 'self'", "connect-src 'self' https://api.test"); if (f.endsWith('config.js')) body = body.toString().replace(/API_URL: "[^"]*"/, 'API_URL: "https://api.test/exec"'); r.fulfill({ body, contentType: f.endsWith('.js') ? 'text/javascript' : 'text/html' }); });
  await pg.route('https://api.test/**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(G.post(r.request().postData())) }));
  await pg.route(/fonts|drive|accounts\.google/, r => r.abort());
  await pg.goto('http://site.test/#calendario'); await pg.waitForTimeout(300);
  await pg.fill('#lgLogin', 'ana@agencia.com'); await pg.fill('#lgSenha', senha); await pg.click('#lgBtn'); await pg.waitForTimeout(900);
  await pg.goto('http://site.test/#calendario'); await pg.waitForTimeout(400);
  // preenche o horário do "Post Tarde" pelo editor
  await pg.click(`.day[data-dia="${dia}"] .chip:has-text("Post Tarde")`); await pg.waitForTimeout(400);
  ok('editor tem o campo Horário', await pg.isVisible('#eHora'));
  await pg.fill('#eHora', '14:30'); await pg.click('#eSalvar'); await pg.waitForTimeout(900);
  if (await pg.isVisible('#dlg[open]')) { await pg.keyboard.press('Escape'); await pg.waitForTimeout(300); }
  ok('horário salvo pelo editor', horas()['Post Tarde'] === '14:30', JSON.stringify(horas()));
  const ordemCal = await pg.$$eval(`.day[data-dia="${dia}"] .chip`, x => x.map(e => (e.textContent.match(/Post \S+/) || [''])[0]).join(','));
  ok('calendário em ordem de horário (manhã, tarde, noite)', ordemCal === 'Post Manhã,Post Tarde,Post Noite', ordemCal);
  ok('chip mostra o horário', (await pg.textContent(`.day[data-dia="${dia}"] .chip:has-text("Post Manhã")`)).includes('09:00'));
  await (await pg.$(`.day[data-dia="${dia}"]`)).screenshot({ path: cap('horario-dia.png') });
  // grade: o mais tarde aparece primeiro, como no feed
  await pg.goto('http://site.test/#grade'); await pg.waitForTimeout(400);
  const ordemGrade = await pg.$$eval('.grade .tile .tt', x => x.map(e => e.textContent).filter(t => t.startsWith('Post')).join(','));
  ok('grade: mais tarde primeiro (noite, tarde, manhã)', ordemGrade === 'Post Noite,Post Tarde,Post Manhã', ordemGrade);
  // reordenar: trocar de lugar leva o horário junto
  await pg.click('button:has-text("Reordenar grade")'); await pg.waitForTimeout(300);
  await pg.click('.tile.rd:has-text("Post Manhã") .rd-mv button[aria-label^="Mais para trás"]'); await pg.waitForTimeout(200);
  await pg.click('#rdSalvar'); await pg.waitForTimeout(900);
  const h2 = horas();
  ok('reordenar troca os horários (manhã vira 14:30, tarde vira 09:00)', h2['Post Manhã'] === '14:30' && h2['Post Tarde'] === '09:00', JSON.stringify(h2));
  const ordemGrade2 = await pg.$$eval('.grade .tile .tt', x => x.map(e => e.textContent).filter(t => t.startsWith('Post')).join(','));
  ok('grade fica na ordem nova', ordemGrade2 === 'Post Noite,Post Manhã,Post Tarde', ordemGrade2);
  await pg.click('#toast .toast-desf'); await pg.waitForTimeout(900);
  ok('desfazer volta os horários', horas()['Post Manhã'] === '09:00' && horas()['Post Tarde'] === '14:30', JSON.stringify(horas()));
  ok('sem erros', !erros.length, erros.join(' | '));
  await b.close(); console.log(falhas ? falhas + ' FALHA(S)' : 'tudo certo'); process.exit(falhas ? 1 : 0);
})();
