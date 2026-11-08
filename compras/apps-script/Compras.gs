// Minhas Compras — servidor (Google Apps Script ligado a uma planilha só deste app).
// Guarda tudo na aba DADOS, lê preço/foto/nome dos links das lojas e atualiza os preços uma vez por dia.
// Passo a passo em compras/LEIAME.md.

const ABA = 'DADOS';
const CAB = ['id', 'tipo', 'nome', 'rev', 'atualizadoEm', 'apagado', 'dados'];
const TIPOS = ['casa', 'mercado', 'categoria', 'desejo'];

// ---------- configuração (rodar uma vez pelo editor) ----------
function configurar() {
  aba_();
  const pp = PropertiesService.getScriptProperties();
  if (!pp.getProperty('CHAVE')) pp.setProperty('CHAVE', gerarChave_());
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'atualizarPrecosDiario').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('atualizarPrecosDiario').timeBased().everyDays(1).atHour(7).create();
  enviarChave_(pp.getProperty('CHAVE'));
}

// Gera uma chave nova (os aparelhos conectados precisam digitar de novo).
function trocarChave() {
  const c = gerarChave_();
  PropertiesService.getScriptProperties().setProperty('CHAVE', c);
  enviarChave_(c);
}

function gerarChave_() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Date.now() + Math.random(), Utilities.Charset.UTF_8);
  for (let i = 0; i < 12; i++) s += letras[(b[i] + 256) % letras.length];
  return s.slice(0, 4) + '-' + s.slice(4, 8) + '-' + s.slice(8, 12);
}

function enviarChave_(c) {
  const email = Session.getEffectiveUser().getEmail();
  try {
    MailApp.sendEmail({ to: email, subject: 'Minhas Compras: sua chave de acesso', body: 'Sua chave de acesso do app Minhas Compras é: ' + c + '\n\nDigite essa chave uma vez em cada aparelho (Ajustes → Conectar à planilha).' });
    Logger.log('Pronto! A chave de acesso foi enviada para ' + email + '.');
  } catch (e) {
    Logger.log('Não consegui mandar o e-mail. Veja a chave em Configurações do projeto → Propriedades do script → CHAVE.');
  }
}

function aba_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(ABA);
  if (!sh) sh = ss.insertSheet(ABA);
  if (sh.getRange(1, 1).getValue() !== 'id') {
    sh.getRange(1, 1, 1, CAB.length).setValues([CAB]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

// ---------- entrada ----------
function doGet() { return json_({ ok: true, app: 'minhas-compras' }); }

function doPost(e) {
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!chaveOk_(req.chave)) return json_({ ok: false, erro: 'chave', msg: 'Chave de acesso errada.' });
    switch (req.action) {
      case 'ping': return json_({ ok: true });
      case 'sync': {
        const lk = LockService.getScriptLock(); lk.waitLock(20000);
        try { return json_(Object.assign({ ok: true }, sync_(req.mudancas || [], Number(req.desde) || 0))); } finally { lk.releaseLock(); }
      }
      case 'lerLink': return json_(Object.assign({ ok: true }, lerLink_(req.url)));
      default: return json_({ ok: false, erro: 'acao', msg: 'Ação desconhecida.' });
    }
  } catch (err) {
    return json_({ ok: false, erro: 'server', msg: String(err && err.message || err) });
  }
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Compara a chave sem ligar para maiúsculas, espaços ou traços; trava depois de muitas tentativas erradas.
function chaveOk_(c) {
  const cache = CacheService.getScriptCache();
  const erros = Number(cache.get('erros') || 0);
  if (erros >= 20) return false;
  const certa = PropertiesService.getScriptProperties().getProperty('CHAVE') || '';
  const norm = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const a = norm(c), b = norm(certa);
  let dif = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) dif |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  if (!b || dif) { cache.put('erros', String(erros + 1), 600); return false; }
  return true;
}

// ---------- sincronização ----------
// Cada aparelho manda o que mudou; fica a versão editada por último. Devolve o que mudou desde a última conversa.
function sync_(mudancas, desde) {
  const sh = aba_(), pp = PropertiesService.getScriptProperties();
  let rev = Number(pp.getProperty('REV') || 0);
  const ult = sh.getLastRow();
  const linhas = ult > 1 ? sh.getRange(2, 1, ult - 1, CAB.length).getValues() : [];
  const pos = {};
  linhas.forEach((l, i) => { if (l[0]) pos[l[0]] = i; });
  if (!Array.isArray(mudancas)) mudancas = [];
  mudancas.slice(0, 2000).forEach(m => {
    if (!m || typeof m.id !== 'string' || !/^[\w-]{1,64}$/.test(m.id) || TIPOS.indexOf(m.tipo) < 0) return;
    const quando = Number(m.atualizadoEm) || 0, dados = JSON.stringify(m.dados || {});
    if (dados.length > 45000) return;
    const i = pos[m.id];
    if (i !== undefined && Number(linhas[i][4]) > quando) return;
    rev++;
    const nome = String((m.dados && m.dados.nome) || '').slice(0, 200);
    const linha = [m.id, m.tipo, nome, rev, quando, m.apagado ? 1 : '', dados];
    if (i !== undefined) { linhas[i] = linha; sh.getRange(i + 2, 1, 1, CAB.length).setValues([linha]); }
    else { linhas.push(linha); pos[m.id] = linhas.length - 1; sh.getRange(linhas.length + 1, 1, 1, CAB.length).setValues([linha]); }
  });
  pp.setProperty('REV', String(rev));
  const registros = [];
  linhas.forEach(l => {
    if (!l[0] || Number(l[3]) <= desde) return;
    let dados = {};
    try { dados = JSON.parse(l[6] || '{}'); } catch (e) {}
    registros.push({ id: l[0], tipo: l[1], atualizadoEm: Number(l[4]) || 0, apagado: !!l[5], dados: dados });
  });
  return { rev: rev, registros: registros };
}

