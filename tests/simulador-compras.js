// Ambiente simulado do Google Apps Script para o app Minhas Compras (só para teste local)
const crypto = require('crypto'), fs = require('fs'), path = require('path'), vm = require('vm');
function criar() {
  const ctx = { console };
  function Sheet(name) { this.name = name; this.data = []; }
  Sheet.prototype = {
    cell(r, c) { const row = this.data[r - 1] || []; return row[c - 1] === undefined ? '' : row[c - 1]; },
    put(r, c, v) { while (this.data.length < r) this.data.push([]); this.data[r - 1][c - 1] = v; },
    getLastRow() { for (let i = this.data.length; i > 0; i--) if ((this.data[i - 1] || []).some(v => v !== '' && v !== undefined)) return i; return 0; },
    setFrozenRows() {},
    getRange(r, c, nr = 1, nc = 1) { const sh = this; return {
      getValue() { return sh.cell(r, c); },
      getValues() { const o = []; for (let i = 0; i < nr; i++) { const row = []; for (let j = 0; j < nc; j++) row.push(sh.cell(r + i, c + j)); o.push(row); } return o; },
      setValues(v) { v.forEach((row, i) => row.forEach((x, j) => sh.put(r + i, c + j, x))); return this; },
      setFontWeight() { return this; } }; }
  };
  const SS = { sheets: [], getSheetByName(n) { return this.sheets.find(s => s.name === n) || null; }, insertSheet(n) { const s = new Sheet(n); this.sheets.push(s); return s; } };
  const props = {}, cache = {}, enviados = [], logs = [], gatilhos = [], paginas = {}, buscados = [];
  Object.assign(ctx, {
    SpreadsheetApp: { getActiveSpreadsheet: () => SS },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] ?? null, setProperty: (k, v) => { props[k] = String(v); }, deleteProperty: k => { delete props[k]; } }) },
    CacheService: { getScriptCache: () => ({ get: k => cache[k] ?? null, put: (k, v) => { cache[k] = v; }, remove: k => { delete cache[k]; } }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, tryLock: () => true, releaseLock() {} }) },
    Utilities: { getUuid: () => crypto.randomUUID(), sleep() {}, DigestAlgorithm: { SHA_256: 1 }, Charset: { UTF_8: 1 },
      computeDigest: (a, s) => [...crypto.createHash('sha256').update(String(s)).digest()].map(x => x > 127 ? x - 256 : x),
      formatDate: d => d.toISOString().slice(0, 10) },
    Session: { getScriptTimeZone: () => 'America/Sao_Paulo', getEffectiveUser: () => ({ getEmail: () => 'ana@exemplo.com' }) },
    MailApp: { sendEmail: o => enviados.push(o) },
    Logger: { log: m => logs.push(m) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: t => ({ t, setMimeType() { return this; } }) },
    ScriptApp: { getProjectTriggers: () => gatilhos.slice(), deleteTrigger: t => gatilhos.splice(gatilhos.indexOf(t), 1),
      newTrigger: f => { const b = { timeBased: () => b, everyDays: () => b, atHour: () => b, create: () => gatilhos.push({ getHandlerFunction: () => f }) }; return b; } },
    UrlFetchApp: { fetch: u => { buscados.push(u); const p = paginas[u]; if (!p) throw new Error('rede'); return { getResponseCode: () => p.codigo || 200, getContentText: () => p.html || '' }; } }
  });
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'compras', 'apps-script', 'Compras.gs'), 'utf8'), ctx);
  const post = o => JSON.parse(ctx.doPost({ postData: { contents: typeof o === 'string' ? o : JSON.stringify(o) } }).t);
  return { ctx, SS, props, cache, enviados, logs, gatilhos, paginas, buscados, post };
}
module.exports = { criar };
