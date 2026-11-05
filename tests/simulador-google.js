// Ambiente simulado do Google Apps Script, só para teste local
const crypto = require('crypto'), fs = require('fs');
function Sheet(name) { this.name = name; this.data = [[]]; this.maxRows = 1000; this.maxCols = 26; this.hidden = false; }
Sheet.prototype = {
  getName() { return this.name; },
  cell(r, c) { while (this.data.length < r) this.data.push([]); const row = this.data[r - 1]; return row[c - 1] === undefined ? '' : row[c - 1]; },
  put(r, c, v) { while (this.data.length < r) this.data.push([]); this.data[r - 1][c - 1] = v; },
  getLastRow() { for (let i = this.data.length; i > 0; i--) if (this.data[i - 1].some(v => v !== '' && v !== undefined)) return i; return 0; },
  getMaxRows() { return this.maxRows; }, getMaxColumns() { return this.maxCols; },
  insertColumnsAfter(a, n) { this.maxCols += n; },
  setFrozenRows() {}, hideSheet() { this.hidden = true; },
  deleteRow(r) { this.data.splice(r - 1, 1); },
  getDataRange() { return this.getRange(1, 1, Math.max(1, this.getLastRow()), this.maxCols); },
  getRange(r, c, nr = 1, nc = 1) {
    const sh = this;
    return {
      getValues() { const o = []; for (let i = 0; i < nr; i++) { const row = []; for (let j = 0; j < nc; j++) row.push(sh.cell(r + i, c + j)); o.push(row); } return o; },
      setValues(v) { v.forEach((row, i) => row.forEach((x, j) => sh.put(r + i, c + j, x))); return this; },
      setValue(x) { sh.put(r, c, x); return this; },
      setFontWeight() { return this; }, setNumberFormat() { return this; }
    };
  }
};
const SS = { getName: () => 'Planejamento', getId: () => 'SSID', sheets: [], getSheetByName(n) { return this.sheets.find(s => s.name === n) || null; }, insertSheet(n) { const s = new Sheet(n); this.sheets.push(s); return s; }, getSheets() { return this.sheets; } };
const props = {};
global.SpreadsheetApp = { getActiveSpreadsheet: () => SS, openById: id => { if (!global.TRENDS) throw new Error('x'); return { getSheets: () => [{ getName: () => 'Semana 1', getDataRange: () => ({ getDisplayValues: () => global.TRENDS }) }] }; } };
global.PropertiesService = { getScriptProperties: () => ({ getProperty: k => props[k] ?? null, setProperty: (k, v) => { props[k] = v; }, deleteProperty: k => { delete props[k]; }, getProperties: () => ({ ...props }) }) };
global.LockService = { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) };
global.Utilities = {
  getUuid: () => crypto.randomUUID(), sleep() {},
  DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
  computeDigest: (a, s) => [...crypto.createHash('sha256').update(s, 'utf8').digest()],
  computeHmacSha256Signature: (v, k) => [...crypto.createHmac('sha256', Buffer.isBuffer(k) || Array.isArray(k) ? Buffer.from(k.map ? k.map(x => x & 255) : k) : String(k)).update(Array.isArray(v) ? Buffer.from(v.map(x => x & 255)) : String(v)).digest()].map(x => x > 127 ? x - 256 : x),
  base64Encode: b => Buffer.from(b.map(x => x & 255)).toString('base64'),
  base64Decode: s => [...Buffer.from(s, 'base64')],
  newBlob: (b, m, n) => ({ b, m, n, getBytes: () => [...Buffer.from(String(b))].map(x => x > 127 ? x - 256 : x), getAs: () => ({ setName: x => ({ pdf: x }) }) }),
  formatDate: (d) => d.toISOString().slice(0, 10)
};
global.Session = { getScriptTimeZone: () => 'America/Sao_Paulo', getEffectiveUser: () => ({ getEmail: () => 'ana@agencia.com' }) };
global.ContentService = { MimeType: { JSON: 'json' }, createTextOutput: t => ({ t, getContent() { return t; }, setMimeType() { return this; } }) };
const logs = []; global.Logger = { log: m => logs.push(m) };
let nfile = 0;
global.CalendarApp = { getDefaultCalendar: () => ({}) };
global.MimeType = { GOOGLE_DOCS: 'application/vnd.google-apps.document' };
const gatilhos = []; global.ScriptApp = { getOAuthToken: () => 'TOKEN', WeekDay: { MONDAY: 1 }, getProjectTriggers: () => gatilhos.slice(), deleteTrigger: t => gatilhos.splice(gatilhos.indexOf(t), 1), newTrigger: f => { const b = { timeBased: () => b, everyDays: () => b, atHour: () => b, onWeekDay: () => b, everyMinutes: () => b, onMonthDay: () => b, create: () => { gatilhos.push({ getHandlerFunction: () => f }); } }; return b; } };
const arq = (id, nome, mt) => ({ getId: () => id, getName: () => nome, getMimeType: () => mt, setSharing() {} });
global.PASTAS = { PASTA123456789: [arq('IMG3xxxxxxxxxxxxxxxxx', '3.png', 'image/png'), arq('DOC1xxxxxxxxxxxxxxxxx', 'Legenda P2', 'application/vnd.google-apps.document'), arq('IMG1xxxxxxxxxxxxxxxxx', '1.png', 'image/png'), arq('VID2xxxxxxxxxxxxxxxxx', '2.mp4', 'video/mp4'), arq('IMG10xxxxxxxxxxxxxxxx', '10.png', 'image/png')] };
const copias = []; global.DriveApp = { getFileById: id => { if (/PRIVADO/.test(id)) return { getMimeType: () => 'application/vnd.google-apps.document', getSharingAccess: () => 'PRIVATE', setSharing() { global.TORNOU_PUBLICO = id; } }; return { getMimeType: () => 'application/vnd.google-apps.document', getSharingAccess: () => 'ANYONE_WITH_LINK', setSharing() {}, setTrashed() {}, makeCopy: (n) => copias.push(n) }; }, getRootFolder: () => folder('root'), Access: { ANYONE_WITH_LINK: 'ANYONE_WITH_LINK', ANYONE: 'ANYONE', PRIVATE: 'PRIVATE' }, Permission: {}, getFolderById: id => { if (/PRIVADA/.test(id)) { let i = 0; const l = [arq('IMGPRIVxxxxxxxxxxxxxxxxx', 'p.png', 'image/png')]; return { getName: () => 'Particular', getSharingAccess: () => 'PRIVATE', getFiles: () => ({ hasNext: () => i < l.length, next: () => l[i++] }) }; } const l = global.PASTAS[id]; if (!l) throw new Error('sem acesso'); let i = 0; return { getName: () => 'Pasta', getSharingAccess: () => 'ANYONE_WITH_LINK', getFiles: () => ({ hasNext: () => i < l.length, next: () => l[i++] }) }; } };
function folder(n) { return { getFiles: () => ({ hasNext: () => false }), getFoldersByName: x => ({ hasNext: () => false }), createFolder: x => folder(x), createFile: b => { nfile++; return { setSharing() {}, getUrl: () => 'https://drive.google.com/file/d/FAKEID' + nfile + 'xxxxxxxxxxxxxxx/view', getId: () => 'FAKEID' + nfile + 'xxxxxxxxxxxxxxx' }; } }; }
const enviados = []; global.MailApp = { getRemainingDailyQuota: () => 100, sendEmail: o => enviados.push(o) };
const fetches = []; global.IG = { fail: false };
const posts = []; global.PUSHES = []; global.UrlFetchApp = { fetch: (u, o) => { fetches.push(u);
  if (/push\.apple\.com|fcm\.googleapis\.com|mozilla\.com/.test(u)) { global.PUSHES.push({ u, h: o.headers }); const c = (global.PUSHCODE || {})[u] || 201; return { getResponseCode: () => c, getContentText: () => '' }; }
  if (/oauth2\.googleapis\.com\/tokeninfo/.test(u)) { const t = decodeURIComponent(u.split('id_token=')[1]); const i = (global.GTOKENS || {})[t]; return { getResponseCode: () => i ? 200 : 400, getContentText: () => JSON.stringify(i || { error: 'invalid' }) }; }
  if (/api\.anthropic\.com/.test(u)) { posts.push([u, o.payload, o.headers]); const b = global.IAERRO ? { type: 'error', error: { message: 'x' } } : { stop_reason: 'end_turn', content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: global.IATEXTO || 'Legenda gerada ✨ #liso' }] }; return { getResponseCode: () => global.IAERRO || 200, getContentText: () => JSON.stringify(b) }; }
  if (/googleapis\.com\/calendar/.test(u)) { posts.push([u, o && o.payload, o && o.method]); return { getResponseCode: () => 200, getContentText: () => JSON.stringify(o && o.method === 'delete' ? {} : { id: 'GCAL1', hangoutLink: 'https://meet.google.com/abc-defg-hij' }) }; } if (o && o.method === 'post') { posts.push([u, o.payload]); const b = global.IG.pubErro ? { error: { message: global.IG.pubErro } } : /media_publish/.test(u) ? { id: '1799' } : { id: 'C' + posts.length }; return { getResponseCode: () => 200, getContentText: () => JSON.stringify(b) }; } if (/fields=status_code/.test(u)) return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ status_code: 'FINISHED' }) }; if (/fields=permalink&/.test(u)) return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ permalink: 'https://www.instagram.com/p/NOVO123/' }) }; if (/\/insights\?/.test(u)) return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ data: [{ name: 'reach', values: [{ value: 1200 }] }, { name: 'saved', values: [{ value: 33 }] }, { name: 'shares', values: [{ value: 7 }] }] }) }; const t = decodeURIComponent((u.match(/access_token=([^&]+)/) || [])[1] || ''); let body; if (t === 'RUIM') body = { error: { code: 190, message: 'Invalid OAuth access token' } }; else if (/drive\/v3\/files\/DOC1/.test(u)) return { getResponseCode: () => 200, getContentText: () => 'SLIDE 1: Tecnologia Xpert Liss\nSLIDE 2: Efeito memória\n\nLegenda:\nO alinhamento que dura. ✨\nLink na bio.' }; else if (/me\/accounts/.test(u)) body = { data: global.IG.pages || [] }; else if (/graph\.facebook\.com\/(v[\d.]+\/)?\d+\/media/.test(u)) body = { data: (global.IG.fbdata || []) }; else if (/\/me\?/.test(u)) body = { user_id: '1', username: 'lisoobrigatorio' }; else if (/me\/media/.test(u)) body = { data: global.IG.data || [] }; else body = { access_token: 'NOVO' }; return { getResponseCode: () => 200, getContentText: () => JSON.stringify(body) }; } };
const cstore = {}; global.CacheService = { getScriptCache: () => ({ get: k => cstore[k] || null, put: (k, v) => { cstore[k] = v; }, remove: k => { delete cstore[k]; } }) };
const vm = require('vm');
vm.runInThisContext(fs.readFileSync(require('path').join(__dirname, '..', 'apps-script', 'Codigo.gs'), 'utf8'));
module.exports = { limpezaDiaria, relatorioMensal, publicarAgendados, resumoDiario, backupSemanal, posts, gatilhos, copias, fetches, enviados, SS, logs, props, post: body => { let r = JSON.parse(doPost({ postData: { contents: body } }).t); if (r.precisaCodigo && !global.SEM_AUTOCODIGO) { const c = enviados[enviados.length - 1].subject.match(/(\d{6})/)[1]; r = JSON.parse(doPost({ postData: { contents: JSON.stringify({ action: 'confirmarCodigo', desafio: r.desafio, codigo: c }) } }).t); } return r; }, configurar: () => { configurar(); const e = enviados.find(x => /Senha provisória/.test(x.body || '')); if (e) logs.unshift('Senha provisória: ' + e.body.match(/Senha provisória: (\S+)/)[1]); }, Sheet };