// ---------- ler o link da loja ----------
function lerLink_(url) {
  url = String(url || '').trim();
  if (!/^https?:\/\/[^\s]+$/i.test(url) || url.length > 2000) return { lido: false, motivo: 'link' };
  let res;
  try {
    res = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true, followRedirects: true, validateHttpsCertificates: true,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', 'Accept-Language': 'pt-BR,pt;q=0.9' }
    });
  } catch (e) {
    return { lido: false, motivo: 'rede', loja: loja_(url) };
  }
  const cod = res.getResponseCode();
  if (cod >= 400) return { lido: false, motivo: 'bloqueado', codigo: cod, loja: loja_(url) };
  const html = String(res.getContentText() || '').slice(0, 2000000);
  return Object.assign({ lido: true }, extrair_(html, url));
}

// Tira nome, foto e preço do HTML da página. Tenta primeiro os dados estruturados que as lojas publicam.
function extrair_(html, url) {
  const metas = metas_(html);
  const titulo = limparTexto_(metas['og:title'] || metas['twitter:title'] || ((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]) || '');
  let foto = metas['og:image'] || metas['og:image:secure_url'] || metas['twitter:image'] || '';
  let preco = null, fonte = '';

  const ld = [];
  const reLd = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = reLd.exec(html))) { try { ld.push(JSON.parse(m[1].trim())); } catch (e) {} }
  const achado = precoLd_(ld);
  if (achado) { preco = achado.preco; fonte = 'dados'; if (!foto && achado.foto) foto = achado.foto; }

  if (preco === null) {
    const v = metas['product:price:amount'] || metas['og:price:amount'] || metas['price'];
    const n = numero_(v);
    if (n) { preco = n; fonte = 'dados'; }
  }
  if (preco === null) {
    const ip = html.match(/itemprop=["']price["'][^>]*content=["']([^"']+)["']/i) || html.match(/content=["']([^"']+)["'][^>]*itemprop=["']price["']/i);
    const n = ip && numero_(ip[1]);
    if (n) { preco = n; fonte = 'dados'; }
  }
  if (preco === null) {
    const js = html.match(/"(?:price|salePrice|sale_price|bestPrice|finalPrice)"\s*:\s*"?(\d+(?:[.,]\d+)?)"?/i);
    const n = js && numero_(js[1]);
    if (n) { preco = n; fonte = 'pagina'; }
  }
  if (preco === null) {
    const texto = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
    const r = texto.match(/R\$\s*(?:&nbsp;)?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})|\d+(?:,\d{2})?)/);
    const n = r && numeroBR_(r[1]);
    if (n) { preco = n; fonte = 'texto'; }
  }
  if (Array.isArray(foto)) foto = foto[0];
  if (foto && typeof foto === 'object') foto = foto.url || foto.contentUrl || '';
  foto = absoluto_(limparTexto_(String(foto || '')), url);
  return { nome: titulo.slice(0, 200), foto: /^https:\/\//.test(foto) ? foto : '', preco: preco, fonte: fonte, loja: loja_(url) };
}

function precoLd_(ld) {
  let res = null;
  const visitar = (o, foto) => {
    if (res || !o || typeof o !== 'object') return;
    if (Array.isArray(o)) { o.forEach(x => visitar(x, foto)); return; }
    const f = o.image || foto;
    const t = [].concat(o['@type'] || []).join(' ');
    if (/Offer/.test(t)) {
      const n = numero_(o.price !== undefined ? o.price : o.lowPrice !== undefined ? o.lowPrice : (o.priceSpecification && o.priceSpecification.price));
      if (n) { res = { preco: n, foto: f }; return; }
    }
    if (o.offers) visitar(o.offers, f);
    if (o['@graph']) visitar(o['@graph'], f);
    if (!res && /Product/.test(t) && o.hasVariant) visitar(o.hasVariant, f);
  };
  visitar(ld, null);
  if (res && Array.isArray(res.foto)) res.foto = res.foto[0];
  if (res && res.foto && typeof res.foto === 'object') res.foto = res.foto.url || '';
  return res;
}

function metas_(html) {
  const o = {};
  const re = /<meta\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const a = {};
    const ra = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let x;
    while ((x = ra.exec(m[0]))) a[x[1].toLowerCase()] = x[2] !== undefined ? x[2] : x[3];
    const k = (a.property || a.name || a.itemprop || '').toLowerCase();
    if (k && a.content !== undefined && o[k] === undefined) o[k] = a.content;
  }
  return o;
}

