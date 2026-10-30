/**
 * Planejamento de Conteúdo — ponte entre a planilha e o site.
 *
 * Guarda os dados em abas desta planilha:
 *   MARCAS    — uma linha por marca (produtos, fases, perfil, arquivos)
 *   POSTAGENS — uma linha por post (mesmas colunas da aba DETALHAMENTO + fluxo de aprovação)
 *   USUARIOS  — equipe com login, papel e marcas liberadas (aba oculta)
 *
 * Papéis:
 *   admin     — vê e faz tudo, cadastra a equipe e as marcas
 *   diretor   — tudo do gestor + cadastra gestores, social medias e aprovadores, cria marcas,
 *               força status; não exclui marcas nem mexe em admins/diretores
 *   gestor    — vê todas as marcas, alimenta (inclusive nome, fases e configurações), valida e aprova; não mexe na equipe
 *   social    — vê e alimenta só as marcas liberadas para ele, inclusive nome, fases e configurações
 *   aprovador — vê as marcas liberadas, valida ideias e aprova conteúdos
 *
 * Passo a passo no arquivo LEIAME.md.
 */

// muda a cada atualização; o site avisa quando a implantação está com uma versão diferente
const VERSAO = '2026-10-30.2';

const ABA_PAUTAS = 'POSTAGENS';
const ABA_MARCAS = 'MARCAS';
const ABA_USUARIOS = 'USUARIOS';
const PASTA_ARQUIVOS = 'Planejamento de Conteúdo - Arquivos';
const DIAS_DE_SESSAO = 30;

const CAMPOS_PAUTA = [
  ['id', 'ID'], ['marcaId', 'Marca ID'], ['marca', 'Marca'], ['status', 'Status'],
  ['data', 'Data'], ['dia', 'Dia'], ['postagem', 'Postagem'], ['fase', 'Fase'],
  ['formato', 'Formato'], ['produto', 'Produto'], ['pauta', 'Nome'],
  ['objetivo', 'Objetivo (jornada de compra)'], ['cta', 'CTA / destino'], ['rede', 'Rede'],
  ['gravacao', 'Gravação'], ['observacao', 'Observação'], ['inspiracao', 'Inspiração'],
  ['legenda', 'Legenda'], ['criativo', 'Criativo'], ['criado', 'Criado em'], ['atualizado', 'Atualizado em'],
  ['motivo', 'Motivo da reprovação'], ['historico', 'Histórico'],
  ['agTipo', 'Agendado como'], ['agQuando', 'Agendado para'], ['postLink', 'Link do post publicado'],
  ['capa', 'Imagem de prévia']
];
const CAMPOS_MARCA = [
  ['id', 'ID'], ['nome', 'Nome'], ['produtos', 'Produtos'], ['fases', 'Fases'],
  ['observacoes', 'Observações'], ['criado', 'Criado em'],
  ['perfil', 'Perfil (sobre, público, observações)'], ['arquivos', 'Arquivos']
];
const CAMPOS_USUARIO = [
  ['id', 'ID'], ['nome', 'Nome'], ['login', 'Login (e-mail)'], ['papel', 'Papel'],
  ['marcas', 'Marcas liberadas (IDs)'], ['ativo', 'Ativo'], ['hash', 'Senha (protegida)'],
  ['sal', 'Sal'], ['criado', 'Criado em'], ['whatsapp', 'WhatsApp'], ['ultimoAcesso', 'Último acesso'], ['notificar', 'Notificações por e-mail']
];
const PAPEIS = ['admin', 'diretor', 'gestor', 'social', 'aprovador'];
const VEEM_TODAS = ['admin', 'diretor', 'gestor'];

const STATUS = ['Ideia', 'Em validação', 'Ideia reprovada', 'Em produção', 'Em aprovação', 'Ajustes solicitados', 'Aprovado', 'Agendado', 'Postado'];
const STATUS_ANTIGOS = { 'Validado': 'Em produção', 'Produzido': 'Em aprovação' };

// quem: 'editar' = admin ou social da marca; 'aprovar' = admin ou aprovador da marca
const ACOES = {
  enviarValidacao: { de: ['Ideia', 'Ideia reprovada'], para: 'Em validação', quem: 'editar', texto: 'Enviou a ideia para validação' },
  validar: { de: ['Em validação'], para: 'Em produção', quem: 'aprovar', texto: 'Validou a ideia' },
  reprovarIdeia: { de: ['Em validação'], para: 'Ideia reprovada', quem: 'aprovar', motivo: true, texto: 'Reprovou a ideia' },
  enviarAprovacao: { de: ['Em produção', 'Ajustes solicitados'], para: 'Em aprovação', quem: 'editar', texto: 'Enviou o conteúdo para aprovação' },
  aprovar: { de: ['Em aprovação'], para: 'Aprovado', quem: 'aprovar', texto: 'Aprovou o conteúdo' },
  pedirAjustes: { de: ['Em aprovação'], para: 'Ajustes solicitados', quem: 'aprovar', motivo: true, texto: 'Pediu ajustes no conteúdo' },
  agendar: { de: ['Aprovado'], para: 'Agendado', quem: 'editar', texto: 'Agendou', agenda: true },
  reagendar: { de: ['Agendado'], para: 'Agendado', quem: 'editar', texto: 'Alterou o agendamento', agenda: true },
  postar: { de: ['Aprovado', 'Agendado'], para: 'Postado', quem: 'editar', texto: 'Marcou como postado' }
};

