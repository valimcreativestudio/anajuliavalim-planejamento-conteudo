// Testa o app de afazeres "Feito!" (pasta afazeres/) e o script de sincronização (apps-script/Afazeres.gs).
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const dir = path.join(__dirname, '..', 'afazeres');
const capt = n => path.join(__dirname, 'capturas', n);

// ---- simulador do Google para o Afazeres.gs ----
const props = {}, drive = {}; const logs = [];
const ctx = {
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] || null, setProperty: (k, v) => { props[k] = v; }, deleteProperty: k => { delete props[k]; } }) },
  DriveApp: {
    createFile: (n, c) => { const id = 'arq' + Object.keys(drive).length; drive[id] = c; return { getId: () => id }; },
    getFileById: id => ({ getBlob: () => ({ getDataAsString: () => drive[id] }), setContent: c => { drive[id] = c; } })
  },
  Utilities: { getUuid: () => 'abcd1234-ef56-7890-abcd-1234567890ab' },
  Logger: { log: m => logs.push(m) },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  ContentService: { MimeType: { JSON: 'json' }, createTextOutput: t => ({ texto: t, setMimeType() { return this; } }) }
};
vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Afazeres.gs'), 'utf8'), ctx);
ctx.configurar();
const codigo = props.CODIGO; assert.ok(codigo && logs[0].includes(codigo), 'configurar mostra o código');
const post = body => JSON.parse(ctx.doPost({ postData: { contents: body } }).texto);
assert.strictEqual(post(JSON.stringify({ codigo: 'errado', itens: [] })).erro, 'Código secreto errado');
const r1 = post(JSON.stringify({ codigo, itens: [{ id: 'a', titulo: 'velho', atualizado: 1 }, { id: 'b', atualizado: 5 }], categorias: [] }));
assert.strictEqual(r1.itens.length, 2);
const r2 = post(JSON.stringify({ codigo, itens: [{ id: 'a', titulo: 'novo', atualizado: 9 }, { id: 'b', titulo: 'antigo', atualizado: 2 }, { nada: 1 }], categorias: [] }));
assert.strictEqual(r2.itens.find(i => i.id === 'a').titulo, 'novo', 'fica a versão mais nova');
assert.strictEqual(r2.itens.find(i => i.id === 'b').titulo, undefined, 'não volta versão antiga');
assert.strictEqual(r2.itens.length, 2, 'ignora item sem id');
for (const k in drive) drive[k] = '{"itens":[],"categorias":[]}';
console.log('✓ servidor de sincronização');