// Número vindo de dados (ponto como decimal), mas aceita "1.234,56" também.
function numero_(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return v > 0 && isFinite(v) ? Math.round(v * 100) / 100 : null;
  const s = String(v).replace(/[^\d.,]/g, '');
  if (!s) return null;
  let n;
  if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) n = s.lastIndexOf(',') > s.lastIndexOf('.') ? numeroBR_(s) : parseFloat(s.replace(/,/g, ''));
  else if (s.indexOf(',') >= 0) n = numeroBR_(s);
  else n = parseFloat(s);
  return n > 0 && isFinite(n) ? Math.round(n * 100) / 100 : null;
}

function numeroBR_(s) {
  const n = parseFloat(String(s).replace(/\./g, '').replace(',', '.'));
  return n > 0 && isFinite(n) ? Math.round(n * 100) / 100 : null;
}

function limparTexto_(s) {
  return String(s || '').replace(/&#x([0-9a-f]+);/gi, (a, h) => String.fromCharCode(parseInt(h, 16))).replace(/&#(\d+);/g, (a, d) => String.fromCharCode(Number(d)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}

function absoluto_(u, base) {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u.replace(/^http:/i, 'https:');
  const b = String(base).match(/^(https?:\/\/[^\/]+)/i);
  if (u.indexOf('//') === 0) return 'https:' + u;
  if (u[0] === '/' && b) return b[1] + u;
  return '';
}

function loja_(url) {
  const host = (String(url).match(/^https?:\/\/([^\/:?#]+)/i) || [])[1] || '';
  const h = host.toLowerCase().replace(/^www\./, '');
  const nomes = { amazon: 'Amazon', mercadolivre: 'Mercado Livre', mercadolibre: 'Mercado Livre', shopee: 'Shopee', magazineluiza: 'Magalu', magalu: 'Magalu', americanas: 'Americanas', casasbahia: 'Casas Bahia', pontofrio: 'Ponto', shein: 'Shein', aliexpress: 'AliExpress', leroymerlin: 'Leroy Merlin', tokstok: 'Tok&Stok', mobly: 'Mobly', camicado: 'Camicado', renner: 'Renner', cea: 'C&A', riachuelo: 'Riachuelo', zara: 'Zara', sephora: 'Sephora', belezanaweb: 'Beleza na Web', boticario: 'Boticário', natura: 'Natura', kabum: 'KaBuM!', fastshop: 'Fast Shop', carrefour: 'Carrefour', westwing: 'Westwing', etna: 'Etna', madeiramadeira: 'MadeiraMadeira', netshoes: 'Netshoes', centauro: 'Centauro', dafiti: 'Dafiti', elo7: 'Elo7' };
  const parte = h.split('.').find(p => nomes[p]);
  if (parte) return nomes[parte];
  const base = h.split('.')[0] || h;
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : '';
}

// ---------- preços automáticos (gatilho diário) ----------
function atualizarPrecosDiario() {
  const lk = LockService.getScriptLock();
  if (!lk.tryLock(30000)) return;
  const inicio = Date.now();
  try {
    const sh = aba_(), pp = PropertiesService.getScriptProperties();
    let rev = Number(pp.getProperty('REV') || 0);
    const ult = sh.getLastRow();
    if (ult < 2) return;
    const linhas = sh.getRange(2, 1, ult - 1, CAB.length).getValues();
    const hoje = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    for (let i = 0; i < linhas.length; i++) {
      if (Date.now() - inicio > 4.5 * 60000) break;
      const l = linhas[i];
      if (l[1] !== 'desejo' || l[5]) continue;
      let d;
      try { d = JSON.parse(l[6] || '{}'); } catch (e) { continue; }
      if ((d.status || 'quero') !== 'quero' || !Array.isArray(d.links)) continue;
      let mudou = false;
      d.links.forEach(k => {
        if (!k || !k.url || k.precoManual) return;
        const r = lerLink_(k.url);
        if (r.lido && r.preco) { if (aplicarPreco_(k, r.preco, hoje)) mudou = true; }
        Utilities.sleep(400);
      });
      if (mudou) {
        rev++;
        const linha = [l[0], l[1], l[2], rev, Date.now(), '', JSON.stringify(d)];
        sh.getRange(i + 2, 1, 1, CAB.length).setValues([linha]);
      }
    }
    pp.setProperty('REV', String(rev));
  } finally { lk.releaseLock(); }
}

// Mesmo jeito que o app faz: guarda o preço anterior e um histórico curto.
function aplicarPreco_(k, preco, dia) {
  k.precoEm = dia;
  if (k.preco === preco) return true;
  if (k.preco) k.antes = k.preco;
  k.preco = preco;
  k.hist = (Array.isArray(k.hist) ? k.hist : []).filter(x => x.d !== dia);
  k.hist.push({ d: dia, p: preco });
  if (k.hist.length > 30) k.hist = k.hist.slice(-30);
  return true;
}
