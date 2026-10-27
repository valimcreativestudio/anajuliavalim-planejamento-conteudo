/**
 * Planejamento de Conteúdo — ponte entre a planilha e o site.
 *
 * Guarda os dados em duas abas desta planilha:
 *   MARCAS  — uma linha por marca (produtos, fases, observações)
 *   PAUTAS  — uma linha por post (mesmas colunas da aba DETALHAMENTO)
 *
 * Passo a passo no arquivo LEIAME.md.
 */

const ABA_PAUTAS = 'PAUTAS';
const ABA_MARCAS = 'MARCAS';

const CAMPOS_PAUTA = [
  ['id', 'ID'], ['marcaId', 'Marca ID'], ['marca', 'Marca'], ['status', 'Status'],
  ['data', 'Data'], ['dia', 'Dia'], ['postagem', 'Postagem'], ['fase', 'Fase'],
  ['formato', 'Formato'], ['produto', 'Produto'], ['pauta', 'Pauta / ângulo'],
  ['objetivo', 'Objetivo (jornada de compra)'], ['cta', 'CTA / destino'], ['rede', 'Rede'],
  ['gravacao', 'Gravação'], ['observacao', 'Observação'], ['inspiracao', 'Inspiração'],
  ['legenda', 'Legenda'], ['criativo', 'Criativo'], ['criado', 'Criado em'], ['atualizado', 'Atualizado em']
];
const CAMPOS_MARCA = [
  ['id', 'ID'], ['nome', 'Nome'], ['produtos', 'Produtos'], ['fases', 'Fases'],
  ['observacoes', 'Observações'], ['criado', 'Criado em'],
  ['perfil', 'Perfil (sobre, público, observações)'], ['arquivos', 'Arquivos']
];
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const FASES_PADRAO = [
  { nome: 'Lançamento', cor: '#A9A9A4' },
  { nome: 'Aquecimento da promoção', cor: '#8E9690' },
  { nome: 'Contagem regressiva', cor: '#8C8A96' },
  { nome: 'Semana da promoção', cor: '#6B6B70' },
  { nome: 'Última chamada', cor: '#3F3F43' }
];
const ACOES_DE_ESCRITA = ['salvarPauta', 'excluirPauta', 'status', 'salvarMarca', 'excluirMarca', 'enviarArquivo'];
const PASTA_ARQUIVOS = 'Planejamento de Conteúdo - Arquivos';

/* ---------- Entrada do site ---------- */