(async () => {
  const b = await chromium.launch();
  const abrir = async (vp, estado) => {
    const ctxB = await b.newContext({ viewport: vp });
    const pg = await ctxB.newPage(); const erros = []; pg.on('pageerror', e => erros.push(e.message)); pg.erros = erros;
    await pg.route('http://site.test/**', r => {
      const u = new URL(r.request().url()); const f = path.join(dir, u.pathname.replace(/^\/afazeres\//, '') || 'index.html');
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ body: fs.readFileSync(path.join(dir, 'index.html')), contentType: 'text/html' });
      let body = fs.readFileSync(f); if (f.endsWith('index.html')) body = body.toString().replace('https://script.google.com https://script.googleusercontent.com', 'https://script.google.com');
      r.fulfill({ body, contentType: f.endsWith('.js') ? 'text/javascript' : f.endsWith('.png') ? 'image/png' : f.endsWith('.html') ? 'text/html' : 'application/json' });
    });
    await pg.route('https://script.google.com/**', r => r.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: ctx.doPost({ postData: { contents: r.request().postData() } }).texto }));
    await pg.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
    if (estado) await pg.addInitScript(s => { if (!localStorage.getItem('feito-v1')) localStorage.setItem('feito-v1', s); }, estado);
    await pg.goto('http://site.test/afazeres/'); await pg.waitForTimeout(300);
    return pg;
  };
  const pg = await abrir({ width: 1280, height: 900 });
  const titulos = async sel => pg.$$eval(sel + ' .item .titulo', x => x.map(e => e.textContent));
  // começa com exemplos
  assert.ok((await titulos('#tela')).includes('Experimentar o Feito! 👋'), 'tem exemplo');
  // captura rápida com "amanhã"
  await pg.fill('#campoCaptura', 'Ligar pro dentista amanhã'); await pg.press('#campoCaptura', 'Enter'); await pg.waitForTimeout(200);
  assert.ok(!(await titulos('#tela')).includes('Ligar pro dentista'), 'amanhã não aparece em hoje');
  await pg.fill('#campoCaptura', 'Pagar a conta de luz'); await pg.press('#campoCaptura', 'Enter'); await pg.waitForTimeout(200);
  assert.ok((await titulos('#tela')).includes('Pagar a conta de luz'));
  // marcar fica verde e conta no progresso
  const antes = await pg.textContent('.barra .rotulo');
  await pg.click('.item:has-text("Pagar a conta de luz") .check'); await pg.waitForTimeout(300);
  assert.ok(await pg.$eval('.item:has-text("Pagar a conta de luz")', e => e.classList.contains('feito')), 'fica verde');
  const cor = await pg.$eval('.item:has-text("Pagar a conta de luz")', e => getComputedStyle(e).backgroundColor);
  assert.strictEqual(cor, 'rgb(221, 243, 228)', 'fundo verde');
  assert.notStrictEqual(await pg.textContent('.barra .rotulo'), antes, 'progresso muda');
  // editar: onde, por quê, passinhos, tipo
  await pg.click('.item:has-text("Experimentar") .corpo'); await pg.waitForTimeout(200);
  await pg.fill('#edOnde', 'Sala <b>x</b>'); await pg.fill('#edPorque', 'Porque sim');
  await pg.fill('#edNovoPasso', 'Mais um passo'); await pg.press('#edNovoPasso', 'Enter');
  await pg.click('[data-ed="categoria"][data-valor="trabalho"]');
  assert.ok(await pg.isVisible('[data-ed="agenda"]'), 'botão Google Agenda');
  await pg.evaluate(() => { window.open = u => { window.__aberto = u; }; });
  await pg.click('[data-ed="agenda"]'); const link = new URL(await pg.evaluate(() => window.__aberto));
  assert.strictEqual(link.hostname, 'calendar.google.com'); assert.strictEqual(link.searchParams.get('location'), 'Sala <b>x</b>');
  assert.ok(link.searchParams.get('details').includes('Mais um passo'));
  await pg.click('[data-ed="salvar"]'); await pg.waitForTimeout(200);
  assert.ok((await pg.textContent('.item:has-text("Experimentar")')).includes('📍 Sala <b>x</b>'), 'onde aparece como texto (sem HTML)');
  assert.ok((await pg.textContent('.item:has-text("Experimentar")')).includes('0/4 passinhos'));
  // fechar no X salva
  await pg.click('.item:has-text("Experimentar") .corpo'); await pg.fill('#edTitulo', 'Experimentar com calma'); await pg.click('[data-ed="fechar"]'); await pg.waitForTimeout(150);
  assert.ok((await titulos('#tela')).includes('Experimentar com calma'), 'X salva');
  // rotina diária: marcar, e no dia seguinte volta desmarcada
  await pg.click('.item:has-text("Tomar remédio") .check'); await pg.waitForTimeout(200);
  assert.ok(await pg.$eval('.item:has-text("Tomar remédio")', e => e.classList.contains('feito')));
  // energia baixa esconde tarefas de muita energia
  await pg.click('.item:has-text("Experimentar com calma") .corpo'); await pg.click('[data-ed="energia"][data-valor="alta"]'); await pg.click('[data-ed="salvar"]');
  await pg.click('[data-acao="energia"][data-valor="baixa"]'); await pg.waitForTimeout(150);
  assert.ok(!(await titulos('#tela')).includes('Experimentar com calma'), 'escondida com pouca energia');
  assert.ok(await pg.isVisible('.escondidos'));
  await pg.click('[data-acao="energia"][data-valor=""]');
  // modo foco
  await pg.click('[data-acao="foco"]'); await pg.waitForTimeout(200);
  assert.ok(await pg.isVisible('#foco .cartao-foco'));
  await pg.screenshot({ path: capt('afazeres-foco.png') });
  let voltas = 0;
  while (await pg.isVisible('[data-foco="fiz"]') && voltas++ < 20) { await pg.click('[data-foco="fiz"]'); await pg.waitForTimeout(80); }
  assert.ok(await pg.isVisible('#foco .fim'), 'termina com tudo feito');
  await pg.click('#foco .fim [data-foco="sair"]');
  // atrasada: aparece gentil e volta para hoje
  await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('feito-v1')); s.itens.push({ id: 'velha', tipo: 'tarefa', titulo: 'Coisa de ontem', data: '2020-01-01', passos: [], atualizado: Date.now() }); localStorage.setItem('feito-v1', JSON.stringify(s)); });
  await pg.reload(); await pg.waitForTimeout(250);
  assert.ok(await pg.isVisible('.caixa.gentil .item:has-text("Coisa de ontem")'));
  assert.ok(await pg.$eval('.caixa.gentil .item', e => getComputedStyle(e).getPropertyValue('--cor').trim() !== ''), 'mantém a cor do tipo');
  await pg.click('.caixa.gentil [data-acao="pra-hoje"]'); await pg.waitForTimeout(150);
  assert.ok(!(await pg.isVisible('.caixa.gentil')));
  // apagar com desfazer
  await pg.click('.item:has-text("Coisa de ontem") .corpo'); await pg.click('[data-ed="apagar"]'); await pg.waitForTimeout(100);
  assert.ok(!(await titulos('#tela')).includes('Coisa de ontem'));
  await pg.click('#avisoBotao'); await pg.waitForTimeout(100);
  assert.ok((await titulos('#tela')).includes('Coisa de ontem'), 'desfazer');
  await pg.screenshot({ path: capt('afazeres-hoje.png'), fullPage: true });
  // outras telas
  await pg.click('nav [data-aba="proximos"]'); assert.ok((await titulos('#tela')).includes('Ligar pro dentista'));
  await pg.screenshot({ path: capt('afazeres-proximos.png'), fullPage: true });
  await pg.click('nav [data-aba="rotinas"]'); await pg.click('[data-acao="sub-rotina"][data-valor="semanal"]');
  assert.ok((await titulos('#tela')).includes('Lavar a roupa'));
  await pg.fill('#campoCaptura', 'Regar as plantas'); await pg.press('#campoCaptura', 'Enter'); await pg.waitForTimeout(100);
  assert.ok((await titulos('#tela')).includes('Regar as plantas'));
  await pg.screenshot({ path: capt('afazeres-rotinas.png'), fullPage: true });
  await pg.click('nav [data-aba="quandoder"]'); await pg.fill('#campoCaptura', 'Organizar o guarda-roupa'); await pg.press('#campoCaptura', 'Enter'); await pg.waitForTimeout(100);
  assert.ok((await titulos('#tela')).includes('Organizar o guarda-roupa'));
  await pg.click('nav [data-aba="notas"]'); await pg.fill('#campoCaptura', '<img src=x onerror=alert(1)>'); await pg.press('#campoCaptura', 'Enter'); await pg.waitForTimeout(100);
  assert.strictEqual(await pg.$$eval('#tela img', x => x.length), 0, 'sem HTML injetado');
  await pg.click('nav [data-aba="ajustes"]'); await pg.click('[data-acao="ajuste"][data-nome="tema"][data-valor="escuro"]');
  assert.strictEqual(await pg.evaluate(() => document.documentElement.dataset.tema), 'escuro');
  await pg.screenshot({ path: capt('afazeres-ajustes-escuro.png'), fullPage: true });
  // .ics
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('[data-acao="ics"]')]);
  const ics = fs.readFileSync(await dl.path(), 'utf8'); assert.ok(ics.includes('SUMMARY:Ligar pro dentista') && ics.startsWith('BEGIN:VCALENDAR'));
  // sincronização: computador manda, celular recebe
  await pg.fill('#sincUrl', 'https://script.google.com/macros/s/TESTE/exec'); await pg.fill('#sincCodigo', codigo);
  await pg.click('[data-acao="salvar-sinc"]'); await pg.waitForTimeout(400);
  assert.ok((await pg.textContent('#statusSinc')).includes('Sincronizado'), 'sincronizou');
  const cel = await abrir({ width: 390, height: 844 }, JSON.stringify({ itens: [], sinc: { url: 'https://script.google.com/macros/s/TESTE/exec', codigo }, ui: { aba: 'quandoder' } }));
  await cel.waitForTimeout(500);
  assert.ok((await cel.$$eval('.item .titulo', x => x.map(e => e.textContent))).includes('Organizar o guarda-roupa'), 'celular recebe do Drive');
  assert.ok(await cel.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'celular sem rolagem lateral');
  await cel.click('.item:has-text("Organizar") [data-acao="pra-hoje"]'); await cel.waitForTimeout(2000);
  await pg.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await pg.waitForTimeout(400);
  await pg.click('nav [data-aba="hoje"]');
  assert.ok((await titulos('#tela')).includes('Organizar o guarda-roupa'), 'computador recebe a mudança do celular');
  await cel.click('nav [data-aba="hoje"]'); await cel.waitForTimeout(150);
  await cel.screenshot({ path: capt('afazeres-celular.png'), fullPage: true });
  await cel.click('.item .corpo >> nth=0'); await cel.waitForTimeout(150);
  await cel.screenshot({ path: capt('afazeres-celular-editar.png') });
  assert.deepStrictEqual(pg.erros, []); assert.deepStrictEqual(cel.erros, []);
  console.log('✓ app no computador e no celular');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