const TIPOS_AGENDA = ['Feed', 'Carrossel', 'Reels', 'Story'];

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const FASES_PADRAO = [
  { nome: 'Lançamento', cor: '#A9A9A4' },
  { nome: 'Aquecimento da promoção', cor: '#8E9690' },
  { nome: 'Contagem regressiva', cor: '#8C8A96' },
  { nome: 'Semana da promoção', cor: '#6B6B70' },
  { nome: 'Última chamada', cor: '#3F3F43' }
];

/* ---------- Entrada do site ---------- */

function doGet() {
  return json_({ ok: true, versao: VERSAO, mensagem: 'A ligação com a planilha está funcionando. Use o site para entrar.' });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'Pedido inválido.' }); }
  try {
    if (req.action === 'login') return json_(login_(req.login, req.senha));
    const eu = usuarioDoToken_(req.token);
    if (!eu) return json_({ ok: false, code: 'sessao', error: 'Sua sessão expirou. Entre de novo.' });

    // envio de arquivo vai para o Drive, fora da trava da planilha
    if (req.action === 'enviarArquivo') return json_(Object.assign({ ok: true }, enviarArquivo_(eu, req)));
    // Instagram: chamadas externas, também fora da trava
    if (req.action === 'instaConectar') return json_(Object.assign({ ok: true }, instaConectar_(eu, req.marcaId, req.chave)));
    if (req.action === 'instaDesconectar') return json_(Object.assign({ ok: true }, instaDesconectar_(eu, req.marcaId)));
    if (req.action === 'instaMidias') return json_(Object.assign({ ok: true }, instaMidias_(eu, req.marcaId, req.forcar)));
    if (req.action === 'acessosListar') return json_(Object.assign({ ok: true }, acessosListar_(eu, req.marcaId)));
    if (req.action === 'acessosSalvar') return json_(Object.assign({ ok: true }, acessosSalvar_(eu, req.marcaId, req.acessos)));

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      switch (req.action) {
        case 'listar': return json_(listar_(eu));
        case 'salvarPauta': return json_({ ok: true, id: salvarPauta_(eu, req.pauta || {}) });
        case 'excluirPauta': excluirPauta_(eu, req.id); return json_({ ok: true });
        case 'acao': acaoPauta_(eu, req.id, req.acao, req.motivo, req.status, req.dados || {}, req.site); return json_({ ok: true });
        case 'salvarMarca': return json_({ ok: true, id: salvarMarca_(eu, req.marca || {}) });
        case 'excluirMarca': soAdmin_(eu); excluirMarca_(req.id); return json_({ ok: true });
        case 'salvarUsuario': gerencia_(eu); return json_({ ok: true, id: salvarUsuario_(eu, req.usuario || {}) });
        case 'trocarSenha': trocarSenha_(eu, req.atual, req.nova); return json_({ ok: true });
        case 'meuNome': salvarMeuNome_(eu, req.nome); return json_({ ok: true });
        case 'minhasNotificacoes': salvarPreferencia_(eu, 'notificar', req.notificar === false ? 'não' : 'sim'); return json_({ ok: true });
        case 'sair': PropertiesService.getScriptProperties().deleteProperty('tok_' + req.token); return json_({ ok: true });
        default: return json_({ ok: false, error: 'Ação desconhecida: ' + req.action });
      }
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_({ ok: false, code: err.code || 'server', error: String(err.message || err) });
  }
}

/* ---------- Login e permissões ---------- */

function login_(login, senha) {
  const u = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(x => x.login === normLogin_(login))[0];
  if (!u || u.ativo !== 'sim' || u.hash !== hash_(senha, u.sal)) {
    Utilities.sleep(800);
    throw erro_('login', 'Login ou senha incorretos.');
  }
  const props = PropertiesService.getScriptProperties();
  const agora = Date.now();
  // limpa sessões vencidas
  const todas = props.getProperties();
  Object.keys(todas).forEach(k => {
    if (k.indexOf('tok_') === 0) {
      try { if (JSON.parse(todas[k]).exp < agora) props.deleteProperty(k); } catch (e) { props.deleteProperty(k); }
    }
  });
  const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  props.setProperty('tok_' + token, JSON.stringify({ uid: u.id, exp: agora + DIAS_DE_SESSAO * 864e5 }));
  return { ok: true, token: token };
}

function usuarioDoToken_(token) {
  if (!token) return null;
  const raw = PropertiesService.getScriptProperties().getProperty('tok_' + token);
  if (!raw) return null;
  let s;
  try { s = JSON.parse(raw); } catch (e) { return null; }
  if (s.exp < Date.now()) return null;
  const u = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(x => x.id === s.uid)[0];
  if (!u || u.ativo !== 'sim') return null;
  return publicoUsuario_(u);
}

function publicoUsuario_(u) {
  return {
    id: u.id, nome: u.nome, login: u.login, papel: u.papel, ativo: u.ativo === 'sim', whatsapp: u.whatsapp || '',
    ultimoAcesso: Number(u.ultimoAcesso) || 0,
    notificar: u.notificar !== 'não',
    marcas: String(u.marcas || '').split(',').map(s => s.trim()).filter(String)
  };
}