function doGet() {
  return json_(listar_());
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'Pedido inválido.' }); }

  if (ACOES_DE_ESCRITA.indexOf(req.action) >= 0) {
    const senha = PropertiesService.getScriptProperties().getProperty('SENHA');
    if (senha && req.senha !== senha) return json_({ ok: false, code: 'senha', error: 'Senha incorreta.' });
  }

  // envio de arquivo vai para o Drive, fora da trava da planilha
  if (req.action === 'enviarArquivo') {
    try { return json_(Object.assign({ ok: true }, enviarArquivo_(req))); }
    catch (err) { return json_({ ok: false, error: String(err.message || err) }); }
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    switch (req.action) {
      case 'listar': return json_(listar_());
      case 'salvarPauta': return json_({ ok: true, id: salvarPauta_(req.pauta || {}) });
      case 'excluirPauta': excluirLinha_(ABA_PAUTAS, CAMPOS_PAUTA, req.id); return json_({ ok: true });
      case 'status': mudarStatus_(req.id, req.status); return json_({ ok: true });
      case 'salvarMarca': return json_({ ok: true, id: salvarMarca_(req.marca || {}) });
      case 'excluirMarca': excluirMarca_(req.id); return json_({ ok: true });
      default: return json_({ ok: false, error: 'Ação desconhecida: ' + req.action });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Leitura ---------- */

function listar_() {
  const marcas = ler_(ABA_MARCAS, CAMPOS_MARCA).map(m => ({
    id: m.id,
    nome: m.nome,
    produtos: String(m.produtos || '').split('\n').map(s => s.trim()).filter(String),
    fases: parseFases_(m.fases),
    observacoes: m.observacoes || '',
    criado: Number(m.criado) || 0,
    perfil: parseJSON_(m.perfil, {}),
    arquivos: parseJSON_(m.arquivos, [])
  }));
  const pautas = ler_(ABA_PAUTAS, CAMPOS_PAUTA).map(p => {
    p.data = paraISO_(p.data);
    p.criado = Number(p.criado) || 0;
    p.atualizado = Number(p.atualizado) || 0;
    delete p.dia;
    delete p.marca;
    return p;
  });
  return { ok: true, marcas: marcas, pautas: pautas };
}

function ler_(nome, campos) {
  const aba = aba_(nome, campos);
  const n = aba.getLastRow() - 1;
  if (n < 1) return [];
  const tz = Session.getScriptTimeZone();
  return aba.getRange(2, 1, n, campos.length).getValues()
    .filter(l => l[0] !== '')
    .map(l => {
      const o = {};
      campos.forEach((c, i) => {
        const v = l[i];
        o[c[0]] = v instanceof Date ? Utilities.formatDate(v, tz, 'dd/MM/yyyy') : String(v);
      });
      return o;
    });
}

/* ---------- Escrita ---------- */

function salvarPauta_(p) {
  const id = p.id || Utilities.getUuid().slice(0, 13);
  const marca = ler_(ABA_MARCAS, CAMPOS_MARCA).filter(m => m.id === p.marcaId)[0];
  const linha = Object.assign({}, p, {
    id: id,
    marca: marca ? marca.nome : '',
    data: paraBR_(p.data),
    dia: diaDaSemana_(p.data),
    atualizado: Date.now()
  });
  gravar_(ABA_PAUTAS, CAMPOS_PAUTA, linha);
  return id;
}

function mudarStatus_(id, status) {
  const aba = aba_(ABA_PAUTAS, CAMPOS_PAUTA);
  const r = linhaDoId_(aba, id);
  if (!r) throw new Error('Pauta não encontrada. Atualize a página.');
  aba.getRange(r, colunaDe_(CAMPOS_PAUTA, 'status')).setValue(status);
  aba.getRange(r, colunaDe_(CAMPOS_PAUTA, 'atualizado')).setValue(Date.now());
}

function salvarMarca_(m) {
  const id = m.id || Utilities.getUuid().slice(0, 13);
  gravar_(ABA_MARCAS, CAMPOS_MARCA, {
    id: id,
    nome: m.nome || 'Sem nome',
    produtos: (m.produtos || []).join('\n'),
    fases: JSON.stringify(m.fases && m.fases.length ? m.fases : FASES_PADRAO),
    observacoes: m.observacoes || '',
    criado: m.criado || Date.now(),
    perfil: JSON.stringify(m.perfil || {}),
    arquivos: JSON.stringify(m.arquivos || [])
  });
  // mantém o nome da marca em dia na aba PAUTAS
  const aba = aba_(ABA_PAUTAS, CAMPOS_PAUTA);
  const n = aba.getLastRow() - 1;
  if (n > 0) {
    const ids = aba.getRange(2, colunaDe_(CAMPOS_PAUTA, 'marcaId'), n, 1).getValues();
    const col = aba.getRange(2, colunaDe_(CAMPOS_PAUTA, 'marca'), n, 1);
    const nomes = col.getValues().map((v, i) => [ids[i][0] === id ? (m.nome || 'Sem nome') : v[0]]);
    col.setValues(nomes);
  }
  return id;
}

function enviarArquivo_(req) {
  if (!req.base64) throw new Error('Arquivo vazio.');
  const marca = ler_(ABA_MARCAS, CAMPOS_MARCA).filter(m => m.id === req.marcaId)[0];
  const raiz = pasta_(DriveApp.getRootFolder(), PASTA_ARQUIVOS);
  const pasta = pasta_(raiz, marca ? marca.nome : 'Sem marca');
  const blob = Utilities.newBlob(Utilities.base64Decode(req.base64), req.mime || 'application/octet-stream', req.nome || 'arquivo');
  const arquivo = pasta.createFile(blob);
  try { arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { /* domínio pode bloquear link público */ }
  return { url: arquivo.getUrl(), driveId: arquivo.getId() };
}

function pasta_(mae, nome) {
  const it = mae.getFoldersByName(nome);
  return it.hasNext() ? it.next() : mae.createFolder(nome);
}

function excluirMarca_(id) {
  const aba = aba_(ABA_PAUTAS, CAMPOS_PAUTA);
  const n = aba.getLastRow() - 1;
  if (n > 0) {
    const ids = aba.getRange(2, colunaDe_(CAMPOS_PAUTA, 'marcaId'), n, 1).getValues();
    for (let i = ids.length - 1; i >= 0; i--) if (ids[i][0] === id) aba.deleteRow(i + 2);
  }
  excluirLinha_(ABA_MARCAS, CAMPOS_MARCA, id);
}

function gravar_(nome, campos, obj) {
  const aba = aba_(nome, campos);
  const valores = [campos.map(c => obj[c[0]] == null ? '' : String(obj[c[0]]))];
  const r = linhaDoId_(aba, obj.id);
  if (r) aba.getRange(r, 1, 1, campos.length).setValues(valores);
  else aba.getRange(aba.getLastRow() + 1, 1, 1, campos.length).setValues(valores);
}

function excluirLinha_(nome, campos, id) {
  const aba = aba_(nome, campos);
  const r = linhaDoId_(aba, id);
  if (r) aba.deleteRow(r);
}

/* ---------- Apoio ---------- */

function aba_(nome, campos) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let aba = ss.getSheetByName(nome);
  if (!aba) {
    aba = ss.insertSheet(nome);
    aba.getRange(1, 1, 1, campos.length).setValues([campos.map(c => c[1])]).setFontWeight('bold');
    aba.getRange(1, 1, aba.getMaxRows(), campos.length).setNumberFormat('@');
    aba.setFrozenRows(1);
  }
  // abas criadas por versões anteriores ganham as colunas novas
  if (aba.getMaxColumns() < campos.length) aba.insertColumnsAfter(aba.getMaxColumns(), campos.length - aba.getMaxColumns());
  const cab = aba.getRange(1, 1, 1, campos.length).getValues()[0];
  cab.forEach((h, i) => {
    if (h === '') {
      aba.getRange(1, i + 1).setValue(campos[i][1]).setFontWeight('bold');
      aba.getRange(1, i + 1, aba.getMaxRows(), 1).setNumberFormat('@');
    }
  });
  return aba;
}

function linhaDoId_(aba, id) {
  if (!id) return 0;
  const n = aba.getLastRow() - 1;
  if (n < 1) return 0;
  const ids = aba.getRange(2, 1, n, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 2;
  return 0;
}

function colunaDe_(campos, chave) {
  return campos.findIndex(c => c[0] === chave) + 1;
}

function parseJSON_(txt, padrao) {
  try { const v = JSON.parse(txt); if (v && typeof v === 'object') return v; } catch (e) {}
  return padrao;
}

function parseFases_(txt) {
  try { const f = JSON.parse(txt); if (Array.isArray(f) && f.length) return f; } catch (e) {}
  return FASES_PADRAO;
}

// "01/11/2026" -> "2026-11-01"
function paraISO_(v) {
  const m = String(v || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  return String(v || '');
}

// "2026-11-01" -> "01/11/2026"
function paraBR_(v) {
  const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? m[3] + '/' + m[2] + '/' + m[1] : String(v || '');
}

function diaDaSemana_(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? DIAS[new Date(+m[1], +m[2] - 1, +m[3]).getDay()] : '';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Rodar uma vez: cria as abas e importa o que já existe ---------- */

/**
 * Cria as abas MARCAS e PAUTAS e, se PAUTAS estiver vazia, importa as linhas
 * de todas as abas cujo nome começa com "DETALHAMENTO" (ex.: "DETALHAMENTO MARCA 1").
 * As observações vêm da aba com o nome da marca (ex.: "MARCA 1"), das linhas
 * que começam com "•" abaixo de "Observações".
 */
function configurar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  aba_(ABA_MARCAS, CAMPOS_MARCA);
  const pautas = aba_(ABA_PAUTAS, CAMPOS_PAUTA);
  if (pautas.getLastRow() > 1) { Logger.log('A aba PAUTAS já tem dados. Nada foi importado.'); return; }

  const tz = Session.getScriptTimeZone();
  const marcas = {};
  let total = 0;
  ss.getSheets().filter(a => /^DETALHAMENTO/i.test(a.getName())).forEach(aba => {
    const v = aba.getDataRange().getValues();
    if (v.length < 2) return;
    const cab = v[0].map(h => String(h).trim().toLowerCase());
    const col = nome => cab.findIndex(h => h.indexOf(nome) === 0);
    const c = {
      status: col('status'), marca: col('marca'), data: col('data'), postagem: col('postagem'), fase: col('fase'),
      formato: col('formato'), produto: col('produto'), pauta: col('pauta'), objetivo: col('objetivo'),
      cta: col('cta'), rede: col('rede'), gravacao: col('grava'), observacao: col('observa'),
      inspiracao: col('inspira'), legenda: col('legenda'), criativo: col('criativo')
    };
    v.slice(1).forEach((l, i) => {
      const pega = k => c[k] >= 0 ? l[c[k]] : '';
      const postagem = String(pega('postagem')).trim();
      if (!postagem) return;
      const nomeMarca = String(pega('marca')).trim() || aba.getName().replace(/^DETALHAMENTO\s*/i, '') || 'Marca';
      if (!marcas[nomeMarca]) marcas[nomeMarca] = { nome: nomeMarca, produtos: [], ordem: Object.keys(marcas).length };
      const m = marcas[nomeMarca];
      const produto = String(pega('produto')).trim();
      if (produto && m.produtos.indexOf(produto) < 0) m.produtos.push(produto);
      let data = pega('data');
      data = data instanceof Date ? Utilities.formatDate(data, tz, 'yyyy-MM-dd') : paraISO_(String(data).trim());
      const criativo = String(pega('criativo')).trim();
      (m.pautas = m.pautas || []).push({
        status: String(pega('status')).trim() || 'Ideia', data: data, postagem: postagem,
        fase: String(pega('fase')).trim(), formato: String(pega('formato')).trim(), produto: produto,
        pauta: String(pega('pauta')), objetivo: String(pega('objetivo')), cta: String(pega('cta')),
        rede: String(pega('rede')), gravacao: String(pega('gravacao')), observacao: String(pega('observacao')),
        inspiracao: String(pega('inspiracao')), legenda: String(pega('legenda')),
        criativo: /^https?:\/\//.test(criativo) ? criativo : '', criado: i + 1
      });
    });
  });

  Object.keys(marcas).forEach(nome => {
    const m = marcas[nome];
    const id = salvarMarca_({ nome: nome, produtos: m.produtos, fases: FASES_PADRAO, observacoes: observacoesDe_(ss, nome), criado: m.ordem + 1 });
    (m.pautas || []).forEach(p => { p.marcaId = id; salvarPauta_(p); total++; });
  });
  Logger.log('Importadas ' + Object.keys(marcas).length + ' marca(s) e ' + total + ' pauta(s).');
}

function observacoesDe_(ss, nomeMarca) {
  const aba = ss.getSheets().filter(a => a.getName().trim().toLowerCase() === nomeMarca.toLowerCase())[0];
  if (!aba) return '';
  const v = aba.getDataRange().getValues().map(l => String(l[0]).trim());
  const i = v.findIndex(t => /^observa/i.test(t));
  if (i < 0) return '';
  return v.slice(i + 1).filter(t => t.indexOf('•') === 0).join('\n');
}
