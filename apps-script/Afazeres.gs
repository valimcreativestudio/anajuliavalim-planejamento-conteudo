/**
 * Feito! — guarda suas tarefas num arquivo do seu Google Drive,
 * para usar as mesmas tarefas no celular e no computador.
 * Passo a passo no arquivo afazeres/LEIAME.md.
 */

// 1) Rode esta função uma vez (botão Executar). Ela cria o arquivo no Drive
//    e mostra o seu código secreto no "Registro de execução".
function configurar() {
  var p = PropertiesService.getScriptProperties();
  var id = p.getProperty('ARQUIVO');
  if (!id) {
    id = DriveApp.createFile('feito-afazeres.json', '{"itens":[],"categorias":[]}', 'application/json').getId();
    p.setProperty('ARQUIVO', id);
  }
  var codigo = p.getProperty('CODIGO');
  if (!codigo) {
    codigo = Utilities.getUuid().replace(/-/g, '').slice(0, 20);
    p.setProperty('CODIGO', codigo);
  }
  Logger.log('Seu código secreto do Feito!: ' + codigo);
  Logger.log('Guarde esse código: ele vai nos Ajustes do app, no celular e no computador.');
}

// Se achar que alguém viu o seu código, rode esta função para criar um novo.
function trocarCodigo() {
  PropertiesService.getScriptProperties().deleteProperty('CODIGO');
  configurar();
}

function doGet() {
  return saida({ ok: true, app: 'Feito!' });
}

function doPost(e) {
  var p = PropertiesService.getScriptProperties();
  var codigo = p.getProperty('CODIGO');
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return saida({ erro: 'Pedido inválido' }); }
  if (!codigo || !req || typeof req.codigo !== 'string' || !igual(req.codigo, codigo)) return saida({ erro: 'Código secreto errado' });
  if (e.postData.contents.length > 5000000) return saida({ erro: 'Dados grandes demais' });
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var arquivo = DriveApp.getFileById(p.getProperty('ARQUIVO'));
    var atual = {};
    try { atual = JSON.parse(arquivo.getBlob().getDataAsString()) || {}; } catch (err) { atual = {}; }
    var novo = {
      itens: mesclar(atual.itens, req.itens),
      categorias: mesclar(atual.categorias, req.categorias)
    };
    var texto = JSON.stringify(novo);
    if (texto !== JSON.stringify({ itens: atual.itens || [], categorias: atual.categorias || [] })) arquivo.setContent(texto);
    return saida(novo);
  } finally {
    lock.releaseLock();
  }
}

// junta as duas listas: para cada item fica a versão mexida por último
function mesclar(a, b) {
  var m = {};
  [].concat(Array.isArray(a) ? a : [], Array.isArray(b) ? b : []).forEach(function (x) {
    if (!x || typeof x !== 'object' || typeof x.id !== 'string' || x.id.length > 80) return;
    var y = m[x.id];
    if (!y || (Number(x.atualizado) || 0) > (Number(y.atualizado) || 0)) m[x.id] = x;
  });
  return Object.keys(m).map(function (k) { return m[k]; });
}

// compara sem dar pistas pelo tempo de resposta
function igual(a, b) {
  if (a.length !== b.length) return false;
  var r = 0;
  for (var i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function saida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