function acesso_(eu, marcaId) {
  return VEEM_TODAS.indexOf(eu.papel) >= 0 || eu.marcas.indexOf('*') >= 0 || eu.marcas.indexOf(marcaId) >= 0;
}
function podeEditar_(eu, marcaId) {
  return VEEM_TODAS.indexOf(eu.papel) >= 0 || (eu.papel === 'social' && acesso_(eu, marcaId));
}
function podeAprovar_(eu, marcaId) {
  return VEEM_TODAS.indexOf(eu.papel) >= 0 || (eu.papel === 'aprovador' && acesso_(eu, marcaId));
}
function gerencia_(eu) {
  if (eu.papel !== 'admin' && eu.papel !== 'diretor') throw erro_('permissao', 'Só o administrador ou o diretor pode fazer isso.');
}
function soAdmin_(eu) {
  if (eu.papel !== 'admin') throw erro_('permissao', 'Só o administrador pode fazer isso.');
}
function erro_(code, msg) {
  const e = new Error(msg); e.code = code; return e;
}

/* ---------- Leitura ---------- */

function listar_(eu) {
  const marcas = ler_(ABA_MARCAS, CAMPOS_MARCA).filter(m => acesso_(eu, m.id)).map(m => ({
    id: m.id,
    nome: m.nome,
    produtos: String(m.produtos || '').split('\n').map(s => s.trim()).filter(String),
    fases: parseFases_(m.fases),
    observacoes: m.observacoes || '',
    criado: Number(m.criado) || 0,
    perfil: parseJSON_(m.perfil, {}),
    arquivos: parseJSON_(m.arquivos, []),
    insta: instaStatus_(m.id)
  }));
  const pautas = ler_(ABA_PAUTAS, CAMPOS_PAUTA).filter(p => acesso_(eu, p.marcaId)).map(pautaParaSite_);
  registrarAcesso_(eu);
  const r = { ok: true, versao: VERSAO, eu: eu, marcas: marcas, pautas: pautas };
  if (VEEM_TODAS.indexOf(eu.papel) >= 0) r.usuarios = ler_(ABA_USUARIOS, CAMPOS_USUARIO).map(publicoUsuario_);
  return r;
}

// grava o último acesso no máximo a cada 10 minutos, para não escrever na planilha a cada atualização
function registrarAcesso_(eu) {
  if (!eu.id || Date.now() - (eu.ultimoAcesso || 0) < 10 * 60000) return;
  const aba = aba_(ABA_USUARIOS, CAMPOS_USUARIO);
  const r = linhaDoId_(aba, eu.id);
  if (r) aba.getRange(r, colunaDe_(CAMPOS_USUARIO, 'ultimoAcesso')).setValue(String(Date.now()));
}

function pautaParaSite_(p) {
  p.data = paraISO_(p.data);
  p.criado = Number(p.criado) || 0;
  p.atualizado = Number(p.atualizado) || 0;
  p.status = normStatus_(p.status);
  p.historico = parseJSON_(p.historico, []);
  // "05/11/2026 18:30" -> agData "2026-11-05" e agHora "18:30"
  const q = String(p.agQuando || '').match(/^(\S+)\s+(\d{1,2}:\d{2})$/);
  p.agData = q ? paraISO_(q[1]) : '';
  p.agHora = q ? q[2] : '';
  delete p.agQuando;
  delete p.dia;
  delete p.marca;
  return p;
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

function pautaPorId_(id) {
  const p = ler_(ABA_PAUTAS, CAMPOS_PAUTA).filter(x => x.id === String(id))[0];
  return p ? pautaParaSite_(p) : null;
}

/* ---------- Pautas ---------- */

function salvarPauta_(eu, p) {
  const atual = p.id ? pautaPorId_(p.id) : null;
  if (p.id && !atual) throw erro_('server', 'Postagem não encontrada. Atualize a página.');
  const marcaId = atual ? atual.marcaId : p.marcaId;
  if (!podeEditar_(eu, marcaId)) throw erro_('permissao', 'Você não pode editar postagens desta marca.');
  const id = atual ? atual.id : Utilities.getUuid().slice(0, 13);
  const historico = atual ? atual.historico : [{ em: Date.now(), por: eu.nome, uid: eu.id, acao: 'Criou a postagem' }];
  if (atual) {
    // edições seguidas da mesma pessoa em até 30 min contam como uma só
    const ult = historico[historico.length - 1];
    if (ult && ult.uid === eu.id && ult.acao === 'Editou a postagem' && Date.now() - ult.em < 30 * 60000) ult.em = Date.now();
    else historico.push({ em: Date.now(), por: eu.nome, uid: eu.id, acao: 'Editou a postagem' });
  }
  // começa do que já está salvo e só troca os campos que vieram; status, agendamento e link do post
  // só mudam pelas ações do fluxo (assim editar ou arrastar não apaga o agendamento)
  const PROTEGIDOS = ['id', 'marcaId', 'status', 'motivo', 'historico', 'agTipo', 'agQuando', 'agData', 'agHora', 'postLink', 'criado', 'atualizado'];
  const base = atual ? Object.assign({}, atual, { agQuando: atual.agData ? paraBR_(atual.agData) + ' ' + atual.agHora : '' }) : {};
  const novos = {};
  Object.keys(p).forEach(k => { if (PROTEGIDOS.indexOf(k) < 0) novos[k] = p[k]; });
  const dataNova = novos.data || (atual && atual.data) || '';
  const linha = Object.assign(base, novos, {
    id: id,
    marcaId: marcaId,
    marca: nomeDaMarca_(marcaId),
    status: atual ? atual.status : 'Ideia',
    motivo: atual ? atual.motivo : '',
    historico: JSON.stringify(historico),
    data: paraBR_(dataNova),
    dia: diaDaSemana_(dataNova),
    criado: atual ? atual.criado : Date.now(),
    atualizado: Date.now()
  });
  gravar_(ABA_PAUTAS, CAMPOS_PAUTA, linha);
  return id;
}

function excluirPauta_(eu, id) {
  const atual = pautaPorId_(id);
  if (!atual) return;
  if (!podeEditar_(eu, atual.marcaId)) throw erro_('permissao', 'Você não pode excluir postagens desta marca.');
  excluirLinha_(ABA_PAUTAS, CAMPOS_PAUTA, id);
}

function acaoPauta_(eu, id, acao, motivo, status, dados, site) {
  const p = pautaPorId_(id);
  if (!p) throw erro_('server', 'Postagem não encontrada. Atualize a página.');
  motivo = String(motivo || '').trim();
  let para, texto;
  if (acao === 'definir') {
    gerencia_(eu);
    if (STATUS.indexOf(status) < 0) throw erro_('server', 'Status inválido.');
    para = status; texto = 'Mudou o status para ' + status;
  } else {
    const a = ACOES[acao];
    if (!a) throw erro_('server', 'Ação desconhecida.');
    const pode = a.quem === 'aprovar' ? podeAprovar_(eu, p.marcaId) : podeEditar_(eu, p.marcaId);
    if (!pode) throw erro_('permissao', a.quem === 'aprovar' ? 'Só o aprovador ou o administrador pode fazer isso.' : 'Você não pode alterar postagens desta marca.');
    if (a.de.indexOf(p.status) < 0) throw erro_('server', 'Esta postagem está em "' + p.status + '" e não pode passar por esta etapa. Atualize a página.');
    if (a.motivo && !motivo) throw erro_('server', 'Escreva o motivo.');
    para = a.para; texto = a.texto;
    if (a.agenda) {
      if (TIPOS_AGENDA.indexOf(dados.agTipo) < 0) throw erro_('server', 'Escolha se é Feed, Carrossel, Reels ou Story.');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.agData || '') || !/^\d{1,2}:\d{2}$/.test(dados.agHora || '')) throw erro_('server', 'Preencha a data e a hora do agendamento.');
      texto += ': ' + dados.agTipo + ' em ' + paraBR_(dados.agData).slice(0, 5) + ' às ' + dados.agHora;
    }
  }
  const historico = p.historico.concat([{ em: Date.now(), por: eu.nome, uid: eu.id, acao: texto, de: p.status, para: para, motivo: motivo }]);
  const aba = aba_(ABA_PAUTAS, CAMPOS_PAUTA);
  const r = linhaDoId_(aba, id);
  const set = (k, v) => aba.getRange(r, colunaDe_(CAMPOS_PAUTA, k)).setValue(v);
  set('status', para);
  set('motivo', (para === 'Ideia reprovada' || para === 'Ajustes solicitados') ? motivo : '');
  set('historico', JSON.stringify(historico));
  set('atualizado', String(Date.now()));
  if (ACOES[acao] && ACOES[acao].agenda) {
    set('agTipo', dados.agTipo);
    set('agQuando', paraBR_(dados.agData) + ' ' + dados.agHora);
  }
  if (acao === 'postar' && dados.postLink) set('postLink', String(dados.postLink).trim());
  // o e-mail nunca pode impedir a ação de ser registrada
  try { notificar_(eu, p, acao, motivo, historico, site); } catch (e) { Logger.log('Falha ao enviar notificação: ' + e); }
}

/* ---------- Notificações por e-mail ---------- */

const AVISOS = {
  enviarValidacao: { para: 'aprovador', titulo: '💡 Nova ideia para validar', frase: 'enviou uma ideia para validação' },
  enviarAprovacao: { para: 'aprovador', titulo: '📝 Conteúdo para aprovar', frase: 'enviou um conteúdo pronto para aprovação' },
  validar: { para: 'autor', titulo: '✅ Ideia validada', frase: 'validou a sua ideia. Pode seguir para a produção.' },
  reprovarIdeia: { para: 'autor', titulo: '❌ Ideia reprovada', frase: 'reprovou a sua ideia' },
  aprovar: { para: 'autor', titulo: '✅ Conteúdo aprovado', frase: 'aprovou o seu conteúdo. Já pode agendar.' },
  pedirAjustes: { para: 'autor', titulo: '✏️ Ajustes pedidos', frase: 'pediu ajustes no seu conteúdo' }
};

function notificar_(eu, p, acao, motivo, historico, site) {
  const av = AVISOS[acao];
  if (!av) return;
  const pessoas = ler_(ABA_USUARIOS, CAMPOS_USUARIO).map(publicoUsuario_)
    .filter(u => u.ativo && u.notificar && u.id !== eu.id && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(u.login));
  let dest = [];
  if (av.para === 'aprovador') {
    // aprovador da marca; sem aprovador, o gestor; sem gestor, diretor e administrador
    dest = pessoas.filter(u => u.papel === 'aprovador' && acesso_(u, p.marcaId));
    if (!dest.length) dest = pessoas.filter(u => u.papel === 'gestor');
    if (!dest.length) dest = pessoas.filter(u => u.papel === 'diretor' || u.papel === 'admin');
  } else {
    // quem enviou para esta etapa; se não der para saber, as social medias da marca
    const envio = historico.slice().reverse().filter(h => String(h.acao || '').indexOf('Enviou') === 0)[0];
    dest = envio && envio.uid ? pessoas.filter(u => u.id === envio.uid) : [];
    if (!dest.length) dest = pessoas.filter(u => u.papel === 'social' && acesso_(u, p.marcaId));
  }
  if (!dest.length || MailApp.getRemainingDailyQuota() < dest.length) return;

  const marca = nomeDaMarca_(p.marcaId);
  const titulo = (p.produto ? p.produto + ': ' : '') + (p.postagem || 'Postagem');
  const link = /^https:\/\//.test(String(site || '')) ? String(site).split('#')[0] + '#aprovacoes' : '';
  const assunto = av.titulo + ': ' + titulo + ' (' + marca + ')';
  const linha = (k, v) => v ? '<tr><td style="padding:4px 12px 4px 0;color:#6b6b70">' + k + '</td><td style="padding:4px 0">' + escH_(v) + '</td></tr>' : '';
  const html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1d1d1f;max-width:560px">' +
    '<p style="margin:0 0 6px;color:#6b6b70;font-size:12px;letter-spacing:.08em;text-transform:uppercase">' + escH_(marca) + '</p>' +
    '<h2 style="margin:0 0 14px;font-size:22px;font-weight:600">' + escH_(av.titulo) + '</h2>' +
    '<p style="margin:0 0 14px"><b>' + escH_(eu.nome) + '</b> ' + escH_(av.frase) + ':</p>' +
    '<p style="margin:0 0 14px;font-size:18px"><b>' + escH_(titulo) + '</b></p>' +
    (motivo ? '<div style="border-left:4px solid #b3362f;background:#fbeeed;padding:10px 14px;margin:0 0 14px"><b style="color:#b3362f">Motivo</b><br>' + escH_(motivo) + '</div>' : '') +
    '<table style="border-collapse:collapse;font-size:14px;margin:0 0 18px">' + linha('Data planejada', paraBR_(p.data)) + linha('Formato', p.formato) + linha('Nome', p.pauta) + '</table>' +
    (link ? '<p style="margin:0 0 18px"><a href="' + link + '" style="background:#1d1d1f;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">Abrir o sistema</a></p>' : '') +
    '<p style="margin:0;color:#6b6b70;font-size:12px">Você recebe este aviso porque está na equipe do Planejamento de Conteúdo. Para não receber mais, desligue em "Minha conta".</p></div>';
  dest.forEach(u => MailApp.sendEmail({ to: u.login, subject: assunto, htmlBody: html, name: 'Planejamento de Conteúdo' }));
}

function escH_(t) {
  return String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function normStatus_(s) {
  s = String(s || '').trim();
  if (STATUS_ANTIGOS[s]) return STATUS_ANTIGOS[s];
  return STATUS.indexOf(s) >= 0 ? s : 'Ideia';
}

/* ---------- Marcas ---------- */

function nomeDaMarca_(id) {
  const m = ler_(ABA_MARCAS, CAMPOS_MARCA).filter(x => x.id === id)[0];
  return m ? m.nome : '';
}

function salvarMarca_(eu, m) {
  if (!m.id) gerencia_(eu);
  else if (!podeEditar_(eu, m.id)) throw erro_('permissao', 'Você não pode editar esta marca.');
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
  // mantém o nome da marca em dia na aba POSTAGENS
  const aba = aba_(ABA_PAUTAS, CAMPOS_PAUTA);
  const n = aba.getLastRow() - 1;
  if (n > 0) {
    const ids = aba.getRange(2, colunaDe_(CAMPOS_PAUTA, 'marcaId'), n, 1).getValues();
    const col = aba.getRange(2, colunaDe_(CAMPOS_PAUTA, 'marca'), n, 1);
    col.setValues(col.getValues().map((v, i) => [ids[i][0] === id ? (m.nome || 'Sem nome') : v[0]]));
  }
  return id;
}

/* ---------- Instagram (leitura dos posts do perfil) ----------
 * A chave de acesso fica só nas Propriedades do script (ig_<marca>); nunca vai para o site.
 * Aceita dois tipos de chave:
 *  - login do Instagram (começa com "IG"): lê direto em graph.instagram.com;
 *  - login do Facebook (Explorador da Graph API): acha a Página ligada ao Instagram da marca
 *    e guarda a chave da Página, que não vence quando vem de uma chave estendida. */

function instaDados_(marcaId) {
  const raw = PropertiesService.getScriptProperties().getProperty('ig_' + marcaId);
  return raw ? parseJSON_(raw, null) : null;
}

function instaStatus_(marcaId) {
  const d = instaDados_(marcaId);
  return d ? { conectado: true, usuario: d.usuario || '' } : { conectado: false };
}

function instaGet_(url) {
  const r = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  let j;
  try { j = JSON.parse(r.getContentText()); } catch (e) { throw erro_('insta', 'O Instagram não respondeu. Tente de novo em alguns minutos.'); }
  if (j.error) {
    const venceu = j.error.code === 190;
    throw erro_('insta', venceu ? 'A chave do Instagram expirou ou foi revogada. Gere uma nova e conecte de novo.' : 'Instagram: ' + j.error.message);
  }
  return j;
}

function instaConectar_(eu, marcaId, token) {
  if (!podeEditar_(eu, marcaId)) throw erro_('permissao', 'Você não pode conectar o Instagram desta marca.');
  token = String(token || '').trim();
  if (token.length < 20) throw erro_('server', 'Cole a chave de acesso completa.');
  let dados;
  if (/^IG/.test(token)) {
    const me = instaGet_('https://graph.instagram.com/me?fields=user_id,username&access_token=' + encodeURIComponent(token));
    dados = { tipo: 'ig', token: token, usuario: me.username || '' };
  } else {
    dados = instaPelaPagina_(marcaId, token);
  }
  dados.salvo = Date.now(); dados.renovado = Date.now();
  PropertiesService.getScriptProperties().setProperty('ig_' + marcaId, JSON.stringify(dados));
  CacheService.getScriptCache().remove('igm_' + marcaId);
  return { usuario: dados.usuario };
}

// chave do login do Facebook: lista as Páginas que a pessoa administra e pega a que tem o Instagram desta marca
function instaPelaPagina_(marcaId, token) {
  const j = instaGet_('https://graph.facebook.com/me/accounts?fields=name,access_token,instagram_business_account%7Bid,username%7D&limit=100&access_token=' + encodeURIComponent(token));
  const paginas = (j.data || []).filter(p => p.instagram_business_account && p.instagram_business_account.id);
  if (!paginas.length) throw erro_('insta', 'Essa chave não mostra nenhuma Página do Facebook ligada a um Instagram. Confira se marcou as permissões instagram_basic, pages_show_list e pages_read_engagement e se o Instagram da marca está ligado à Página.');
  const m = ler_(ABA_MARCAS, CAMPOS_MARCA).filter(x => x.id === marcaId)[0];
  const arroba = String((parseJSON_(m && m.perfil, {}) || {}).instagram || '').replace(/^.*instagram\.com\//i, '').replace(/[@\/\s]/g, '').toLowerCase();
  let p = arroba ? paginas.filter(x => String(x.instagram_business_account.username || '').toLowerCase() === arroba)[0] : null;
  if (!p && paginas.length === 1) p = paginas[0];
  if (!p) {
    const lista = paginas.map(x => '@' + x.instagram_business_account.username).join(', ');
    throw erro_('insta', arroba
      ? 'Não achei o @' + arroba + ' nesta chave. Instagrams encontrados: ' + lista + '.'
      : 'Essa chave tem vários Instagrams (' + lista + '). Preencha o @ da marca em Marca → Sobre e conecte de novo.');
  }
  return { tipo: 'fb', token: p.access_token, igId: p.instagram_business_account.id, usuario: p.instagram_business_account.username || '', pagina: p.name || '' };
}

function instaDesconectar_(eu, marcaId) {
  if (!podeEditar_(eu, marcaId)) throw erro_('permissao', 'Você não pode desconectar o Instagram desta marca.');
  PropertiesService.getScriptProperties().deleteProperty('ig_' + marcaId);
  CacheService.getScriptCache().remove('igm_' + marcaId);
  return {};
}

function instaMidias_(eu, marcaId, forcar) {
  if (!acesso_(eu, marcaId)) throw erro_('permissao', 'Sem acesso a esta marca.');
  const d = instaDados_(marcaId);
  if (!d) return { conectado: false };
  const cache = CacheService.getScriptCache();
  if (!forcar) {
    const c = cache.get('igm_' + marcaId);
    if (c) return JSON.parse(c);
  }
  // chave do login do Instagram vale 60 dias; renova sozinha quando passa de 20 dias (a da Página não precisa)
  if (d.tipo !== 'fb' && Date.now() - (d.renovado || 0) > 20 * 864e5) {
    try {
      const n = instaGet_('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + encodeURIComponent(d.token));
      if (n.access_token) { d.token = n.access_token; d.renovado = Date.now(); PropertiesService.getScriptProperties().setProperty('ig_' + marcaId, JSON.stringify(d)); }
    } catch (e) { /* tenta de novo na próxima vez */ }
  }
  let res;
  try {
    const campos = 'fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=36&access_token=' + encodeURIComponent(d.token);
    const j = instaGet_(d.tipo === 'fb' ? 'https://graph.facebook.com/' + d.igId + '/media?' + campos : 'https://graph.instagram.com/me/media?' + campos);
    res = {
      conectado: true, usuario: d.usuario,
      midias: (j.data || []).map(x => ({
        id: x.id, tipo: x.media_type, link: x.permalink, em: x.timestamp,
        img: x.media_type === 'VIDEO' ? (x.thumbnail_url || '') : (x.media_url || ''),
        legenda: String(x.caption || '').slice(0, 140)
      }))
    };
  } catch (e) {
    return { conectado: true, usuario: d.usuario, erro: String(e.message || e) };
  }
  try { cache.put('igm_' + marcaId, JSON.stringify(res), 900); } catch (e) {}
  return res;
}

/* ---------- Acessos das contas da marca (login, senha, chave) ----------
 * Ficam nas Propriedades do script (cred_<marca>), fora da planilha, e só vão para
 * quem alimenta a marca: social media da marca, gestor, diretor e administrador. */

function acessosListar_(eu, marcaId) {
  if (!podeEditar_(eu, marcaId)) throw erro_('permissao', 'Só quem alimenta a marca vê os acessos.');
  const d = parseJSON_(PropertiesService.getScriptProperties().getProperty('cred_' + marcaId), null) || {};
  return { acessos: Array.isArray(d.acessos) ? d.acessos : [], por: d.por || '', em: d.em || 0 };
}

function acessosSalvar_(eu, marcaId, acessos) {
  if (!podeEditar_(eu, marcaId)) throw erro_('permissao', 'Só quem alimenta a marca altera os acessos.');
  const campos = ['plataforma', 'usuario', 'email', 'senha', 'chave', 'obs'];
  const lista = (Array.isArray(acessos) ? acessos : []).slice(0, 60).map(a => {
    const o = {}; campos.forEach(k => o[k] = String((a && a[k]) || '').slice(0, k === 'chave' ? 2000 : 500)); return o;
  }).filter(a => campos.some(k => a[k].trim()));
  const valor = JSON.stringify({ acessos: lista, por: eu.nome, em: Date.now() });
  if (valor.length > 60000) throw erro_('server', 'Acessos demais para esta marca. Apague alguns e tente de novo.');
  PropertiesService.getScriptProperties().setProperty('cred_' + marcaId, valor);
  return { total: lista.length };
}

function excluirMarca_(id) {
  const aba = aba_(ABA_PAUTAS, CAMPOS_PAUTA);
  const n = aba.getLastRow() - 1;
  if (n > 0) {
    const ids = aba.getRange(2, colunaDe_(CAMPOS_PAUTA, 'marcaId'), n, 1).getValues();
    for (let i = ids.length - 1; i >= 0; i--) if (ids[i][0] === id) aba.deleteRow(i + 2);
  }
  excluirLinha_(ABA_MARCAS, CAMPOS_MARCA, id);
  PropertiesService.getScriptProperties().deleteProperty('ig_' + id);
  PropertiesService.getScriptProperties().deleteProperty('cred_' + id);
}

function enviarArquivo_(eu, req) {
  if (!podeEditar_(eu, req.marcaId)) throw erro_('permissao', 'Você não pode enviar arquivos para esta marca.');
  if (!req.base64) throw new Error('Arquivo vazio.');
  const raiz = pasta_(DriveApp.getRootFolder(), PASTA_ARQUIVOS);
  const pasta = pasta_(raiz, nomeDaMarca_(req.marcaId) || 'Sem marca');
  const blob = Utilities.newBlob(Utilities.base64Decode(req.base64), req.mime || 'application/octet-stream', req.nome || 'arquivo');
  const arquivo = pasta.createFile(blob);
  try { arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { /* domínio pode bloquear link público */ }
  return { url: arquivo.getUrl(), driveId: arquivo.getId() };
}

function pasta_(mae, nome) {
  const it = mae.getFoldersByName(nome);
  return it.hasNext() ? it.next() : mae.createFolder(nome);
}

/* ---------- Equipe ---------- */

function salvarUsuario_(eu, u) {
  const todos = ler_(ABA_USUARIOS, CAMPOS_USUARIO);
  const atual = u.id ? todos.filter(x => x.id === u.id)[0] : null;
  if (u.id && !atual) throw erro_('server', 'Pessoa não encontrada.');
  const login = normLogin_(u.login);
  if (!login) throw erro_('server', 'Preencha o login.');
  if (todos.some(x => x.login === login && x.id !== u.id)) throw erro_('server', 'Já existe alguém com este login.');
  if (PAPEIS.indexOf(u.papel) < 0) throw erro_('server', 'Papel inválido.');
  if (eu.papel === 'diretor') {
    // o diretor não cria nem altera administradores e diretores (nem a si mesmo por aqui)
    if (['gestor', 'social', 'aprovador'].indexOf(u.papel) < 0) throw erro_('permissao', 'O diretor só cadastra gestores, social medias e aprovadores.');
    if (atual && ['admin', 'diretor'].indexOf(atual.papel) >= 0) throw erro_('permissao', 'Só o administrador altera este acesso.');
  }
  if (atual && atual.id === eu.id && (u.papel !== 'admin' || u.ativo === false)) throw erro_('server', 'Você não pode tirar o seu próprio acesso de administrador.');
  if (!atual && !u.senha) throw erro_('server', 'Defina uma senha provisória.');
  if (u.senha && String(u.senha).length < 6) throw erro_('server', 'A senha precisa ter pelo menos 6 caracteres.');
  const sal = u.senha ? Utilities.getUuid() : atual.sal;
  gravar_(ABA_USUARIOS, CAMPOS_USUARIO, {
    id: atual ? atual.id : Utilities.getUuid().slice(0, 13),
    nome: String(u.nome || '').trim() || login,
    login: login,
    papel: u.papel,
    marcas: VEEM_TODAS.indexOf(u.papel) >= 0 ? '*' : (u.marcas || []).join(','),
    ativo: u.ativo === false ? 'não' : 'sim',
    hash: u.senha ? hash_(u.senha, sal) : atual.hash,
    sal: sal,
    criado: atual ? atual.criado : String(Date.now()),
    whatsapp: String(u.whatsapp || '').replace(/\D/g, ''),
    ultimoAcesso: atual ? atual.ultimoAcesso : '',
    notificar: atual ? atual.notificar : ''
  });
}

function salvarPreferencia_(eu, campo, valor) {
  const u = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(x => x.id === eu.id)[0];
  u[campo] = valor;
  gravar_(ABA_USUARIOS, CAMPOS_USUARIO, u);
}

function salvarMeuNome_(eu, nome) {
  nome = String(nome || '').trim().slice(0, 60);
  if (!nome) throw erro_('server', 'Escreva o seu nome.');
  const u = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(x => x.id === eu.id)[0];
  u.nome = nome;
  gravar_(ABA_USUARIOS, CAMPOS_USUARIO, u);
}

function trocarSenha_(eu, atual, nova) {
  const u = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(x => x.id === eu.id)[0];
  if (!u || u.hash !== hash_(atual, u.sal)) throw erro_('server', 'A senha atual está incorreta.');
  if (!nova || String(nova).length < 6) throw erro_('server', 'A nova senha precisa ter pelo menos 6 caracteres.');
  const sal = Utilities.getUuid();
  u.sal = sal; u.hash = hash_(nova, sal);
  gravar_(ABA_USUARIOS, CAMPOS_USUARIO, u);
}

function hash_(senha, sal) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(sal) + '|' + String(senha), Utilities.Charset.UTF_8);
  return Utilities.base64Encode(bytes);
}

function normLogin_(s) {
  return String(s || '').trim().toLowerCase();
}

/* ---------- Escrita genérica ---------- */

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
    if (nome === ABA_USUARIOS) aba.hideSheet();
  }
  // abas criadas por versões anteriores ganham as colunas novas
  if (aba.getMaxColumns() < campos.length) aba.insertColumnsAfter(aba.getMaxColumns(), campos.length - aba.getMaxColumns());
  const cab = aba.getRange(1, 1, 1, campos.length).getValues()[0];
  cab.forEach((h, i) => {
    if (h === '') {
      aba.getRange(1, i + 1, aba.getMaxRows(), 1).setNumberFormat('@');
      aba.getRange(1, i + 1).setValue(campos[i][1]).setFontWeight('bold');
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
  const f = parseJSON_(txt, null);
  return Array.isArray(f) && f.length ? f : FASES_PADRAO;
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

/* ---------- Rodar uma vez: cria as abas, o primeiro administrador e importa o que já existe ---------- */

/**
 * 1. Cria as abas MARCAS, POSTAGENS e USUARIOS (oculta).
 * 2. Se ainda não há ninguém cadastrado, cria você como administrador e mostra
 *    o login e uma senha provisória no "Registro de execução" (embaixo do editor).
 * 3. Se POSTAGENS estiver vazia, importa as linhas das abas que começam com "DETALHAMENTO".
 * 4. Atualiza status antigos (Validado → Em produção, Produzido → Em aprovação).
 */
function configurar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  aba_(ABA_MARCAS, CAMPOS_MARCA);
  const pautas = aba_(ABA_PAUTAS, CAMPOS_PAUTA);
  aba_(ABA_USUARIOS, CAMPOS_USUARIO);

  if (!ler_(ABA_USUARIOS, CAMPOS_USUARIO).length) {
    const login = normLogin_(Session.getEffectiveUser().getEmail()) || 'admin';
    const senha = Utilities.getUuid().slice(0, 8);
    const sal = Utilities.getUuid();
    gravar_(ABA_USUARIOS, CAMPOS_USUARIO, {
      id: Utilities.getUuid().slice(0, 13), nome: 'Administrador', login: login, papel: 'admin',
      marcas: '*', ativo: 'sim', hash: hash_(senha, sal), sal: sal, criado: String(Date.now())
    });
    Logger.log('Administrador criado. Login: ' + login + '  |  Senha provisória: ' + senha + '  (troque em "Minha conta" depois de entrar)');
  }

  if (pautas.getLastRow() > 1) {
    const n = pautas.getLastRow() - 1;
    const col = pautas.getRange(2, colunaDe_(CAMPOS_PAUTA, 'status'), n, 1);
    col.setValues(col.getValues().map(v => [normStatus_(v[0])]));
    Logger.log('A aba POSTAGENS já tem dados: nada foi importado, só os status foram atualizados.');
    return;
  }
  importarDetalhamento_(ss);
}

function importarDetalhamento_(ss) {
  const tz = Session.getScriptTimeZone();
  const sistema = { id: '', nome: 'Importação', papel: 'admin', marcas: ['*'] };
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
      if (!marcas[nomeMarca]) marcas[nomeMarca] = { produtos: [], pautas: [], ordem: Object.keys(marcas).length };
      const m = marcas[nomeMarca];
      const produto = String(pega('produto')).trim();
      if (produto && m.produtos.indexOf(produto) < 0) m.produtos.push(produto);
      let data = pega('data');
      data = data instanceof Date ? Utilities.formatDate(data, tz, 'yyyy-MM-dd') : paraISO_(String(data).trim());
      const criativo = String(pega('criativo')).trim();
      m.pautas.push({
        status: normStatus_(pega('status')), data: data, postagem: postagem,
        fase: String(pega('fase')).trim(), formato: String(pega('formato')).trim(), produto: produto,
        pauta: String(pega('pauta')), objetivo: String(pega('objetivo')), cta: String(pega('cta')),
        rede: String(pega('rede')), gravacao: String(pega('gravacao')), observacao: String(pega('observacao')),
        inspiracao: String(pega('inspiracao')), legenda: String(pega('legenda')),
        criativo: /^https?:\/\//.test(criativo) ? criativo : ''
      });
    });
  });

  Object.keys(marcas).forEach(nome => {
    const m = marcas[nome];
    const id = salvarMarca_(sistema, { nome: nome, produtos: m.produtos, fases: FASES_PADRAO, observacoes: observacoesDe_(ss, nome), criado: m.ordem + 1 });
    m.pautas.forEach(p => {
      p.marcaId = id;
      const status = p.status;
      const pid = salvarPauta_(sistema, p);
      if (status !== 'Ideia') {
        const aba = aba_(ABA_PAUTAS, CAMPOS_PAUTA);
        aba.getRange(linhaDoId_(aba, pid), colunaDe_(CAMPOS_PAUTA, 'status')).setValue(status);
      }
      total++;
    });
  });
  Logger.log('Importadas ' + Object.keys(marcas).length + ' marca(s) e ' + total + ' postagem(ns).');
}

function observacoesDe_(ss, nomeMarca) {
  const aba = ss.getSheets().filter(a => a.getName().trim().toLowerCase() === nomeMarca.toLowerCase())[0];
  if (!aba) return '';
  const v = aba.getDataRange().getValues().map(l => String(l[0]).trim());
  const i = v.findIndex(t => /^observa/i.test(t));
  if (i < 0) return '';
  return v.slice(i + 1).filter(t => t.indexOf('•') === 0).join('\n');
}
