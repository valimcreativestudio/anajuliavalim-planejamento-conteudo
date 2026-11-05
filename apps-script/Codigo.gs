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
 *   cliente   — aprovador do cliente: vê as marcas liberadas (só leitura) e aprova ideia e conteúdo depois da equipe
 *   gestor    — vê as marcas liberadas para ele (ou todas), alimenta (inclusive nome, fases e configurações), valida e aprova; não mexe na equipe
 *   social    — vê e alimenta só as marcas liberadas para ele, inclusive nome, fases e configurações
 *   aprovador — vê as marcas liberadas, valida ideias e aprova conteúdos
 *
 * Passo a passo no arquivo LEIAME.md.
 */

// muda a cada atualização; o site avisa quando a implantação está com uma versão diferente
const VERSAO = '2026-11-09.1';
// Endereço oficial do site. Os links dos e-mails SEMPRE usam este endereço (nunca o que vem do pedido).
// A dona da plataforma pode trocar em Gestão → Empresas → Endereço do sistema.
const SITE_PADRAO = 'https://valimcreativestudio.github.io/anajuliavalim-planejamento-conteudo/';
const NOME_APP = 'Planeja Aê';

const ABA_PAUTAS = 'POSTAGENS';
const ABA_MARCAS = 'MARCAS';
const ABA_USUARIOS = 'USUARIOS';
const ABA_TAREFAS = 'TAREFAS';
const ABA_STORIES = 'STORIES';
const ABA_EMPRESAS = 'EMPRESAS';
const CAMPOS_EMPRESA = [['id', 'ID'], ['nome', 'Nome'], ['ativo', 'Ativa'], ['criado', 'Criada em'], ['obs', 'Observação'], ['perfil', 'Perfil e cores'], ['permissoes', 'Quem vê o quê']];
const ABA_AGENDA = 'AGENDA';
const CAMPOS_AGENDA = [
  ['id', 'ID'], ['tipo', 'Tipo'], ['status', 'Status'], ['titulo', 'Assunto'], ['data', 'Dia'], ['hora', 'Horário'], ['duracao', 'Duração (min)'],
  ['participantes', 'Participantes (IDs)'], ['local', 'Local ou link'], ['descricao', 'Pauta / detalhes'], ['respostas', 'Respostas'], ['motivo', 'Motivo'],
  ['cor', 'Cor'], ['marcaId', 'Marca ID'], ['criadoPorId', 'Criado por ID'], ['criadoPor', 'Criado por'], ['criado', 'Criado em'], ['atualizado', 'Atualizado em'], ['decididoPor', 'Decidido por'], ['ata', 'Ata da reunião'], ['ataPor', 'Ata escrita por'], ['gcal', 'Evento no Google Agenda'], ['meet', 'Criar Meet'], ['empresaId', 'Empresa ID']
];
const ABA_HORAS = 'HORAS';
const CAMPOS_HORA = [['id', 'ID'], ['uid', 'Pessoa ID'], ['nome', 'Pessoa'], ['marcaId', 'Marca ID'], ['marca', 'Marca'], ['data', 'Dia'], ['minutos', 'Minutos'], ['descricao', 'O que fez'], ['criado', 'Criado em'], ['empresaId', 'Empresa ID']];
const ABA_LIXEIRA = 'LIXEIRA';
const CAMPOS_LIXEIRA = [['id', 'ID'], ['tipo', 'Tipo'], ['itemId', 'ID do item'], ['marcaId', 'Marca ID'], ['titulo', 'Título'], ['dados', 'Dados'], ['por', 'Apagado por'], ['em', 'Apagado em']];
const ABA_AVALIACOES = 'AVALIACOES';
const CAMPOS_AVALIACAO = [['id', 'ID'], ['marcaId', 'Marca ID'], ['marca', 'Marca'], ['mes', 'Mês'], ['uid', 'Cliente ID'], ['nome', 'Cliente'], ['nota', 'Nota'], ['comentario', 'Comentário'], ['em', 'Respondido em']];
const ABA_PAGAMENTOS = 'PAGAMENTOS';
const CAMPOS_PAGAMENTO = [['id', 'ID'], ['marcaId', 'Marca ID'], ['marca', 'Marca'], ['mes', 'Mês'], ['valor', 'Valor'], ['pagoEm', 'Pago em'], ['por', 'Registrado por'], ['obs', 'Observação'], ['criado', 'Criado em']];
const ABA_PROPOSTAS = 'PROPOSTAS';
const CAMPOS_PROPOSTA = [['id', 'ID'], ['cliente', 'Cliente'], ['status', 'Status'], ['dados', 'Dados'], ['chave', 'Chave do link'], ['marcaId', 'Marca criada'], ['por', 'Criada por'], ['uid', 'Criada por ID'], ['criado', 'Criada em'], ['respondido', 'Respondida em'], ['empresaId', 'Empresa ID']];
const ABA_AUDITORIA = 'REGISTRO';
const CAMPOS_AUDITORIA = [['id', 'ID'], ['empresaId', 'Empresa ID'], ['em', 'Quando'], ['uid', 'Pessoa ID'], ['nome', 'Pessoa'], ['acao', 'O que fez'], ['alvo', 'Em quê'], ['detalhe', 'Detalhe']];
const ABA_MURAL = 'MURAL';
const CAMPOS_AVISO = [['id', 'ID'], ['titulo', 'Título'], ['texto', 'Recado'], ['importante', 'Importante'], ['fixado', 'Fixado'], ['ate', 'Mostrar até'], ['por', 'Por'], ['uid', 'Por ID'], ['criado', 'Criado em'], ['lidos', 'Quem leu'], ['empresaId', 'Empresa ID']];
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
  ['capa', 'Imagem de prévia'], ['midias', 'Mídias da publicação'],
  ['comentarios', 'Comentários'], ['prazoArte', 'Prazo da arte'], ['prazoAprovacao', 'Prazo da aprovação'],
  ['autoPub', 'Publicar automático'], ['pubInfo', 'Situação da publicação automática'], ['igMidia', 'ID do post no Instagram'], ['versoes', 'Versões anteriores da arte'], ['canva', 'Link do design no Canva']
];
const CAMPOS_STORY = [
  ['id', 'ID'], ['marcaId', 'Marca ID'], ['marca', 'Marca'], ['data', 'Data'], ['hora', 'Hora'], ['ordem', 'Ordem'],
  ['tipo', 'Tipo'], ['titulo', 'Título'], ['texto', 'Texto na tela'], ['roteiro', 'Roteiro / fala'],
  ['sticker', 'Figurinha'], ['stickerTexto', 'Texto da figurinha'], ['link', 'Link'], ['midia', 'Arquivo (Drive)'],
  ['cor', 'Cor de fundo'], ['status', 'Status'], ['obs', 'Observação'], ['criadoPor', 'Criado por'],
  ['criado', 'Criado em'], ['atualizado', 'Atualizado em'], ['autoPub', 'Publicar automático'], ['pubInfo', 'Situação da publicação automática']
];
const STATUS_STORY = ['Planejado', 'Produzido', 'Aprovado', 'Postado'];
const CAMPOS_MARCA = [
  ['id', 'ID'], ['nome', 'Nome'], ['produtos', 'Produtos'], ['fases', 'Fases'],
  ['observacoes', 'Observações'], ['criado', 'Criado em'],
  ['perfil', 'Perfil (sobre, público, observações)'], ['arquivos', 'Arquivos'], ['empresaId', 'Empresa ID']
];
const CAMPOS_TAREFA = [
  ['id', 'ID'], ['marcaId', 'Marca ID'], ['marca', 'Marca'], ['titulo', 'O que fazer'], ['descricao', 'Detalhes'],
  ['prioridade', 'Prioridade'], ['data', 'Data'], ['prazo', 'Prazo máximo'], ['responsavelId', 'Responsável ID'],
  ['responsavel', 'Responsável'], ['status', 'Status'], ['criadoPorId', 'Criado por ID'], ['criadoPor', 'Criado por'],
  ['criado', 'Criado em'], ['concluidoPor', 'Concluída por'], ['concluidoEm', 'Concluída em'], ['atualizado', 'Atualizado em'], ['empresaId', 'Empresa ID']
];
const PRIORIDADES = ['Urgente', 'Alta', 'Média', 'Baixa'];
const CAMPOS_USUARIO = [
  ['id', 'ID'], ['nome', 'Nome'], ['login', 'Login (e-mail)'], ['papel', 'Papel'],
  ['marcas', 'Marcas liberadas (IDs)'], ['ativo', 'Ativo'], ['hash', 'Senha (protegida)'],
  ['sal', 'Sal'], ['criado', 'Criado em'], ['whatsapp', 'WhatsApp'], ['ultimoAcesso', 'Último acesso'], ['notificar', 'Notificações por e-mail'], ['visual', 'Visualização'], ['foto', 'Foto de perfil (arquivo no Drive)'], ['cores', 'Cores escolhidas'], ['aniversario', 'Aniversário (dd/mm)'], ['empresaId', 'Empresa ID'], ['dono', 'Dono da plataforma']
];
const PAPEIS = ['admin', 'diretor', 'gestor', 'social', 'aprovador', 'cliente'];
const VEEM_TODAS = ['admin', 'diretor', 'gestor']; // chefia: veem a equipe e as tarefas
const TODAS_MARCAS = ['admin', 'diretor'];         // veem todas as marcas sempre; o gestor vê as liberadas

const STATUS = ['Ideia', 'Em validação', 'Validação do cliente', 'Ideia reprovada', 'Em produção', 'Em aprovação', 'Aprovação do cliente', 'Ajustes solicitados', 'Aprovado', 'Agendado', 'Postado'];
const STATUS_ANTIGOS = { 'Validado': 'Em produção', 'Produzido': 'Em aprovação' };

// quem: 'editar' = admin ou social da marca; 'aprovar' = admin ou aprovador da marca; 'cliente' = aprovador do cliente (ou a gestão, pelo cliente)
// paraCliente: se a marca tem aprovador do cliente, a postagem vai para ele em vez de seguir direto
const ACOES = {
  enviarValidacao: { de: ['Ideia', 'Ideia reprovada'], para: 'Em validação', quem: 'editar', texto: 'Enviou a ideia para validação' },
  validar: { de: ['Em validação'], para: 'Em produção', paraCliente: 'Validação do cliente', quem: 'aprovar', texto: 'Validou a ideia' },
  reprovarIdeia: { de: ['Em validação'], para: 'Ideia reprovada', quem: 'aprovar', motivo: true, texto: 'Reprovou a ideia' },
  clienteValidar: { de: ['Validação do cliente'], para: 'Em produção', quem: 'cliente', texto: 'Validou a ideia (cliente)' },
  clienteReprovar: { de: ['Validação do cliente'], para: 'Ideia reprovada', quem: 'cliente', motivo: true, texto: 'Reprovou a ideia (cliente)' },
  enviarAprovacao: { de: ['Em produção', 'Ajustes solicitados'], para: 'Em aprovação', quem: 'editar', texto: 'Enviou o conteúdo para aprovação' },
  aprovar: { de: ['Em aprovação'], para: 'Aprovado', paraCliente: 'Aprovação do cliente', quem: 'aprovar', texto: 'Aprovou o conteúdo' },
  pedirAjustes: { de: ['Em aprovação'], para: 'Ajustes solicitados', quem: 'aprovar', motivo: true, texto: 'Pediu ajustes no conteúdo' },
  clienteAprovar: { de: ['Aprovação do cliente'], para: 'Aprovado', quem: 'cliente', texto: 'Aprovou o conteúdo (cliente)' },
  clienteAjustes: { de: ['Aprovação do cliente'], para: 'Ajustes solicitados', quem: 'cliente', motivo: true, texto: 'Pediu ajustes no conteúdo (cliente)' },
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
    if (req.action === 'entrarComLink') return json_(Object.assign({ ok: true }, entrarComLink_(req.chave)));
    if (req.action === 'esqueciSenha') return json_(Object.assign({ ok: true }, esqueciSenha_(req.login, req.site)));
    if (req.action === 'redefinirSenha') { const lk = LockService.getScriptLock(); lk.waitLock(20000); try { return json_(Object.assign({ ok: true }, redefinirSenha_(req.chave, req.nova))); } finally { lk.releaseLock(); } }
    if (req.action === 'propostaVer') return json_(Object.assign({ ok: true }, propostaVer_(req.chave)));
    if (req.action === 'propostaAceitar') { const lk = LockService.getScriptLock(); lk.waitLock(20000); try { return json_(Object.assign({ ok: true }, propostaAceitar_(req.chave, req.nome, req.site))); } finally { lk.releaseLock(); } }
    if (req.action === 'briefingVer') return json_(Object.assign({ ok: true }, briefingVer_(req.chave)));
    if (req.action === 'briefingArquivo') return json_(Object.assign({ ok: true }, briefingArquivo_(req.chave, req)));
    if (req.action === 'briefingEnviar') { const lk = LockService.getScriptLock(); lk.waitLock(20000); try { return json_(Object.assign({ ok: true }, briefingEnviar_(req.chave, req.dados || {}, req.site))); } finally { lk.releaseLock(); } }
    const eu = usuarioDoToken_(req.token);
    if (!eu) return json_({ ok: false, code: 'sessao', error: 'Sua sessão expirou. Entre de novo.' });
    // dona da plataforma: olha a empresa escolhida no topo (vazio = todas)
    if (eu.dono) { const emps = empresas_(); eu.empresaId = req.empresa === '' ? '' : emps.some(e => e.id === req.empresa) ? req.empresa : (emps[0] ? emps[0].id : ''); }

    // envio de arquivo vai para o Drive, fora da trava da planilha
    if (req.action === 'logoEmpresa') return json_(Object.assign({ ok: true }, logoEmpresa_(eu, req)));
    if (req.action === 'enviarArquivo') return json_(Object.assign({ ok: true }, enviarArquivo_(eu, req)));
    // Instagram: chamadas externas, também fora da trava
    if (req.action === 'instaConectar') return json_(Object.assign({ ok: true }, instaConectar_(eu, req.marcaId, req.chave)));
    if (req.action === 'instaDesconectar') return json_(Object.assign({ ok: true }, instaDesconectar_(eu, req.marcaId)));
    if (req.action === 'instaMidias') return json_(Object.assign({ ok: true }, instaMidias_(eu, req.marcaId, req.forcar)));
    if (req.action === 'lerPasta') return json_(Object.assign({ ok: true }, lerPasta_(eu, req.link)));
    if (req.action === 'ia') return json_(Object.assign({ ok: true }, ia_(eu, req.tarefa, req.marcaId, req.dados || {})));
    if (req.action === 'lerConteudo') return json_(Object.assign({ ok: true }, lerConteudo_(eu, req.link)));
    if (req.action === 'trends') return json_(Object.assign({ ok: true }, lerTrends_(eu)));
    if (req.action === 'metricas') return json_(Object.assign({ ok: true }, metricas_(eu, req.marcaId, req.mes, req.forcar)));
    if (req.action === 'melhorHorario') return json_(Object.assign({ ok: true }, melhorHorario_(eu, req.marcaId, req.forcar)));
    if (req.action === 'enviarRelatorio') return json_(Object.assign({ ok: true }, enviarRelatorio_(eu, req.marcaId, req.mes, req.site)));
    if (req.action === 'publicarAgora') return json_(Object.assign({ ok: true }, publicarAgora_(eu, req.id, req.tipo)));
    if (TELA_DA_ACAO[req.action] && ['acessosListar', 'acessosSalvar', 'trends'].indexOf(req.action) >= 0) exigeTela_(eu, TELA_DA_ACAO[req.action]);
    if (req.action === 'acessosListar') return json_(Object.assign({ ok: true }, acessosListar_(eu, req.marcaId)));
    if (req.action === 'acessosSalvar') return json_(Object.assign({ ok: true }, acessosSalvar_(eu, req.marcaId, req.acessos)));

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const antes = antesDoRegistro_(eu, req);
      const saida = rodarAcao_(eu, req);
      try { if (antes && JSON.parse(saida.getContent()).ok) auditar_(eu, antes[0], antes[1], antes[2], antes[3]); } catch (e) { Logger.log('Registro: ' + e); }
      return saida;
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_(erroParaSite_(err));
  }
}
// só as mensagens escritas pelo sistema chegam ao usuário; erros internos ficam no registro de execução
function erroParaSite_(err) {
  if (err && err.code) return { ok: false, code: err.code, error: String(err.message || '') };
  Logger.log('Erro interno: ' + (err && err.stack || err));
  return { ok: false, code: 'server', error: 'Algo deu errado do nosso lado. Tente de novo em instantes.' };
}

const TELA_DA_ACAO = {
  salvarStory: 'stories', excluirStory: 'stories', ordenarStories: 'stories',
  salvarEvento: 'agenda', responderEvento: 'agenda', excluirEvento: 'agenda', salvarAta: 'agenda', horariosLivres: 'agenda',
  salvarTarefa: 'tarefas', concluirTarefa: 'tarefas', excluirTarefa: 'tarefas',
  salvarHora: 'horas', excluirHora: 'horas', salvarAviso: 'mural', excluirAviso: 'mural', lerAviso: 'mural',
  salvarUsuario: 'equipe', pagamento: 'financeiro', salvarProposta: 'financeiro', excluirProposta: 'financeiro',
  auditoria: 'registro', perfilEmpresa: 'empresa', exportar: 'empresa', acessosListar: 'marca-acessos', acessosSalvar: 'marca-acessos',
  trends: 'ideias', trendsConfig: 'ideias'
};
function rodarAcao_(eu, req) {
      if (TELA_DA_ACAO[req.action]) exigeTela_(eu, TELA_DA_ACAO[req.action]);
      switch (req.action) {
        case 'listar': guardarSite_(req.site); return json_(listar_(eu, req.desde, req.se));
        case 'comentar': return json_(Object.assign({ ok: true }, comentar_(eu, req.id, req.texto, req.arte)));
        case 'apagarComentario': apagarComentario_(eu, req.id, req.cid); return json_({ ok: true });
        case 'repetirPauta': return json_({ ok: true, ids: repetirPauta_(eu, req.id, req.intervalo, req.vezes) });
        case 'salvarStory': return json_({ ok: true, id: salvarStory_(eu, req.story || {}) });
        case 'excluirStory': excluirStory_(eu, req.id); return json_({ ok: true });
        case 'ordenarStories': ordenarStories_(eu, req.ids || []); return json_({ ok: true });
        case 'linkCliente': return json_(Object.assign({ ok: true }, linkCliente_(eu, req.usuarioId, req.site, req.enviar)));
        case 'acaoLote': return json_(Object.assign({ ok: true }, acaoLote_(eu, req.ids || [], req.acao, req.site)));
        case 'autoPub': autoPubDefinir_(eu, req.id, req.tipo, req.ligar); return json_({ ok: true });
        case 'salvarPauta': return json_({ ok: true, id: salvarPauta_(eu, req.pauta || {}) });
        case 'excluirPauta': excluirPauta_(eu, req.id); return json_({ ok: true });
        case 'acao': acaoPauta_(eu, req.id, req.acao, req.motivo, req.status, req.dados || {}, req.site); return json_({ ok: true });
        case 'salvarMarca': return json_({ ok: true, id: salvarMarca_(eu, req.marca || {}) });
        case 'excluirMarca': soAdmin_(eu); if (!acesso_(eu, req.id)) throw erro_('permissao', 'Sem acesso a esta marca.'); excluirMarca_(req.id); return json_({ ok: true });
        case 'salvarUsuario': gerencia_(eu); return json_({ ok: true, id: salvarUsuario_(eu, req.usuario || {}) });
        case 'trocarSenha': eu.token = req.token; trocarSenha_(eu, req.atual, req.nova); return json_({ ok: true });
        case 'salvarTarefa': return json_({ ok: true, id: salvarTarefa_(eu, req.tarefa || {}, req.site) });
        case 'concluirTarefa': concluirTarefa_(eu, req.id, req.feita !== false); return json_({ ok: true });
        case 'excluirTarefa': excluirTarefa_(eu, req.id); return json_({ ok: true });
        case 'meuNome': salvarMeuNome_(eu, req.nome); return json_({ ok: true });
        case 'minhaFoto': return json_(Object.assign({ ok: true }, salvarMinhaFoto_(eu, req.base64, req.remover)));
        case 'minhaVisualizacao': salvarPreferencia_(eu, 'visual', req.visual === 'instagram' ? 'instagram' : 'detalhada'); return json_({ ok: true });
        case 'minhasCores': salvarPreferencia_(eu, 'cores', JSON.stringify(limparCores_(req.cores))); return json_({ ok: true });
        case 'salvarEvento': return json_({ ok: true, id: salvarEvento_(eu, req.evento || {}, req.site) });
        case 'responderEvento': responderEvento_(eu, req.id, req.resposta, req.motivo, req.dados || {}, req.site); return json_({ ok: true });
        case 'salvarAta': salvarAta_(eu, req.id, req.ata, req.tarefas || [], req.enviar, req.site); return json_({ ok: true });
        case 'horariosLivres': return json_(Object.assign({ ok: true }, horariosLivres_(eu, req.ids || [], req.data)));
        case 'salvarHora': return json_({ ok: true, id: salvarHora_(eu, req.hora || {}) });
        case 'excluirHora': excluirHora_(eu, req.id); return json_({ ok: true });
        case 'salvarAviso': return json_({ ok: true, id: salvarAviso_(eu, req.aviso || {}, req.site) });
        case 'excluirAviso': excluirAviso_(eu, req.id); return json_({ ok: true });
        case 'lerAviso': lerAviso_(eu, req.ids || []); return json_({ ok: true });
        case 'meuAniversario': salvarPreferencia_(eu, 'aniversario', /^\d{2}\/\d{2}$/.test(req.aniversario || '') ? req.aniversario : ''); return json_({ ok: true });
        case 'iaConfig': soAdmin_(eu); if (!eu.empresaId) throw erro_('server', 'Escolha a empresa no topo.'); if (req.chave === '') PropertiesService.getScriptProperties().deleteProperty('ANTHROPIC_KEY_' + eu.empresaId); else if (req.chave) PropertiesService.getScriptProperties().setProperty('ANTHROPIC_KEY_' + eu.empresaId, String(req.chave).trim()); if ('gcal' in req) PropertiesService.getScriptProperties().setProperty('gcal_' + eu.empresaId, req.gcal ? 'sim' : ''); mexeu_(); return json_({ ok: true });
        case 'salvarProposta': return json_(Object.assign({ ok: true }, salvarProposta_(eu, req.proposta || {}, req.site)));
        case 'excluirProposta': excluirProposta_(eu, req.id); return json_({ ok: true });
        case 'perfilEmpresa': salvarPerfilEmpresa_(eu, req.perfil, req.permissoes, req.nome); return json_({ ok: true });
        case 'definirSite': if (!eu.dono) throw erro_('permissao', 'Só a dona da plataforma muda o endereço.'); if (!/^https:\/\/[^\s#?]+\/$/.test(String(req.url || ''))) throw erro_('server', 'Use o endereço completo, começando com https:// e terminando com /'); PropertiesService.getScriptProperties().setProperty('SITE_URL', req.url); return json_({ ok: true });
        case 'salvarEmpresa': return json_(Object.assign({ ok: true }, salvarEmpresa_(eu, req.empresaDados || {})));
        case 'copiarMes': return json_({ ok: true, n: copiarMes_(eu, req.marcaId, req.de, req.para) });
        case 'importarPostagens': return json_({ ok: true, ids: importarPostagens_(eu, req.marcaId, req.posts || []) });
        case 'lixeira': return json_({ ok: true, itens: lixeira_(eu) });
        case 'restaurar': restaurar_(eu, req.id); return json_({ ok: true });
        case 'briefingLink': return json_(Object.assign({ ok: true }, briefingLink_(eu, req.marcaId, req.site)));
        case 'avaliar': avaliar_(eu, req.marcaId, req.mes, req.nota, req.comentario); return json_({ ok: true });
        case 'pagamento': pagamento_(eu, req.marcaId, req.mes, req.pago, req.valor, req.obs); return json_({ ok: true });
        case 'trendsConfig': gerencia_(eu); if (!eu.empresaId) throw erro_('server', 'Escolha a empresa no topo.'); PropertiesService.getScriptProperties().setProperty('trends_' + eu.empresaId, String(req.link || '').trim()); CacheService.getScriptCache().remove('trends_' + eu.empresaId); return json_({ ok: true });
        case 'excluirEvento': excluirEvento_(eu, req.id, req.site); return json_({ ok: true });
        case 'minhasNotificacoes': salvarPreferencia_(eu, 'notificar', req.notificar === false ? 'não' : 'sim'); return json_({ ok: true });
        case 'sair': PropertiesService.getScriptProperties().deleteProperty('tok_' + req.token); return json_({ ok: true });
        case 'auditoria': return json_({ ok: true, itens: listarAuditoria_(eu) });
        case 'exportar': return json_(Object.assign({ ok: true }, exportar_(eu)));
        default: return json_({ ok: false, error: 'Ação desconhecida: ' + req.action });
      }
}

/* ---------- Login e permissões ---------- */

const MAX_TENTATIVAS = 5, BLOQUEIO_MIN = 15;
function login_(login, senha) {
  const lg = normLogin_(login), cache = CacheService.getScriptCache(), kf = 'lgf_' + lg;
  // bloqueio depois de 5 erros seguidos (vale 15 minutos), e um teto geral contra ataques em massa
  const falhas = Number(cache.get(kf) || 0);
  if (falhas >= MAX_TENTATIVAS) { Utilities.sleep(500); throw erro_('login', 'Muitas tentativas erradas. Espere ' + BLOQUEIO_MIN + ' minutos e tente de novo, ou use "Esqueci minha senha".'); }
  const kg = 'lgg_' + Math.floor(Date.now() / 600000), geral = Number(cache.get(kg) || 0);
  if (geral > 300) { Utilities.sleep(500); throw erro_('login', 'O sistema recebeu tentativas demais agora. Tente de novo em alguns minutos.'); }
  const u = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(x => x.login === lg)[0];
  const ok = u && u.ativo === 'sim' && conferirSenha_(senha, u) && empresaAtiva_(u);
  if (!ok) {
    cache.put(kf, String(falhas + 1), BLOQUEIO_MIN * 60);
    cache.put(kg, String(geral + 1), 900);
    if (u && u.ativo === 'sim') {
      try { auditar_(publicoUsuario_(u), falhas + 1 >= MAX_TENTATIVAS ? 'Conta bloqueada por 15 min (senha errada várias vezes)' : 'Tentou entrar com a senha errada', '', '', u.empresaId); } catch (e) {}
      if (falhas + 1 === MAX_TENTATIVAS) avisarBloqueio_(u);
    }
    Utilities.sleep(800);
    throw erro_('login', 'Login ou senha incorretos.');
  }
  cache.remove(kf);
  // senhas antigas (hash simples) viram o hash forte no primeiro login
  if (String(u.hash).indexOf('p2$') !== 0) { u.sal = Utilities.getUuid(); u.hash = hash_(senha, u.sal); gravar_(ABA_USUARIOS, CAMPOS_USUARIO, u); }
  const props = PropertiesService.getScriptProperties();
  const agora = Date.now();
  // limpa sessões vencidas
  const todas = props.getProperties();
  Object.keys(todas).forEach(k => {
    if (k.indexOf('tok_') === 0) {
      try { if (JSON.parse(todas[k]).exp < agora) props.deleteProperty(k); } catch (e) { props.deleteProperty(k); }
    }
  });
  try { auditar_(publicoUsuario_(u), 'Entrou no sistema', '', '', u.empresaId); } catch (e) {}
  return { ok: true, token: criarSessao_(u.id, DIAS_DE_SESSAO) };
}

function usuarioDoToken_(token) {
  if (!token) return null;
  const raw = PropertiesService.getScriptProperties().getProperty('tok_' + token);
  if (!raw) return null;
  let s;
  try { s = JSON.parse(raw); } catch (e) { return null; }
  if (s.exp < Date.now()) return null;
  const u = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(x => x.id === s.uid)[0];
  if (!u || u.ativo !== 'sim' || !empresaAtiva_(u)) return null;
  return publicoUsuario_(u);
}

function publicoUsuario_(u) {
  return {
    id: u.id, nome: u.nome, login: u.login, papel: u.papel, ativo: u.ativo === 'sim', whatsapp: u.whatsapp || '',
    ultimoAcesso: Number(u.ultimoAcesso) || 0,
    notificar: u.notificar !== 'não',
    foto: u.foto || '',
    cores: parseJSON_(u.cores, {}),
    aniversario: /^\d{2}\/\d{2}$/.test(u.aniversario || '') ? u.aniversario : '',
    empresaId: u.empresaId || '', dono: u.dono === 'sim',
    visual: u.visual === 'instagram' || u.visual === 'detalhada' ? u.visual : (u.papel === 'cliente' ? 'instagram' : 'detalhada'),
    marcas: String(u.marcas || '').split(',').map(s => s.trim()).filter(String)
  };
}

function acesso_(eu, marcaId) {
  if (!mesmaEmp_(eu, empresaDe_(marcaId))) return false;
  return TODAS_MARCAS.indexOf(eu.papel) >= 0 || eu.marcas.indexOf('*') >= 0 || eu.marcas.indexOf(marcaId) >= 0;
}
function podeEditar_(eu, marcaId) {
  if (!mesmaEmp_(eu, empresaDe_(marcaId))) return false;
  return TODAS_MARCAS.indexOf(eu.papel) >= 0 || ((eu.papel === 'social' || eu.papel === 'gestor') && acesso_(eu, marcaId));
}
function podeCliente_(eu, marcaId) {
  if (!mesmaEmp_(eu, empresaDe_(marcaId))) return false;
  return TODAS_MARCAS.indexOf(eu.papel) >= 0 || ((eu.papel === 'cliente' || eu.papel === 'gestor') && acesso_(eu, marcaId));
}
// a marca tem aprovador do cliente ativo?
function marcaTemCliente_(marcaId, pessoas) {
  return (pessoas || ler_(ABA_USUARIOS, CAMPOS_USUARIO)).some(u => u.ativo === 'sim' && u.papel === 'cliente' && acesso_(publicoUsuario_(u), marcaId));
}
function podeAprovar_(eu, marcaId) {
  if (!mesmaEmp_(eu, empresaDe_(marcaId))) return false;
  return TODAS_MARCAS.indexOf(eu.papel) >= 0 || ((eu.papel === 'aprovador' || eu.papel === 'gestor') && acesso_(eu, marcaId));
}
function gerencia_(eu) {
  if (eu.papel !== 'admin' && eu.papel !== 'diretor') throw erro_('permissao', 'Só o administrador ou o diretor pode fazer isso.');
}
function soAdmin_(eu) {
  if (eu.papel !== 'admin') throw erro_('permissao', 'Só o administrador pode fazer isso.');
}
// conta usos numa janela de tempo (CacheService) e barra quando passa do limite
function limite_(chave, max, segundos, msg) {
  const c = CacheService.getScriptCache(), k = 'lim_' + chave, n = Number(c.get(k) || 0);
  if (n >= max) throw erro_('server', msg || 'Muitos pedidos seguidos. Tente de novo mais tarde.');
  c.put(k, String(n + 1), segundos);
}
function erro_(code, msg) {
  const e = new Error(msg); e.code = code; return e;
}

/* ---------- Leitura ---------- */

function listar_(eu, desde, se) {
  // nada mudou desde a última leitura deste usuário: responde curto (o site só confere a cada 30 s)
  const carimbo = carimbo_() + '|' + eu.id + '|' + (desde || '');
  if (se && se === carimbo) { registrarAcesso_(eu); return { ok: true, igual: true, versao: VERSAO }; }
  const corte = /^\d{4}-\d{2}$/.test(desde || '') ? desde + '-01' : '';
  const noPeriodo = d => !corte || !d || paraISO_(d) >= corte;
  const pessoasCache = ler_(ABA_USUARIOS, CAMPOS_USUARIO);
  const marcas = ler_(ABA_MARCAS, CAMPOS_MARCA).filter(m => acesso_(eu, m.id)).map(m => ({
    id: m.id,
    nome: m.nome,
    produtos: String(m.produtos || '').split('\n').map(s => s.trim()).filter(String),
    fases: parseFases_(m.fases),
    observacoes: m.observacoes || '',
    criado: Number(m.criado) || 0,
    perfil: parseJSON_(m.perfil, {}),
    arquivos: parseJSON_(m.arquivos, []),
    insta: instaStatus_(m.id),
    temCliente: marcaTemCliente_(m.id, pessoasCache)
  }));
  const pautas = ler_(ABA_PAUTAS, CAMPOS_PAUTA).filter(p => acesso_(eu, p.marcaId) && noPeriodo(p.data)).map(pautaParaSite_);
  registrarAcesso_(eu);
  const r = { ok: true, versao: VERSAO, carimbo: carimbo, eu: eu, marcas: marcas, pautas: pautas };
  r.horas = ler_(ABA_HORAS, CAMPOS_HORA).filter(h => veHora_(eu, h) && noPeriodo(h.data)).map(h => Object.assign(h, { data: paraISO_(h.data), minutos: Number(h.minutos) || 0, criado: Number(h.criado) || 0 }));
  r.avaliacoes = ler_(ABA_AVALIACOES, CAMPOS_AVALIACAO).filter(a => eu.papel === 'cliente' ? a.uid === eu.id : (VEEM_TODAS.indexOf(eu.papel) >= 0 && acesso_(eu, a.marcaId))).map(a => Object.assign(a, { nota: Number(a.nota), em: Number(a.em) || 0 }));
  r.pagamentos = TODAS_MARCAS.indexOf(eu.papel) >= 0 ? ler_(ABA_PAGAMENTOS, CAMPOS_PAGAMENTO).filter(x => acesso_(eu, x.marcaId)).map(x => Object.assign(x, { valor: Number(x.valor) || 0, pagoEm: paraISO_(x.pagoEm), criado: Number(x.criado) || 0 })) : [];
  const pp = PropertiesService.getScriptProperties();
  r.temTrends = !!pp.getProperty('trends_' + eu.empresaId);
  r.temIA = eu.papel !== 'cliente' && !!pp.getProperty('ANTHROPIC_KEY_' + eu.empresaId);
  r.gcal = pp.getProperty('gcal_' + eu.empresaId) === 'sim';
  r.propostas = TODAS_MARCAS.indexOf(eu.papel) >= 0 ? ler_(ABA_PROPOSTAS, CAMPOS_PROPOSTA).filter(x => mesmaEmp_(eu, x.empresaId)).map(x => ({ id: x.id, cliente: x.cliente, status: x.status, dados: parseJSON_(x.dados, {}), chave: x.chave, marcaId: x.marcaId, por: x.por, criado: Number(x.criado) || 0, respondido: Number(x.respondido) || 0 })) : [];
  r.mural = eu.papel === 'cliente' || !podeTela_(eu, 'mural') ? [] : ler_(ABA_MURAL, CAMPOS_AVISO).filter(a => mesmaEmp_(eu, a.empresaId)).map(avisoParaSite_).filter(a => !a.ate || a.ate >= Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') || a.fixado);
  r.agenda = ler_(ABA_AGENDA, CAMPOS_AGENDA).filter(x => veEvento_(eu, x) && noPeriodo(x.data)).map(eventoParaSite_);
  r.stories = ler_(ABA_STORIES, CAMPOS_STORY).filter(x => acesso_(eu, x.marcaId) && noPeriodo(x.data)).map(storyParaSite_);
  r.tarefas = ler_(ABA_TAREFAS, CAMPOS_TAREFA).filter(t => veTarefa_(eu, t)).map(tarefaParaSite_);
  if (!podeTela_(eu, 'agenda')) r.agenda = [];
  if (!podeTela_(eu, 'stories')) r.stories = [];
  if (!podeTela_(eu, 'horas')) r.horas = [];
  if (!podeTela_(eu, 'tarefas')) r.tarefas = [];
  if (!podeTela_(eu, 'financeiro')) { r.pagamentos = []; r.propostas = []; }
  // nomes da equipe (sem dados sensíveis) para escolher o responsável de uma tarefa
  r.equipe = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(u => u.ativo === 'sim' && mesmaEmp_(eu, u.empresaId)).map(u => Object.assign({ id: u.id, nome: u.nome, papel: u.papel, foto: u.foto || '', aniversario: /^\d{2}\/\d{2}$/.test(u.aniversario || '') ? u.aniversario : '' }, u.papel === 'cliente' ? { marcas: publicoUsuario_(u).marcas, temEmail: /@/.test(u.login), whatsapp: u.whatsapp || '' } : {}));
  // o cliente só vê nome, papel e foto da equipe (e a si mesmo); nunca os outros clientes
  if (eu.papel === 'cliente') r.equipe = r.equipe.filter(u => u.papel !== 'cliente' || u.id === eu.id).map(u => ({ id: u.id, nome: u.nome, papel: u.papel, foto: u.foto }));
  if (VEEM_TODAS.indexOf(eu.papel) >= 0 && (podeTela_(eu, 'equipe') || podeTela_(eu, 'equipe-atividade'))) r.usuarios = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(u => mesmaEmp_(eu, u.empresaId)).map(publicoUsuario_);
  if (eu.dono) { r.empresas = empresas_(); r.siteOficial = site_(); }
  r.empresa = eu.empresaId ? (empresas_().filter(e => e.id === eu.empresaId)[0] || null) : null;
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
  p.midias = parseJSON_(p.midias, []);
  p.comentarios = parseJSON_(p.comentarios, []);
  p.versoes = parseJSON_(p.versoes, []);
  p.prazoArte = paraISO_(p.prazoArte);
  p.prazoAprovacao = paraISO_(p.prazoAprovacao);
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
  const PROTEGIDOS = ['id', 'marcaId', 'status', 'motivo', 'historico', 'agTipo', 'agQuando', 'agData', 'agHora', 'postLink', 'criado', 'atualizado', 'comentarios', 'autoPub', 'pubInfo', 'igMidia', 'versoes'];
  const base = atual ? Object.assign({}, atual, { agQuando: atual.agData ? paraBR_(atual.agData) + ' ' + atual.agHora : '', comentarios: JSON.stringify(atual.comentarios || []), versoes: JSON.stringify(atual.versoes || []) }) : {};
  const novos = {};
  Object.keys(p).forEach(k => { if (PROTEGIDOS.indexOf(k) < 0) novos[k] = p[k]; });
  ['criativo', 'capa', 'canva'].forEach(k => { if (k in novos) novos[k] = urlSegura_(novos[k]); });
  if (Array.isArray(novos.midias)) novos.midias = novos.midias.filter(x => x && idSeguro_(x.id));
  if (Array.isArray(novos.midias)) novos.midias = JSON.stringify(novos.midias.slice(0, 20).map(x => ({ id: String(x.id || ''), nome: String(x.nome || '').slice(0, 120), tipo: x.tipo === 'video' ? 'video' : 'imagem' })));
  if (atual && Array.isArray(base.midias)) base.midias = JSON.stringify(base.midias);
  const dataNova = 'data' in novos ? novos.data : ((atual && atual.data) || '');
  // guarda a versão anterior da arte quando ela muda depois de pronta (para comparar antes e depois do ajuste)
  if (atual && ['Ideia', 'Em validação', 'Validação do cliente', 'Ideia reprovada'].indexOf(atual.status) < 0) {
    const sig = (mid, capa, leg) => JSON.stringify([(mid || []).map(x => x.id), capa || '', String(leg || '').trim()]);
    const midNovas = Array.isArray(p.midias) ? p.midias : atual.midias;
    const antes = sig(atual.midias, atual.capa, atual.legenda);
    const depois = sig(midNovas, 'capa' in p ? p.capa : atual.capa, 'legenda' in p ? p.legenda : atual.legenda);
    const temArte = (atual.midias || []).length || atual.capa;
    const mudouArte = sig(atual.midias, atual.capa, '') !== sig(midNovas, 'capa' in p ? p.capa : atual.capa, '');
    if (antes !== depois && temArte && mudouArte) {
      const v = (atual.versoes || []).concat([{ em: Number(atual.atualizado) || Date.now(), status: atual.status, midias: atual.midias || [], capa: atual.capa || '', legenda: String(atual.legenda || '').slice(0, 3000) }]).slice(-10);
      base.versoes = JSON.stringify(v);
    }
  }
  ['prazoArte', 'prazoAprovacao'].forEach(k => { if (k in novos) novos[k] = paraBR_(novos[k]); else if (atual) base[k] = paraBR_(atual[k]); });
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
  paraLixeira_(eu, 'postagem', ler_(ABA_PAUTAS, CAMPOS_PAUTA).filter(x => x.id === String(id))[0], atual.postagem);
  excluirLinha_(ABA_PAUTAS, CAMPOS_PAUTA, id);
}

function acaoPauta_(eu, id, acao, motivo, status, dados, site, coletor) {
  const p = pautaPorId_(id);
  if (!p) throw erro_('server', 'Postagem não encontrada. Atualize a página.');
  motivo = String(motivo || '').trim();
  let para, texto;
  if (acao === 'definir') {
    gerencia_(eu);
    if (!acesso_(eu, p.marcaId)) throw erro_('permissao', 'Sem acesso a esta marca.');
    if (STATUS.indexOf(status) < 0) throw erro_('server', 'Status inválido.');
    para = status; texto = 'Mudou o status para ' + status;
  } else {
    const a = ACOES[acao];
    if (!a) throw erro_('server', 'Ação desconhecida.');
    const pode = a.quem === 'aprovar' ? podeAprovar_(eu, p.marcaId) : a.quem === 'cliente' ? podeCliente_(eu, p.marcaId) : podeEditar_(eu, p.marcaId);
    if (!pode) throw erro_('permissao', a.quem === 'aprovar' ? 'Só o aprovador ou o administrador pode fazer isso.' : a.quem === 'cliente' ? 'Só o aprovador do cliente (ou a gestão) pode fazer isso.' : 'Você não pode alterar postagens desta marca.');
    if (a.de.indexOf(p.status) < 0) throw erro_('server', 'Esta postagem está em "' + p.status + '" e não pode passar por esta etapa. Atualize a página.');
    if (a.motivo && !motivo) throw erro_('server', 'Escreva o motivo.');
    para = a.para; texto = a.texto;
    if (a.paraCliente && marcaTemCliente_(p.marcaId)) { para = a.paraCliente; texto += ' e enviou para o cliente'; }
    if (a.quem === 'cliente' && eu.papel !== 'cliente') texto = texto.replace('(cliente)', '(pelo cliente)');
    if (a.agenda) {
      if (TIPOS_AGENDA.indexOf(dados.agTipo) < 0) throw erro_('server', 'Escolha se é Feed, Carrossel, Reels ou Story.');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.agData || '') || !/^\d{1,2}:\d{2}$/.test(dados.agHora || '')) throw erro_('server', 'Preencha a data e a hora do agendamento.');
      texto += ': ' + dados.agTipo + ' em ' + paraBR_(dados.agData).slice(0, 5) + ' às ' + dados.agHora;
    }
  }
  const historico = p.historico.concat([{ em: Date.now(), por: eu.nome, uid: eu.id, acao: texto, de: p.status, para: para, motivo: motivo }]);
  const aba = aba_(ABA_PAUTAS, CAMPOS_PAUTA);
  const r = linhaDoId_(aba, id);
  const set = (k, v) => aba.getRange(r, colunaDe_(CAMPOS_PAUTA, k)).setNumberFormat('@').setValue(v);
  set('status', para);
  set('motivo', (para === 'Ideia reprovada' || para === 'Ajustes solicitados') ? motivo : '');
  set('historico', JSON.stringify(historico));
  set('atualizado', String(Date.now()));
  if (ACOES[acao] && ACOES[acao].agenda) {
    set('agTipo', dados.agTipo);
    set('agQuando', paraBR_(dados.agData) + ' ' + dados.agHora);
  }
  if (acao === 'postar' && dados.postLink) set('postLink', urlSegura_(dados.postLink));
  if (ACOES[acao] && ACOES[acao].agenda) { set('autoPub', dados.autoPub ? 'sim' : ''); set('pubInfo', dados.autoPub ? 'Aguardando o horário' : ''); }
  if (para !== 'Agendado' && p.autoPub) { set('autoPub', ''); }
  mexeu_();
  // o e-mail nunca pode impedir a ação de ser registrada
  try { notificar_(eu, p, acao, motivo, historico, site, para, coletor); } catch (e) { Logger.log('Falha ao enviar notificação: ' + e); }
}

/* ---------- Notificações por e-mail ---------- */

const AVISOS = {
  enviarValidacao: { para: 'aprovador', titulo: '💡 Nova ideia para validar', frase: 'enviou uma ideia para validação' },
  enviarAprovacao: { para: 'aprovador', titulo: '📝 Conteúdo para aprovar', frase: 'enviou um conteúdo pronto para aprovação' },
  validar: { para: 'autor', titulo: '✅ Ideia validada', frase: 'validou a sua ideia. Pode seguir para a produção.' },
  reprovarIdeia: { para: 'autor', titulo: '❌ Ideia reprovada', frase: 'reprovou a sua ideia' },
  aprovar: { para: 'autor', titulo: '✅ Conteúdo aprovado', frase: 'aprovou o seu conteúdo. Já pode agendar.' },
  pedirAjustes: { para: 'autor', titulo: '✏️ Ajustes pedidos', frase: 'pediu ajustes no seu conteúdo' },
  clienteValidar: { para: 'autor', titulo: '✅ Cliente validou a ideia', frase: 'validou a ideia pelo cliente. Pode seguir para a produção.' },
  clienteReprovar: { para: 'autor', titulo: '❌ Cliente reprovou a ideia', frase: 'reprovou a ideia pelo cliente' },
  clienteAprovar: { para: 'autor', titulo: '✅ Cliente aprovou o conteúdo', frase: 'aprovou o conteúdo pelo cliente. Já pode agendar.' },
  clienteAjustes: { para: 'autor', titulo: '✏️ Cliente pediu ajustes', frase: 'pediu ajustes no conteúdo pelo cliente' }
};
const AVISO_CLIENTE = {
  'Validação do cliente': { titulo: '💡 Ideia para você aprovar', frase: 'enviou uma ideia de post para a sua aprovação' },
  'Aprovação do cliente': { titulo: '📲 Post para você aprovar', frase: 'enviou um post pronto para a sua aprovação. Veja exatamente como vai ficar no Instagram' }
};

function notificar_(eu, p, acao, motivo, historico, site, paraStatus, coletor) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  let av = AVISOS[acao];
  if (AVISO_CLIENTE[paraStatus]) av = Object.assign({ para: 'cliente' }, AVISO_CLIENTE[paraStatus]);
  if (!av) return;
  const empP = empresaDe_(p.marcaId);
  const pessoas = ler_(ABA_USUARIOS, CAMPOS_USUARIO).map(publicoUsuario_)
    .filter(u => u.ativo && u.notificar && u.id !== eu.id && u.empresaId === empP && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(u.login));
  let dest = [];
  if (av.para === 'cliente') {
    dest = pessoas.filter(u => u.papel === 'cliente' && acesso_(u, p.marcaId));
  } else if (av.para === 'aprovador') {
    // aprovador da marca; sem aprovador, o gestor; sem gestor, diretor e administrador
    dest = pessoas.filter(u => u.papel === 'aprovador' && acesso_(u, p.marcaId));
    if (!dest.length) dest = pessoas.filter(u => u.papel === 'gestor' && acesso_(u, p.marcaId));
    if (!dest.length) dest = pessoas.filter(u => u.papel === 'diretor' || u.papel === 'admin');
  } else {
    // quem enviou para esta etapa; se não der para saber, as social medias da marca
    const envio = historico.slice().reverse().filter(h => String(h.acao || '').indexOf('Enviou') === 0)[0];
    dest = envio && envio.uid ? pessoas.filter(u => u.id === envio.uid) : [];
    if (!dest.length) dest = pessoas.filter(u => u.papel === 'social' && acesso_(u, p.marcaId));
  }
  if (!dest.length) return;
  const marca = nomeDaMarca_(p.marcaId);
  const titulo = (p.produto ? p.produto + ': ' : '') + (p.postagem || 'Postagem');
  // aprovação em lote: junta tudo num e-mail só por pessoa
  if (coletor) { dest.forEach(u => { const c = coletor[u.login] || (coletor[u.login] = { u: u, av: av, itens: [] }); c.itens.push(titulo + ' (' + marca + ')'); }); return; }
  if (MailApp.getRemainingDailyQuota() < dest.length) return;
  const link = /^https:\/\//.test(String(site || '')) ? String(site).split('#')[0] + '#aprovacoes' : '';
  // o cliente recebe um link que já entra, sem senha (vale 14 dias)
  const linkDe = u => link && u.papel === 'cliente' ? String(site).split('#')[0] + '#entrar=' + criarLink_(u.id) : link;
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
    '<p style="margin:0;color:#6b6b70;font-size:12px">Você recebe este aviso porque está na equipe no ' + NOME_APP + '. Para não receber mais, desligue em "Minha conta".</p></div>';
  dest.forEach(u => MailApp.sendEmail({ to: u.login, subject: assunto, htmlBody: link ? html.replace(link, linkDe(u)).replace('>Abrir o sistema<', u.papel === 'cliente' ? '>Ver e aprovar<' : '>Abrir o sistema<') : html, name: NOME_APP }));
}

/* ---------- Tarefas (checklist da equipe) ---------- */

function tarefaParaSite_(t) {
  t.data = paraISO_(t.data); t.prazo = paraISO_(t.prazo);
  t.criado = Number(t.criado) || 0; t.concluidoEm = Number(t.concluidoEm) || 0; t.atualizado = Number(t.atualizado) || 0;
  delete t.marca;
  return t;
}
// o gestor só chefia as tarefas sem marca ou das marcas dele
const chefia_ = (eu, t) => TODAS_MARCAS.indexOf(eu.papel) >= 0 || (eu.papel === 'gestor' && (!t || !t.marcaId || acesso_(eu, t.marcaId)));
function veTarefa_(eu, t) {
  if (!mesmaEmp_(eu, t.empresaId) || eu.papel === 'cliente') return false;
  return chefia_(eu, t) || t.responsavelId === eu.id || t.criadoPorId === eu.id || (t.marcaId && acesso_(eu, t.marcaId));
}
function podeMexerTarefa_(eu, t) {
  if (!mesmaEmp_(eu, t.empresaId)) return false;
  return chefia_(eu, t) || t.responsavelId === eu.id || t.criadoPorId === eu.id;
}
function tarefaPorId_(id) {
  return ler_(ABA_TAREFAS, CAMPOS_TAREFA).filter(x => x.id === String(id))[0] || null;
}

function salvarTarefa_(eu, t, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  const atual = t.id ? tarefaPorId_(t.id) : null;
  if (t.id && !atual) throw erro_('server', 'Tarefa não encontrada. Atualize a página.');
  if (atual && !podeMexerTarefa_(eu, atual)) throw erro_('permissao', 'Só quem criou, o responsável ou a gestão pode editar esta tarefa.');
  const titulo = String(t.titulo || '').trim().slice(0, 200);
  if (!titulo) throw erro_('server', 'Escreva o que precisa ser feito.');
  const marcaId = String(t.marcaId || '');
  if (marcaId && !acesso_(eu, marcaId)) throw erro_('permissao', 'Você não tem acesso a esta marca.');
  const pessoas = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(u => mesmaEmp_(eu, u.empresaId));
  const resp = pessoas.filter(u => u.id === t.responsavelId && u.ativo === 'sim')[0];
  const id = atual ? atual.id : Utilities.getUuid().slice(0, 13);
  const linha = {
    id: id, marcaId: marcaId, marca: marcaId ? nomeDaMarca_(marcaId) : '',
    titulo: titulo, descricao: String(t.descricao || '').slice(0, 3000),
    prioridade: PRIORIDADES.indexOf(t.prioridade) >= 0 ? t.prioridade : 'Média',
    data: paraBR_(t.data), prazo: paraBR_(t.prazo),
    responsavelId: resp ? resp.id : '', responsavel: resp ? resp.nome : '',
    status: atual ? atual.status : 'Pendente',
    criadoPorId: atual ? atual.criadoPorId : eu.id, criadoPor: atual ? atual.criadoPor : eu.nome,
    criado: atual ? atual.criado : String(Date.now()),
    concluidoPor: atual ? atual.concluidoPor : '', concluidoEm: atual ? atual.concluidoEm : '',
    atualizado: String(Date.now()),
    empresaId: atual ? atual.empresaId : (marcaId ? empresaDe_(marcaId) : eu.empresaId)
  };
  if (!linha.empresaId) throw erro_('server', 'Escolha a empresa no topo antes de criar.');
  gravar_(ABA_TAREFAS, CAMPOS_TAREFA, linha);
  // avisa por e-mail quem recebeu a tarefa (se não foi a própria pessoa)
  if (resp && resp.id !== eu.id && (!atual || atual.responsavelId !== resp.id)) {
    try { avisarTarefa_(eu, linha, publicoUsuario_(resp), site); } catch (e) { Logger.log('Falha no aviso da tarefa: ' + e); }
  }
  return id;
}

function concluirTarefa_(eu, id, feita) {
  const t = tarefaPorId_(id);
  if (!t) throw erro_('server', 'Tarefa não encontrada. Atualize a página.');
  if (!podeMexerTarefa_(eu, t)) throw erro_('permissao', 'Só quem criou, o responsável ou a gestão pode marcar esta tarefa.');
  t.status = feita ? 'Feita' : 'Pendente';
  t.concluidoPor = feita ? eu.nome : ''; t.concluidoEm = feita ? String(Date.now()) : '';
  t.atualizado = String(Date.now());
  gravar_(ABA_TAREFAS, CAMPOS_TAREFA, t);
}

function excluirTarefa_(eu, id) {
  const t = tarefaPorId_(id);
  if (!t) return;
  if (!mesmaEmp_(eu, t.empresaId) || !(chefia_(eu, t) || t.criadoPorId === eu.id)) throw erro_('permissao', 'Só quem criou a tarefa ou a gestão pode excluir.');
  excluirLinha_(ABA_TAREFAS, CAMPOS_TAREFA, id);
}

function avisarTarefa_(eu, t, u, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  if (!u.notificar || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(u.login) || MailApp.getRemainingDailyQuota() < 1) return;
  const link = /^https:\/\//.test(String(site || '')) ? String(site).split('#')[0] + '#tarefas' : '';
  const linha = (k, v) => v ? '<tr><td style="padding:4px 12px 4px 0;color:#6b6b70">' + k + '</td><td style="padding:4px 0">' + escH_(v) + '</td></tr>' : '';
  const html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1d1d1f;max-width:560px">' +
    (t.marca ? '<p style="margin:0 0 6px;color:#6b6b70;font-size:12px;letter-spacing:.08em;text-transform:uppercase">' + escH_(t.marca) + '</p>' : '') +
    '<h2 style="margin:0 0 14px;font-size:22px;font-weight:600">📋 Nova tarefa para você</h2>' +
    '<p style="margin:0 0 14px"><b>' + escH_(eu.nome) + '</b> passou uma tarefa:</p>' +
    '<p style="margin:0 0 14px;font-size:18px"><b>' + escH_(t.titulo) + '</b></p>' +
    (t.descricao ? '<p style="margin:0 0 14px;white-space:pre-wrap">' + escH_(t.descricao) + '</p>' : '') +
    '<table style="border-collapse:collapse;font-size:14px;margin:0 0 18px">' + linha('Prioridade', t.prioridade) + linha('Data', t.data) + linha('Prazo máximo', t.prazo) + '</table>' +
    (link ? '<p style="margin:0 0 18px"><a href="' + link + '" style="background:#1d1d1f;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">Ver tarefas</a></p>' : '') +
    '<p style="margin:0;color:#6b6b70;font-size:12px">Para não receber mais avisos por e-mail, desligue em "Minha conta".</p></div>';
  MailApp.sendEmail({ to: u.login, subject: '📋 Nova tarefa: ' + t.titulo + (t.prazo ? ' (até ' + t.prazo + ')' : ''), htmlBody: html, name: NOME_APP });
}

/* ---------- Puxar artes e legenda de uma pasta do Drive ----------
 * Imagens e vídeos em ordem pelo número no nome (1, 2, 3…); o primeiro Google Docs vira a legenda.
 * Os arquivos de mídia ficam visíveis para quem tem o link, para aparecerem na prévia e para o cliente. */
function lerPasta_(eu, link) {
  if (['cliente', 'aprovador'].indexOf(eu.papel) >= 0) throw erro_('permissao', 'Só quem alimenta a marca pode puxar arquivos.');
  const m = String(link || '').match(/folders\/([\w-]{10,})/) || String(link || '').match(/[?&]id=([\w-]{10,})/);
  if (!m) throw erro_('server', 'Cole o link de uma pasta do Drive (drive.google.com/drive/folders/…).');
  let pasta;
  try { pasta = DriveApp.getFolderById(m[1]); pasta.getName(); }
  catch (e) { throw erro_('server', 'Não consegui abrir essa pasta. Confira se ela está compartilhada como "Qualquer pessoa com o link".'); }
  // só pastas que já estão abertas por link: assim ninguém usa o acesso da dona do sistema para ler pastas particulares
  if (!publicoPorLink_(pasta)) throw erro_('permissao', 'Essa pasta é particular. No Drive, compartilhe como "Qualquer pessoa com o link" e tente de novo.');
  const midias = [], docs = [];
  const it = pasta.getFiles();
  while (it.hasNext()) {
    const f = it.next(), mt = f.getMimeType(), nome = f.getName();
    if (/^image\//.test(mt) || /^video\//.test(mt)) {
      midias.push({ id: f.getId(), nome: nome, tipo: /^video\//.test(mt) ? 'video' : 'imagem' });
    } else if (mt === MimeType.GOOGLE_DOCS) docs.push(f);
  }
  // ordem pelo último número do nome: "1.png", "slide 2.jpg", "Carrossel P2 - 3.png"
  const num = n => { const x = String(n).replace(/\.[a-z0-9]+$/i, '').match(/\d+/g); return x ? Number(x[x.length - 1]) : 9999; };
  midias.sort((a, b) => num(a.nome) - num(b.nome) || a.nome.localeCompare(b.nome));
  let texto = '', docNome = '';
  if (docs.length) {
    docNome = docs[0].getName();
    const r = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + docs[0].getId() + '/export?mimeType=text/plain',
      { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
    if (r.getResponseCode() === 200) texto = r.getContentText().replace(/^\uFEFF/, '');
  }
  return Object.assign({ midias: midias.slice(0, 20), docNome: docNome, texto: texto }, lerDocumentoLegenda_(texto));
}

/* Documento da legenda, no formato da agência:
 *   P2 · O que a Xpert Liss entrega na prática? (carrossel) · 01/11 (dom)   ← cabeçalho (opcional)
 *   (linha em branco)
 *   Texto da legenda… #hashtags
 * Se tiver um título "Legenda" ou "Legenda:", vale o que vem depois dele. */
function lerDocumentoLegenda_(t) {
  let linhas = String(t || '').replace(/\r/g, '').split('\n').map(l => l.replace(/[\u00A0\s]+$/g, '').replace(/^\s+/, ''));
  const iLeg = linhas.findIndex(l => /^legenda\s*:?\s*$/i.test(l) || /^legenda\s*:/i.test(l));
  let cab = null;
  if (iLeg >= 0) {
    const resto = linhas[iLeg].replace(/^legenda\s*:?\s*/i, '');
    linhas = (resto ? [resto] : []).concat(linhas.slice(iLeg + 1));
  } else {
    const i0 = linhas.findIndex(l => l);
    const c = i0 >= 0 ? linhas[i0] : '';
    // cabeçalho: começa com o código do post (P2, Post 2…) ou tem a data dd/mm
    if (/^p(ost)?\s*\d+\b/i.test(c) || (/\b\d{1,2}\/\d{1,2}\b/.test(c) && c.indexOf('·') >= 0)) {
      cab = c; linhas = linhas.slice(i0 + 1);
    }
  }
  // tira linhas em branco repetidas e as das pontas
  const limpo = [];
  linhas.forEach(l => { if (l || (limpo.length && limpo[limpo.length - 1])) limpo.push(l); });
  while (limpo.length && !limpo[limpo.length - 1]) limpo.pop();
  const legenda = limpo.join('\n').replace(/\\#/g, '#').trim();
  const r = { legenda: legenda };
  if (cab) {
    const partes = cab.split(/\s*·\s*/);
    const titulo = (partes[1] || '').replace(/\s*\((carrossel|est[aá]tico|v[ií]deo|reels?)\)\s*$/i, '').trim();
    const fmt = (cab.match(/\((carrossel|est[aá]tico|v[ií]deo|reels?)\)/i) || [])[1] || '';
    r.cabecalho = { codigo: (partes[0] || '').trim(), titulo: titulo, formato: /carrossel/i.test(fmt) ? 'Carrossel' : /est/i.test(fmt) ? 'Estático' : fmt ? 'Vídeo' : '' };
  }
  return r;
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
  const nova = !m.id;
  if (!m.id) { gerencia_(eu); if (!eu.empresaId) throw erro_('server', 'Escolha a empresa no topo antes de criar a marca.'); }
  else if (!podeEditar_(eu, m.id)) throw erro_('permissao', 'Você não pode editar esta marca.');
  const id = m.id || Utilities.getUuid().slice(0, 13);
  gravar_(ABA_MARCAS, CAMPOS_MARCA, {
    id: id,
    nome: m.nome || 'Sem nome',
    produtos: (m.produtos || []).join('\n'),
    fases: JSON.stringify(m.fases && m.fases.length ? m.fases : FASES_PADRAO),
    observacoes: m.observacoes || '',
    criado: m.criado || Date.now(),
    perfil: JSON.stringify(limparPerfilMarca_(eu, m.perfil || {}, nova ? {} : parseJSON_((ler_(ABA_MARCAS, CAMPOS_MARCA).filter(x => x.id === id)[0] || {}).perfil, {}))),
    arquivos: JSON.stringify(limparArquivos_(m.arquivos || [])),
    empresaId: nova ? eu.empresaId : empresaDe_(id)
  });
  EMP_CACHE = null;
  // mantém o nome da marca em dia na aba POSTAGENS
  const aba = aba_(ABA_PAUTAS, CAMPOS_PAUTA);
  const n = aba.getLastRow() - 1;
  if (n > 0) {
    const ids = aba.getRange(2, colunaDe_(CAMPOS_PAUTA, 'marcaId'), n, 1).getValues();
    const col = aba.getRange(2, colunaDe_(CAMPOS_PAUTA, 'marca'), n, 1);
    col.setValues(col.getValues().map((v, i) => [ids[i][0] === id ? (m.nome || 'Sem nome') : v[0]]));
  }
  if (nova) checklistMarca_(eu, id);
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
  mexeu_();
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
  mexeu_();
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
  const props = PropertiesService.getScriptProperties();
  const d = parseJSON_(props.getProperty('cred_' + marcaId), null) || {};
  // registro de quem abriu os acessos (últimas 30 vezes)
  const log = parseJSON_(props.getProperty('credlog_' + marcaId), []);
  log.unshift({ por: eu.nome, uid: eu.id, em: Date.now() });
  try { auditar_(eu, 'Abriu os acessos (senhas) da marca', nomeDaMarca_(marcaId), '', empresaDe_(marcaId)); } catch (e) {}
  props.setProperty('credlog_' + marcaId, JSON.stringify(log.slice(0, 30)));
  return { acessos: Array.isArray(d.acessos) ? d.acessos : [], por: d.por || '', em: d.em || 0, vistos: log.slice(0, 10) };
}

function acessosSalvar_(eu, marcaId, acessos) {
  try { auditar_(eu, 'Alterou os acessos (senhas) da marca', nomeDaMarca_(marcaId), '', empresaDe_(marcaId)); } catch (e) {}
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
  limite_('up_' + eu.id, 60, 3600, 'Muitos arquivos enviados agora. Tente de novo em uma hora.');
  const a = arquivoSeguro_(req.base64, 25, false);
  const raiz = pasta_(DriveApp.getRootFolder(), PASTA_ARQUIVOS);
  const pasta = pasta_(raiz, nomeDaMarca_(req.marcaId) || 'Sem marca');
  const blob = Utilities.newBlob(a.bytes, a.mime, nomeArquivo_(req.nome));
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
  if (atual && !mesmaEmp_(eu, atual.empresaId)) throw erro_('permissao', 'Esta pessoa é de outra empresa.');
  if (!atual && !eu.empresaId) throw erro_('server', 'Escolha a empresa no topo antes de cadastrar a pessoa.');
  // marcas liberadas só da mesma empresa
  const empDaPessoa = atual ? atual.empresaId : eu.empresaId;
  u.marcas = (u.marcas || []).filter(id => id === '*' || empresaDe_(id) === empDaPessoa);
  if (eu.papel === 'diretor') {
    // o diretor não cria nem altera administradores e diretores (nem a si mesmo por aqui)
    if (['gestor', 'social', 'aprovador', 'cliente'].indexOf(u.papel) < 0) throw erro_('permissao', 'O diretor só cadastra gestores, social medias e aprovadores.');
    if (atual && ['admin', 'diretor'].indexOf(atual.papel) >= 0) throw erro_('permissao', 'Só o administrador altera este acesso.');
  }
  if (atual && atual.id === eu.id && (u.papel !== 'admin' || u.ativo === false)) throw erro_('server', 'Você não pode tirar o seu próprio acesso de administrador.');
  if (!atual && !u.senha) throw erro_('server', 'Defina uma senha provisória.');
  if (u.senha) senhaValida_(u.senha);
  if (atual && (u.senha || u.ativo === false)) derrubarSessoes_(atual.id);
  const sal = u.senha ? Utilities.getUuid() : atual.sal;
  gravar_(ABA_USUARIOS, CAMPOS_USUARIO, {
    id: atual ? atual.id : Utilities.getUuid().slice(0, 13),
    nome: String(u.nome || '').trim() || login,
    login: login,
    papel: u.papel,
    marcas: TODAS_MARCAS.indexOf(u.papel) >= 0 ? '*' : (u.marcas || []).join(','),
    ativo: u.ativo === false ? 'não' : 'sim',
    hash: u.senha ? hash_(u.senha, sal) : atual.hash,
    sal: sal,
    criado: atual ? atual.criado : String(Date.now()),
    whatsapp: String(u.whatsapp || '').replace(/\D/g, ''),
    aniversario: /^\d{2}\/\d{2}$/.test(u.aniversario || '') ? u.aniversario : (atual ? atual.aniversario : ''),
    empresaId: empDaPessoa, dono: atual ? atual.dono : '',
    ultimoAcesso: atual ? atual.ultimoAcesso : '',
    notificar: atual ? atual.notificar : '',
    visual: atual ? atual.visual : '',
    foto: atual ? atual.foto : ''
  });
}

// foto de perfil: fica numa pasta "Equipe" no Drive, visível para quem tem o link
function salvarMinhaFoto_(eu, base64, remover) {
  const u = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(x => x.id === eu.id)[0];
  if (u.foto) { try { DriveApp.getFileById(u.foto).setTrashed(true); } catch (e) { /* já não existe */ } }
  if (remover) { u.foto = ''; gravar_(ABA_USUARIOS, CAMPOS_USUARIO, u); return { foto: '' }; }
  if (!remover) arquivoSeguro_(base64, 2, true);
  const pasta = pasta_(pasta_(DriveApp.getRootFolder(), PASTA_ARQUIVOS), 'Equipe');
  const arq = pasta.createFile(Utilities.newBlob(Utilities.base64Decode(base64), 'image/jpeg', 'foto-' + eu.id + '.jpg'));
  try { arq.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  u.foto = arq.getId();
  gravar_(ABA_USUARIOS, CAMPOS_USUARIO, u);
  return { foto: u.foto };
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
  if (!u || !conferirSenha_(atual, u)) throw erro_('server', 'A senha atual está incorreta.');
  senhaValida_(nova);
  const sal = Utilities.getUuid();
  u.sal = sal; u.hash = hash_(nova, sal);
  gravar_(ABA_USUARIOS, CAMPOS_USUARIO, u);
  derrubarSessoes_(u.id, eu.token);
}

// hash forte: HMAC-SHA256 repetido (estilo PBKDF2), com sal por pessoa
const HASH_VOLTAS = 400;
function hash_(senha, sal) {
  let h = Utilities.computeHmacSha256Signature(String(senha), String(sal));
  for (let i = 1; i < HASH_VOLTAS; i++) h = Utilities.computeHmacSha256Signature(h, Utilities.newBlob(String(sal) + '|' + String(senha)).getBytes());
  return 'p2$' + HASH_VOLTAS + '$' + Utilities.base64Encode(h);
}
function hashAntigo_(senha, sal) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(sal) + '|' + String(senha), Utilities.Charset.UTF_8));
}
function conferirSenha_(senha, u) {
  const h = String(u.hash || '');
  return h.indexOf('p2$') === 0 ? h === hash_(senha, u.sal) : (!!h && h === hashAntigo_(senha, u.sal));
}
function senhaValida_(s) {
  s = String(s || '');
  if (s.length < 8) throw erro_('server', 'A senha precisa ter pelo menos 8 caracteres.');
  if (/^(\d)\1+$|^12345678|^senha|^password|^qwerty/i.test(s)) throw erro_('server', 'Essa senha é fácil demais de adivinhar. Escolha outra.');
}
function avisarBloqueio_(u) {
  try {
    if (/@/.test(u.login) && MailApp.getRemainingDailyQuota() > 0) MailApp.sendEmail({ to: u.login, name: NOME_APP, subject: '⚠️ Muitas tentativas de entrar na sua conta',
      htmlBody: '<p style="font-family:Arial,sans-serif;font-size:15px">Alguém errou a senha da sua conta no ' + NOME_APP + ' ' + MAX_TENTATIVAS + ' vezes seguidas. Por segurança, ela ficou bloqueada por ' + BLOQUEIO_MIN + ' minutos.<br><br>Se não foi você, troque a senha usando "Esqueci minha senha" e avise a gestão.</p>' });
  } catch (e) {}
}
// encerra todas as sessões de uma pessoa (menos a atual, se informada)
function derrubarSessoes_(uid, exceto) {
  const props = PropertiesService.getScriptProperties(), todas = props.getProperties();
  Object.keys(todas).forEach(k => { if (k.indexOf('tok_') === 0 && k !== 'tok_' + exceto) { const s = parseJSON_(todas[k], {}); if (s.uid === uid) props.deleteProperty(k); } });
}

function normLogin_(s) {
  return String(s || '').trim().toLowerCase();
}

/* ---------- Escrita genérica ---------- */

function gravar_(nome, campos, obj) {
  const aba = aba_(nome, campos);
  const valores = [campos.map(c => obj[c[0]] == null ? '' : String(obj[c[0]]))];
  const r = linhaDoId_(aba, obj.id);
  // formato texto antes de escrever: um título "=IMPORTXML(...)" fica como texto e não vira fórmula
  if (r) aba.getRange(r, 1, 1, campos.length).setNumberFormat('@').setValues(valores);
  else aba.getRange(aba.getLastRow() + 1, 1, 1, campos.length).setNumberFormat('@').setValues(valores);
  mexeu_();
}

function excluirLinha_(nome, campos, id) {
  const aba = aba_(nome, campos);
  const r = linhaDoId_(aba, id);
  if (r) aba.deleteRow(r);
  mexeu_();
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
  aba_(ABA_STORIES, CAMPOS_STORY);
  aba_(ABA_AGENDA, CAMPOS_AGENDA);
  aba_(ABA_HORAS, CAMPOS_HORA);
  aba_(ABA_MURAL, CAMPOS_AVISO);
  aba_(ABA_LIXEIRA, CAMPOS_LIXEIRA);
  aba_(ABA_AVALIACOES, CAMPOS_AVALIACAO);
  aba_(ABA_PAGAMENTOS, CAMPOS_PAGAMENTO);
  aba_(ABA_PROPOSTAS, CAMPOS_PROPOSTA);
  aba_(ABA_AUDITORIA, CAMPOS_AUDITORIA);
  instalarGatilhos_();

  if (!ler_(ABA_USUARIOS, CAMPOS_USUARIO).length) {
    const login = normLogin_(Session.getEffectiveUser().getEmail()) || 'admin';
    const senha = Utilities.getUuid().slice(0, 8);
    const sal = Utilities.getUuid();
    gravar_(ABA_USUARIOS, CAMPOS_USUARIO, {
      id: Utilities.getUuid().slice(0, 13), nome: 'Administrador', login: login, papel: 'admin',
      marcas: '*', ativo: 'sim', hash: hash_(senha, sal), sal: sal, criado: String(Date.now())
    });
    try { MailApp.sendEmail({ to: login, name: NOME_APP, subject: 'Seu acesso de administrador', body: 'Login: ' + login + '\nSenha provisória: ' + senha + '\n\nTroque em "Minha conta" depois de entrar.' }); Logger.log('Administrador criado. Login: ' + login + '. A senha provisória foi enviada para o seu e-mail.'); }
    catch (e) { Logger.log('Administrador criado. Login: ' + login + '  |  Senha provisória: ' + senha + '  (não consegui mandar por e-mail; troque assim que entrar)'); }
  }
  migrarEmpresas_();

  if (pautas.getLastRow() > 1) {
    const n = pautas.getLastRow() - 1;
    const col = pautas.getRange(2, colunaDe_(CAMPOS_PAUTA, 'status'), n, 1);
    col.setValues(col.getValues().map(v => [normStatus_(v[0])]));
    Logger.log('A aba POSTAGENS já tem dados: nada foi importado, só os status foram atualizados.');
    return;
  }
  importarDetalhamento_(ss);
  migrarEmpresas_();
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

/* ======================================================================
 * Novidades 2026-11-03: atualização leve, sessões por link, comentários,
 * repetição de postagens, stories, publicação automática, resultados dos
 * posts, resumo diário por e-mail e cópia de segurança semanal.
 * ====================================================================== */

/* ---------- Carimbo: o site só baixa tudo de novo quando algo mudou ---------- */
function carimbo_() {
  return PropertiesService.getScriptProperties().getProperty('mod') || '0';
}
function mexeu_() {
  PropertiesService.getScriptProperties().setProperty('mod', String(Date.now()) + Math.floor(Math.random() * 1000));
}
// endereço do site, para os e-mails automáticos (resumo diário) saberem para onde apontar
// o endereço do site não é mais aprendido dos pedidos (podia ser envenenado)
function guardarSite_() {}
function site_() {
  const v = PropertiesService.getScriptProperties().getProperty('SITE_URL');
  return /^https:\/\/[^\s#?]+\/$/.test(v || '') ? v : SITE_PADRAO;
}

/* ---------- Sessões (login normal e link do cliente) ---------- */
// convite de login por e-mail: vale até 14 dias, mas só pode ser usado UMA vez (vira uma sessão normal)
function criarLink_(uid) {
  const chave = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty('lnk_' + chave, JSON.stringify({ uid: uid, exp: Date.now() + 14 * 864e5 }));
  return chave;
}
function entrarComLink_(chave) {
  const props = PropertiesService.getScriptProperties(), k = 'lnk_' + String(chave || '').replace(/\W/g, '');
  const d = parseJSON_(props.getProperty(k), null);
  if (!d || d.exp < Date.now()) throw erro_('login', 'Este link já foi usado ou venceu. Peça um novo para a agência.');
  props.deleteProperty(k);
  const u = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(x => x.id === d.uid)[0];
  if (!u || u.ativo !== 'sim' || u.papel !== 'cliente' || !empresaAtiva_(u)) throw erro_('login', 'Este acesso não está mais ativo.');
  try { auditar_(publicoUsuario_(u), 'Entrou pelo link do e-mail', '', '', u.empresaId); } catch (e) {}
  return { token: criarSessao_(u.id, 14, true) };
}
function criarSessao_(uid, dias, porLink) {
  const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty('tok_' + token, JSON.stringify({ uid: uid, exp: Date.now() + dias * 864e5, link: !!porLink }));
  return token;
}

// link que já entra na conta do aprovador do cliente, sem senha (vale 14 dias)
function linkCliente_(eu, usuarioId, site, enviar) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  const alvo = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(u => u.id === String(usuarioId))[0];
  if (!alvo || alvo.ativo !== 'sim') throw erro_('server', 'Pessoa não encontrada ou desativada.');
  if (alvo.papel !== 'cliente') throw erro_('server', 'O link sem senha é só para o aprovador do cliente.');
  if (!mesmaEmp_(eu, alvo.empresaId)) throw erro_('permissao', 'Esta pessoa é de outra empresa.');
  const pub = publicoUsuario_(alvo);
  const pode = TODAS_MARCAS.indexOf(eu.papel) >= 0 ||
    (pub.marcas.indexOf('*') < 0 && pub.marcas.some(m => podeEditar_(eu, m) || podeAprovar_(eu, m)));
  if (!pode) throw erro_('permissao', 'Você não cuida das marcas deste cliente.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(alvo.login)) throw erro_('server', 'O login deste cliente não é um e-mail. Cadastre o e-mail dele para mandar o acesso.');
  limite_('link_' + eu.id, 20, 3600, 'Você mandou muitos links agora. Tente de novo em uma hora.');
  const url = site + '#entrar=' + criarLink_(alvo.id);
  let enviado = false;
  if (MailApp.getRemainingDailyQuota() > 0) {
    const marcas = pub.marcas.map(nomeDaMarca_).filter(String).join(', ');
    MailApp.sendEmail({
      to: alvo.login, name: NOME_APP,
      subject: '📲 Seus posts para aprovar' + (marcas ? ' (' + marcas + ')' : ''),
      htmlBody: '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1d1d1f;max-width:560px">' +
        '<h2 style="margin:0 0 14px;font-size:22px;font-weight:600">Olá, ' + escH_(alvo.nome) + '!</h2>' +
        '<p style="margin:0 0 14px"><b>' + escH_(eu.nome) + '</b> te mandou o acesso para ver e aprovar os posts' + (marcas ? ' de <b>' + escH_(marcas) + '</b>' : '') + '. É só clicar, sem senha:</p>' +
        '<p style="margin:0 0 18px"><a href="' + url + '" style="background:#1d1d1f;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Ver e aprovar</a></p>' +
        '<p style="margin:0;color:#6b6b70;font-size:12px">O link vale por 14 dias e é só seu. Não encaminhe.</p></div>'
    });
    enviado = true;
  }
  if (!enviado) throw erro_('server', 'A cota diária de e-mails acabou. Tente amanhã.');
  // o link nunca volta para quem pediu: só o cliente recebe, no e-mail dele
  return { enviado: true, nome: alvo.nome, email: alvo.login.replace(/^(.).*(@.*)$/, '$1•••$2') };
}

/* ---------- Comentários na postagem ---------- */
function setPauta_(id, campos) {
  const aba = aba_(ABA_PAUTAS, CAMPOS_PAUTA);
  const r = linhaDoId_(aba, id);
  if (!r) throw erro_('server', 'Postagem não encontrada. Atualize a página.');
  Object.keys(campos).forEach(k => aba.getRange(r, colunaDe_(CAMPOS_PAUTA, k)).setNumberFormat('@').setValue(campos[k]));
  mexeu_();
}
function comentar_(eu, id, texto, arte) {
  const p = pautaPorId_(id);
  if (!p) throw erro_('server', 'Postagem não encontrada. Atualize a página.');
  if (!acesso_(eu, p.marcaId)) throw erro_('permissao', 'Sem acesso a esta marca.');
  texto = String(texto || '').trim().slice(0, 2000);
  if (!texto) throw erro_('server', 'Escreva o comentário.');
  const c = { id: Utilities.getUuid().slice(0, 8), em: Date.now(), por: eu.nome, uid: eu.id, papel: eu.papel, texto: texto };
  const n = parseInt(arte, 10);
  if (n > 0) c.arte = n;
  const lista = (p.comentarios || []).concat([c]).slice(-200);
  setPauta_(id, { comentarios: JSON.stringify(lista), atualizado: String(Date.now()) });
  return { comentario: c };
}
function apagarComentario_(eu, id, cid) {
  const p = pautaPorId_(id);
  if (p && !acesso_(eu, p.marcaId)) throw erro_('permissao', 'Sem acesso a esta marca.');
  if (!p) return;
  const c = (p.comentarios || []).filter(x => x.id === cid)[0];
  if (!c) return;
  if (c.uid !== eu.id && TODAS_MARCAS.indexOf(eu.papel) < 0) throw erro_('permissao', 'Só quem escreveu pode apagar o comentário.');
  setPauta_(id, { comentarios: JSON.stringify(p.comentarios.filter(x => x.id !== cid)) });
}

/* ---------- Repetir uma postagem (série semanal, quinzenal ou mensal) ---------- */
function somaDias_(isoData, dias, meses) {
  const m = String(isoData || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const d = new Date(+m[1], +m[2] - 1 + (meses || 0), +m[3] + (dias || 0));
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}
function repetirPauta_(eu, id, intervalo, vezes) {
  const p = pautaPorId_(id);
  if (!p) throw erro_('server', 'Postagem não encontrada. Atualize a página.');
  if (!podeEditar_(eu, p.marcaId)) throw erro_('permissao', 'Você não pode criar postagens nesta marca.');
  vezes = Math.max(1, Math.min(12, parseInt(vezes, 10) || 1));
  const passo = intervalo === 'mes' ? { d: 0, m: 1 } : intervalo === '2semanas' ? { d: 14, m: 0 } : { d: 7, m: 0 };
  const copiar = ['marcaId', 'fase', 'formato', 'produto', 'pauta', 'objetivo', 'cta', 'rede', 'gravacao', 'observacao', 'inspiracao', 'legenda', 'criativo', 'capa', 'postagem'];
  const ids = [];
  for (let i = 1; i <= vezes; i++) {
    const nova = {};
    copiar.forEach(k => nova[k] = p[k] || '');
    nova.midias = p.midias || [];
    nova.data = somaDias_(p.data, passo.d * i, passo.m * i);
    if (p.prazoArte) nova.prazoArte = somaDias_(p.prazoArte, passo.d * i, passo.m * i);
    if (p.prazoAprovacao) nova.prazoAprovacao = somaDias_(p.prazoAprovacao, passo.d * i, passo.m * i);
    ids.push(salvarPauta_(eu, nova));
  }
  return ids;
}

/* ---------- Stories ---------- */
function storyParaSite_(x) {
  x.data = paraISO_(x.data);
  x.ordem = Number(x.ordem) || 0;
  x.criado = Number(x.criado) || 0;
  x.atualizado = Number(x.atualizado) || 0;
  x.status = STATUS_STORY.indexOf(x.status) >= 0 ? x.status : 'Planejado';
  delete x.marca;
  return x;
}
function salvarStory_(eu, st) {
  const todos = ler_(ABA_STORIES, CAMPOS_STORY);
  const atual = st.id ? todos.filter(x => x.id === String(st.id))[0] : null;
  if (st.id && !atual) throw erro_('server', 'Story não encontrado. Atualize a página.');
  const marcaId = atual ? atual.marcaId : st.marcaId;
  if (!podeEditar_(eu, marcaId)) throw erro_('permissao', 'Você não pode editar os stories desta marca.');
  const data = /^\d{4}-\d{2}-\d{2}$/.test(st.data || '') ? st.data : (atual ? paraISO_(atual.data) : '');
  if (!data) throw erro_('server', 'Escolha o dia do story.');
  const txt = (k, max) => String(st[k] != null ? st[k] : (atual ? atual[k] : '') || '').slice(0, max || 500);
  let ordem = atual ? Number(atual.ordem) || 0 : 0;
  if (!atual || paraISO_(atual.data) !== data) {
    ordem = todos.filter(x => x.marcaId === marcaId && paraISO_(x.data) === data).reduce((mx, x) => Math.max(mx, Number(x.ordem) || 0), 0) + 1;
  }
  const status = STATUS_STORY.indexOf(st.status) >= 0 ? st.status : (atual ? atual.status : 'Planejado');
  const auto = 'autoPub' in st ? (st.autoPub ? 'sim' : '') : (atual ? atual.autoPub : '');
  const id = atual ? atual.id : Utilities.getUuid().slice(0, 13);
  gravar_(ABA_STORIES, CAMPOS_STORY, {
    id: id, marcaId: marcaId, marca: nomeDaMarca_(marcaId), data: paraBR_(data),
    hora: /^\d{1,2}:\d{2}$/.test(st.hora || '') ? st.hora : (st.hora === '' ? '' : (atual ? atual.hora : '')),
    ordem: ordem, tipo: txt('tipo', 40), titulo: txt('titulo', 200), texto: txt('texto', 1000), roteiro: txt('roteiro', 3000),
    sticker: txt('sticker', 40), stickerTexto: txt('stickerTexto', 300), link: urlSegura_(txt('link', 1000)), midia: (idSeguro_(txt('midia', 100)) || urlSegura_(txt('midia', 1000))),
    cor: /^#[0-9a-fA-F]{6}$/.test(st.cor || '') ? st.cor : (atual ? atual.cor : ''), status: status, obs: txt('obs', 2000),
    criadoPor: atual ? atual.criadoPor : eu.nome, criado: atual ? atual.criado : Date.now(), atualizado: Date.now(),
    autoPub: status === 'Postado' ? '' : auto,
    pubInfo: status === 'Postado' ? (atual ? atual.pubInfo : '') : auto ? (atual && atual.autoPub === 'sim' && atual.pubInfo ? atual.pubInfo : 'Aguardando o horário') : ''
  });
  return id;
}
function excluirStory_(eu, id) {
  const x = ler_(ABA_STORIES, CAMPOS_STORY).filter(s => s.id === String(id))[0];
  if (!x) return;
  if (!podeEditar_(eu, x.marcaId)) throw erro_('permissao', 'Você não pode excluir os stories desta marca.');
  paraLixeira_(eu, 'story', x, x.titulo || x.tipo || 'Story');
  excluirLinha_(ABA_STORIES, CAMPOS_STORY, id);
}
// recebe a sequência na ordem nova: [{id, data}] (a data muda quando o story é arrastado para outro dia)
function ordenarStories_(eu, itens) {
  const todos = ler_(ABA_STORIES, CAMPOS_STORY);
  (itens || []).slice(0, 100).forEach((it, i) => {
    const id = typeof it === 'string' ? it : it.id;
    const x = todos.filter(s => s.id === String(id))[0];
    if (!x || !podeEditar_(eu, x.marcaId)) return;
    x.ordem = i + 1;
    if (it.data && /^\d{4}-\d{2}-\d{2}$/.test(it.data)) x.data = paraBR_(it.data);
    x.atualizado = Date.now();
    gravar_(ABA_STORIES, CAMPOS_STORY, x);
  });
}

/* ---------- Publicação automática no Instagram ----------
 * Precisa da chave da Página (login do Facebook) com a permissão instagram_content_publish,
 * ou da chave do login do Instagram com instagram_business_content_publish.
 * As artes vêm do Drive: o script deixa cada arquivo como "qualquer pessoa com o link" para o Instagram baixar. */
function idDrive_(t) {
  const m = String(t || '').match(/\/d\/([\w-]{20,})/) || String(t || '').match(/[?&]id=([\w-]{20,})/) || String(t || '').match(/^([\w-]{25,})$/);
  return m ? m[1] : '';
}
function igBase_(d) {
  return d.tipo === 'fb' ? { host: 'https://graph.facebook.com/v21.0/', conta: d.igId } : { host: 'https://graph.instagram.com/v21.0/', conta: 'me' };
}
function igPost_(url, params) {
  const r = UrlFetchApp.fetch(url, { method: 'post', payload: params, muteHttpExceptions: true });
  let j;
  try { j = JSON.parse(r.getContentText()); } catch (e) { throw new Error('O Instagram não respondeu.'); }
  if (j.error) throw new Error(j.error.code === 190 ? 'A chave do Instagram expirou. Conecte de novo.' : (j.error.error_user_msg || j.error.message));
  return j;
}
// para publicar, o arquivo já precisa estar aberto por link (o sistema não abre arquivos particulares de ninguém)
function liberarArquivo_(id) {
  let f;
  try { f = DriveApp.getFileById(id); } catch (e) { throw new Error('Não consegui abrir uma das artes no Drive.'); }
  if (!publicoPorLink_(f)) throw new Error('Uma das artes está particular no Drive. Compartilhe como "Qualquer pessoa com o link".');
}
function publicoPorLink_(item) {
  try { const a = item.getSharingAccess(); return a === DriveApp.Access.ANYONE_WITH_LINK || a === DriveApp.Access.ANYONE; } catch (e) { return false; }
}
const urlImagem_ = id => 'https://lh3.googleusercontent.com/d/' + id;
const urlVideo_ = id => 'https://drive.google.com/uc?export=download&confirm=t&id=' + id;

function esperarContainer_(d, cid) {
  const b = igBase_(d);
  for (let i = 0; i < 40; i++) {
    const j = instaGet_(b.host + cid + '?fields=status_code&access_token=' + encodeURIComponent(d.token));
    if (j.status_code === 'FINISHED' || !j.status_code) return;
    if (j.status_code === 'ERROR' || j.status_code === 'EXPIRED') throw new Error('O Instagram não aceitou o arquivo (confira o formato e o tamanho do vídeo).');
    Utilities.sleep(6000);
  }
  throw new Error('O Instagram demorou demais para processar o vídeo. Tente de novo.');
}
// midias: [{id, tipo}], modo: feed | story
function publicarNoInsta_(marcaId, midias, legenda, modo) {
  const d = instaDados_(marcaId);
  if (!d) throw new Error('O Instagram desta marca não está conectado.');
  if (!midias.length) throw new Error('Não há arte para publicar. Puxe as artes da pasta ou cole a imagem de prévia.');
  const b = igBase_(d), tok = d.token, url = b.host + b.conta + '/media';
  midias.forEach(m => liberarArquivo_(m.id));
  const midia = (m, extra) => Object.assign(m.tipo === 'video' ? { video_url: urlVideo_(m.id) } : { image_url: urlImagem_(m.id) }, extra, { access_token: tok });
  let cid;
  if (modo === 'story') {
    cid = igPost_(url, midia(midias[0], { media_type: 'STORIES' })).id;
    if (midias[0].tipo === 'video') esperarContainer_(d, cid);
  } else if (midias.length === 1) {
    const m = midias[0];
    cid = igPost_(url, midia(m, m.tipo === 'video' ? { media_type: 'REELS', caption: legenda || '' } : { caption: legenda || '' })).id;
    if (m.tipo === 'video') esperarContainer_(d, cid);
  } else {
    const filhos = midias.slice(0, 10).map(m => {
      const id = igPost_(url, midia(m, m.tipo === 'video' ? { media_type: 'VIDEO', is_carousel_item: 'true' } : { is_carousel_item: 'true' })).id;
      if (m.tipo === 'video') esperarContainer_(d, id);
      return id;
    });
    cid = igPost_(url, { media_type: 'CAROUSEL', children: filhos.join(','), caption: legenda || '', access_token: tok }).id;
    esperarContainer_(d, cid);
  }
  const pub = igPost_(b.host + b.conta + '/media_publish', { creation_id: cid, access_token: tok });
  let link = '';
  try { link = instaGet_(b.host + pub.id + '?fields=permalink&access_token=' + encodeURIComponent(tok)).permalink || ''; } catch (e) {}
  CacheService.getScriptCache().remove('igm_' + marcaId);
  return { id: pub.id, link: link };
}
function midiasDaPauta_(p) {
  const l = (p.midias || []).filter(m => m.id).map(m => ({ id: m.id, tipo: m.tipo === 'video' ? 'video' : 'imagem' }));
  if (l.length) return l;
  const id = idDrive_(p.capa) || idDrive_(p.criativo);
  return id ? [{ id: id, tipo: p.formato === 'Vídeo' ? 'video' : 'imagem' }] : [];
}
function midiasDoStory_(x) {
  const id = idDrive_(x.midia);
  return id ? [{ id: id, tipo: /v[ií]deo/i.test(x.tipo || '') ? 'video' : 'imagem' }] : [];
}
function quandoISO_(dataBR, hora) {
  const m = String(dataBR || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/), h = String(hora || '').match(/^(\d{1,2}):(\d{2})$/);
  return m && h ? new Date(+m[3], +m[2] - 1, +m[1], +h[1], +h[2]).getTime() : 0;
}
// publica uma postagem ou um story e registra o resultado na planilha
function publicarRegistro_(tipo, id, por) {
  if (tipo === 'story') {
    const x = ler_(ABA_STORIES, CAMPOS_STORY).filter(s => s.id === String(id))[0];
    if (!x) throw erro_('server', 'Story não encontrado.');
    try {
      const r = publicarNoInsta_(x.marcaId, midiasDoStory_(x), '', 'story');
      comTrava_(() => { const y = ler_(ABA_STORIES, CAMPOS_STORY).filter(s => s.id === x.id)[0]; if (!y) return; y.status = 'Postado'; y.autoPub = ''; y.pubInfo = 'Publicado ' + (por ? 'por ' + por : 'automaticamente') + ' em ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM HH:mm'); y.atualizado = Date.now(); gravar_(ABA_STORIES, CAMPOS_STORY, y); });
      return r;
    } catch (e) {
      comTrava_(() => { const y = ler_(ABA_STORIES, CAMPOS_STORY).filter(s => s.id === x.id)[0]; if (!y) return; y.autoPub = ''; y.pubInfo = 'Não publicou: ' + String(e.message || e).slice(0, 300); gravar_(ABA_STORIES, CAMPOS_STORY, y); });
      throw erro_('insta', String(e.message || e));
    }
  }
  const p = pautaPorId_(id);
  if (!p) throw erro_('server', 'Postagem não encontrada.');
  const modo = p.agTipo === 'Story' ? 'story' : 'feed';
  try {
    const r = publicarNoInsta_(p.marcaId, midiasDaPauta_(p), p.legenda, modo);
    comTrava_(() => {
      const q = pautaPorId_(id);
      const hist = q.historico.concat([{ em: Date.now(), por: por || 'Sistema', uid: '', acao: 'Publicou no Instagram' + (por ? '' : ' automaticamente'), de: q.status, para: 'Postado' }]);
      setPauta_(id, { status: 'Postado', postLink: r.link, igMidia: r.id, autoPub: '', pubInfo: 'Publicado em ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM HH:mm'), historico: JSON.stringify(hist), atualizado: String(Date.now()) });
    });
    return r;
  } catch (e) {
    comTrava_(() => setPauta_(id, { autoPub: '', pubInfo: 'Não publicou: ' + String(e.message || e).slice(0, 300) }));
    throw erro_('insta', String(e.message || e));
  }
}
function comTrava_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}
function publicarAgora_(eu, id, tipo) {
  limite_('pub_' + eu.id, 10, 3600, 'Muitas publicações seguidas. Tente de novo em uma hora.');
  if (tipo === 'story') {
    const x = ler_(ABA_STORIES, CAMPOS_STORY).filter(s => s.id === String(id))[0];
    if (!x || !podeEditar_(eu, x.marcaId)) throw erro_('permissao', 'Você não pode publicar os stories desta marca.');
    if (x.status === 'Postado') throw erro_('server', 'Este story já foi publicado.');
  } else {
    const p = pautaPorId_(id);
    if (!p || !podeEditar_(eu, p.marcaId)) throw erro_('permissao', 'Você não pode publicar postagens desta marca.');
    if (['Aprovado', 'Agendado'].indexOf(p.status) < 0) throw erro_('server', 'Só dá para publicar depois de aprovado.');
  }
  const r = publicarRegistro_(tipo === 'story' ? 'story' : 'post', id, eu.nome);
  return { link: r.link };
}
function autoPubDefinir_(eu, id, tipo, ligar) {
  if (tipo === 'story') {
    const x = ler_(ABA_STORIES, CAMPOS_STORY).filter(s => s.id === String(id))[0];
    if (!x || !podeEditar_(eu, x.marcaId)) throw erro_('permissao', 'Sem permissão.');
    x.autoPub = ligar ? 'sim' : ''; x.pubInfo = ligar ? 'Aguardando o horário' : ''; gravar_(ABA_STORIES, CAMPOS_STORY, x);
    return;
  }
  const p = pautaPorId_(id);
  if (!p || !podeEditar_(eu, p.marcaId)) throw erro_('permissao', 'Sem permissão.');
  if (ligar && p.status !== 'Agendado') throw erro_('server', 'Agende a postagem primeiro.');
  setPauta_(id, { autoPub: ligar ? 'sim' : '', pubInfo: ligar ? 'Aguardando o horário' : '' });
}
// roda sozinho a cada 15 minutos (gatilho criado pelo configurar)
function publicarAgendados() {
  const agora = Date.now(), fila = [];
  ler_(ABA_PAUTAS, CAMPOS_PAUTA).forEach(p => {
    if (p.autoPub !== 'sim' || normStatus_(p.status) !== 'Agendado') return;
    const q = String(p.agQuando || '').match(/^(\S+)\s+(\d{1,2}:\d{2})$/);
    const t = q ? quandoISO_(q[1], q[2]) : 0;
    if (t && t <= agora) fila.push(['post', p.id]);
  });
  ler_(ABA_STORIES, CAMPOS_STORY).forEach(x => {
    if (x.autoPub !== 'sim' || x.status === 'Postado') return;
    const t = quandoISO_(x.data, x.hora || '09:00');
    if (t && t <= agora) fila.push(['story', x.id]);
  });
  fila.slice(0, 4).forEach(f => { try { publicarRegistro_(f[0], f[1], ''); } catch (e) { Logger.log('Publicação ' + f.join(' ') + ': ' + e.message); } });
}

/* ---------- Resultados dos posts publicados (curtidas, comentários, alcance, salvos) ---------- */
function codigoPost_(link) {
  const m = String(link || '').match(/instagram\.com\/(?:[\w.]+\/)?(?:p|reel|reels|tv)\/([\w-]+)/i);
  return m ? m[1] : '';
}
function metricas_(eu, marcaId, mes, forcar) {
  if (!acesso_(eu, marcaId)) throw erro_('permissao', 'Sem acesso a esta marca.');
  const d = instaDados_(marcaId);
  if (!d) return { conectado: false };
  mes = /^\d{4}-\d{2}$/.test(mes || '') ? mes : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
  const cache = CacheService.getScriptCache(), chave = 'met_' + marcaId + '_' + mes;
  if (!forcar) { const c = cache.get(chave); if (c) return JSON.parse(c); }
  const pautas = ler_(ABA_PAUTAS, CAMPOS_PAUTA).filter(p => p.marcaId === marcaId && paraISO_(p.data).indexOf(mes) === 0);
  const comLink = pautas.filter(p => p.igMidia || codigoPost_(p.postLink));
  const b = igBase_(d), tok = encodeURIComponent(d.token);
  // posts do Instagram desde o começo do mês (até 4 páginas de 50)
  const midias = [];
  let url = b.host + b.conta + '/media?fields=id,permalink,like_count,comments_count,timestamp,media_type,media_product_type&limit=50&access_token=' + tok;
  try {
    for (let i = 0; i < 4 && url; i++) {
      const j = instaGet_(url);
      (j.data || []).forEach(x => midias.push(x));
      const ult = (j.data || [])[(j.data || []).length - 1];
      url = j.paging && j.paging.next && ult && String(ult.timestamp).slice(0, 7) >= mes ? j.paging.next : '';
    }
  } catch (e) {
    return { conectado: true, erro: String(e.message || e) };
  }
  const itens = [];
  comLink.forEach(p => {
    const cod = codigoPost_(p.postLink);
    const m = midias.filter(x => x.id === p.igMidia || (cod && codigoPost_(x.permalink) === cod))[0];
    if (!m) return;
    const it = { pautaId: p.id, link: m.permalink, curtidas: Number(m.like_count) || 0, comentarios: Number(m.comments_count) || 0, alcance: null, salvos: null, compart: null };
    const tentar = ['reach,saved,shares', 'reach,saved', 'reach'];
    for (let i = 0; i < tentar.length; i++) {
      try {
        const ins = instaGet_(b.host + m.id + '/insights?metric=' + tentar[i] + '&access_token=' + tok);
        (ins.data || []).forEach(v => {
          const val = v.values && v.values[0] ? Number(v.values[0].value) || 0 : Number(v.total_value && v.total_value.value) || 0;
          if (v.name === 'reach') it.alcance = val; if (v.name === 'saved') it.salvos = val; if (v.name === 'shares') it.compart = val;
        });
        break;
      } catch (e) { /* métrica não disponível para este tipo de post: tenta menos */ }
    }
    itens.push(it);
  });
  const res = { conectado: true, mes: mes, itens: itens, semLink: pautas.filter(p => normStatus_(p.status) === 'Postado' && !p.igMidia && !codigoPost_(p.postLink)).length, em: Date.now() };
  try { cache.put(chave, JSON.stringify(res), 3600); } catch (e) {}
  return res;
}

/* ---------- Resumo diário por e-mail (segunda a sexta, de manhã) ---------- */
function resumoDiario() {
  const tz = Session.getScriptTimeZone(), hoje = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const dow = new Date().getDay();
  if (dow === 0 || dow === 6) return;
  const site = site_() || '';
  const pautas = ler_(ABA_PAUTAS, CAMPOS_PAUTA).map(pautaParaSite_);
  const tarefas = ler_(ABA_TAREFAS, CAMPOS_TAREFA).map(tarefaParaSite_);
  const stories = ler_(ABA_STORIES, CAMPOS_STORY).map(storyParaSite_);
  const agendaTudo = ler_(ABA_AGENDA, CAMPOS_AGENDA).map(eventoParaSite_);
  const agendaHoje = agendaTudo.filter(x => x.data === hoje);
  const ddmm = hoje.slice(8, 10) + '/' + hoje.slice(5, 7), aniversariosHoje = [];
  ler_(ABA_USUARIOS, CAMPOS_USUARIO).forEach(x => { if (x.ativo === 'sim' && x.aniversario === ddmm) aniversariosHoje.push({ nome: x.nome, empresaId: x.empresaId }); });
  ler_(ABA_MARCAS, CAMPOS_MARCA).forEach(m => ((parseJSON_(m.perfil, {}) || {}).aniversarios || []).forEach(a => { if (a && a.data === ddmm) aniversariosHoje.push({ nome: a.nome, marca: m.nome, marcaId: m.id }); }));
  const agendaPend = agendaTudo.filter(x => x.status === 'solicitada' && x.data >= hoje);
  const nomes = {}; ler_(ABA_MARCAS, CAMPOS_MARCA).forEach(m => nomes[m.id] = m.nome);
  const nomeM = id => nomes[id] || '';
  const ANTES_ARTE = ['Ideia', 'Em validação', 'Validação do cliente', 'Ideia reprovada', 'Em produção', 'Ajustes solicitados'];
  const FEITO = ['Aprovado', 'Agendado', 'Postado'];
  const pessoas = ler_(ABA_USUARIOS, CAMPOS_USUARIO).map(publicoUsuario_)
    .filter(u => u.ativo && u.notificar && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(u.login));
  pessoas.forEach(u => {
    const secoes = [];
    const titulo = p => (p.produto ? p.produto + ': ' : '') + (p.postagem || 'Postagem') + ' · ' + nomeM(p.marcaId) + (p.data ? ' · ' + paraBR_(p.data).slice(0, 5) : '');
    const add = (t, l) => { if (l.length) secoes.push([t, l]); };
    if (u.papel === 'cliente') {
      add('Esperando a sua aprovação', pautas.filter(p => ['Validação do cliente', 'Aprovação do cliente'].indexOf(p.status) >= 0 && acesso_(u, p.marcaId)).map(titulo));
    } else {
      if (u.papel === 'aprovador' || u.papel === 'gestor')
        add('Para você validar ou aprovar', pautas.filter(p => ['Em validação', 'Em aprovação'].indexOf(p.status) >= 0 && podeAprovar_(u, p.marcaId)).map(titulo));
      if (u.papel === 'social' || u.papel === 'gestor') {
        add('Devolvidos para ajuste', pautas.filter(p => ['Ideia reprovada', 'Ajustes solicitados'].indexOf(p.status) >= 0 && podeEditar_(u, p.marcaId)).map(p => titulo(p) + (p.motivo ? ' — "' + p.motivo + '"' : '')));
        add('Prazo da arte vencido ou vencendo hoje', pautas.filter(p => p.prazoArte && p.prazoArte <= hoje && ANTES_ARTE.indexOf(p.status) >= 0 && podeEditar_(u, p.marcaId)).map(p => titulo(p) + ' (arte até ' + paraBR_(p.prazoArte).slice(0, 5) + ')'));
        add('Prazo da aprovação vencido ou vencendo hoje', pautas.filter(p => p.prazoAprovacao && p.prazoAprovacao <= hoje && FEITO.indexOf(p.status) < 0 && ANTES_ARTE.indexOf(p.status) < 0 && podeEditar_(u, p.marcaId)).map(p => titulo(p) + ' (aprovar até ' + paraBR_(p.prazoAprovacao).slice(0, 5) + ')'));
        add('Posts de hoje ainda não agendados', pautas.filter(p => p.data === hoje && ['Agendado', 'Postado'].indexOf(p.status) < 0 && podeEditar_(u, p.marcaId)).map(titulo));
        const st = stories.filter(x => x.data === hoje && x.status !== 'Postado' && podeEditar_(u, x.marcaId));
        if (st.length) add('Stories de hoje', [st.length + ' story(s) planejado(s): ' + st.map(x => (x.hora ? x.hora + ' ' : '') + (x.titulo || x.tipo || 'story') + ' · ' + nomeM(x.marcaId)).join('; ')]);
      }
      if (TODAS_MARCAS.indexOf(u.papel) >= 0) {
        const atras = pautas.filter(p => acesso_(u, p.marcaId) && (p.prazoArte && p.prazoArte < hoje && ANTES_ARTE.indexOf(p.status) >= 0) || (p.data && p.data < hoje && ['Postado'].indexOf(p.status) < 0 && p.data >= somaDias_(hoje, -14)));
        if (atras.length) add('Atrasados na agência', atras.slice(0, 20).map(titulo));
      }
    }
    if (u.papel !== 'cliente') add('🎂 Aniversários de hoje', aniversariosHoje.filter(a => a.marcaId ? acesso_(u, a.marcaId) : a.empresaId === u.empresaId).map(a => a.nome + (a.marca ? ' (' + a.marca + ')' : '')));
    if (TODAS_MARCAS.indexOf(u.papel) >= 0) add('💰 Cobranças vencidas ou vencendo hoje', cobrancas_(hoje, u.empresaId || '-').filter(c => c.vence <= hoje).map(c => c.marca + ' · ' + c.valorTxt + ' · vence ' + paraBR_(c.vence).slice(0, 5)));
    add('Suas reuniões de hoje', agendaHoje.filter(x => x.tipo === 'reuniao' && x.status === 'confirmada' && participa_(u, x)).map(x => (x.hora || '') + ' · ' + x.titulo + ' (' + duracaoTxt_(x.duracao) + ')'));
    if (VEEM_TODAS.indexOf(u.papel) >= 0) add('Pedidos de reunião esperando resposta', agendaPend.filter(x => x.empresaId === u.empresaId && (participa_(u, x) || TODAS_MARCAS.indexOf(u.papel) >= 0)).map(x => x.criadoPor + ': ' + x.titulo + ' (' + paraBR_(x.data).slice(0, 5) + ')'));
    add('Suas tarefas para hoje ou atrasadas', tarefas.filter(t => t.status !== 'Feita' && t.responsavelId === u.id && ((t.prazo && t.prazo <= hoje) || (t.data && t.data <= hoje))).map(t => t.titulo + (t.prazo ? ' (até ' + paraBR_(t.prazo).slice(0, 5) + ')' : '')));
    if (!secoes.length || MailApp.getRemainingDailyQuota() < 1) return;
    const link = site ? (u.papel === 'cliente' ? site + '#entrar=' + criarLink_(u.id) : site + (u.papel === 'cliente' ? '#aprovacoes' : '#tarefas')) : '';
    const html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1d1d1f;max-width:560px">' +
      '<h2 style="margin:0 0 4px;font-size:22px;font-weight:600">Bom dia, ' + escH_(u.nome.split(' ')[0]) + '!</h2>' +
      '<p style="margin:0 0 16px;color:#6b6b70">O que pede a sua atenção hoje:</p>' +
      secoes.map(s => '<h3 style="margin:16px 0 6px;font-size:15px">' + escH_(s[0]) + ' (' + s[1].length + ')</h3><ul style="margin:0;padding-left:18px">' + s[1].slice(0, 15).map(l => '<li style="margin:3px 0">' + escH_(l) + '</li>').join('') + '</ul>').join('') +
      (link ? '<p style="margin:20px 0"><a href="' + link + '" style="background:#1d1d1f;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">' + (u.papel === 'cliente' ? 'Ver e aprovar' : 'Abrir o sistema') + '</a></p>' : '') +
      '<p style="margin:0;color:#6b6b70;font-size:12px">Resumo diário do ' + NOME_APP + '. Para não receber, desligue os e-mails em "Minha conta".</p></div>';
    MailApp.sendEmail({ to: u.login, subject: '☀️ Seu dia: ' + secoes.map(s => s[1].length + ' ' + s[0].toLowerCase()).slice(0, 2).join(', '), htmlBody: html, name: NOME_APP });
  });
}

/* ---------- Cópia de segurança semanal da planilha (guarda as 8 últimas) ---------- */
function backupSemanal() {
  try { const lim = Date.now() - 365 * 864e5, aba = aba_(ABA_AUDITORIA, CAMPOS_AUDITORIA); const v = ler_(ABA_AUDITORIA, CAMPOS_AUDITORIA); const velhos = v.filter(x => Number(x.em) < lim).length; if (velhos && aba.getLastRow() > velhos + 1) aba.deleteRows(2, velhos); } catch (e) { Logger.log(e); }
  try { limparLixeira_(); } catch (e) { Logger.log(e); }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pasta = pasta_(DriveApp.getRootFolder(), 'Planejamento de Conteúdo - Cópias de segurança');
  const nome = ss.getName() + ' - cópia ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  DriveApp.getFileById(ss.getId()).makeCopy(nome, pasta);
  const arqs = [], it = pasta.getFiles();
  while (it.hasNext()) arqs.push(it.next());
  arqs.sort((a, b) => b.getDateCreated() - a.getDateCreated()).slice(8).forEach(f => f.setTrashed(true));
}

/* ---------- Gatilhos automáticos (criados ao rodar "configurar") ---------- */
function instalarGatilhos_() {
  const nomes = ['resumoDiario', 'backupSemanal', 'publicarAgendados', 'relatorioMensal', 'limpezaDiaria'];
  ScriptApp.getProjectTriggers().forEach(t => { if (nomes.indexOf(t.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('resumoDiario').timeBased().everyDays(1).atHour(8).create();
  ScriptApp.newTrigger('backupSemanal').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(3).create();
  ScriptApp.newTrigger('publicarAgendados').timeBased().everyMinutes(15).create();
  ScriptApp.newTrigger('relatorioMensal').timeBased().onMonthDay(1).atHour(9).create();
  ScriptApp.newTrigger('limpezaDiaria').timeBased().everyDays(1).atHour(3).create();
}

/* ======================================================================
 * Novidades 2026-11-03.2: aprovação em lote, melhor horário, relatório mensal ao cliente
 * ====================================================================== */

/* ---------- Aprovar (ou validar) várias postagens de uma vez ---------- */
function acaoLote_(eu, ids, acao, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  const a = ACOES[acao];
  if (!a || a.motivo || a.agenda) throw erro_('server', 'Esta etapa não pode ser feita em lote.');
  const coletor = {}, feitas = [], falhas = [];
  ids.slice(0, 60).forEach(id => {
    try { acaoPauta_(eu, id, acao, '', '', {}, site, coletor); feitas.push(id); }
    catch (e) { falhas.push(String(e.message || e)); }
  });
  // um e-mail por pessoa com a lista
  const base = /^https:\/\//.test(String(site || '')) ? String(site).split('#')[0] : '';
  Object.keys(coletor).forEach(k => {
    const c = coletor[k];
    if (MailApp.getRemainingDailyQuota() < 1) return;
    const link = base ? (c.u.papel === 'cliente' ? base + '#entrar=' + criarLink_(c.u.id) : base + '#aprovacoes') : '';
    MailApp.sendEmail({
      to: c.u.login, name: NOME_APP,
      subject: c.av.titulo + ' (' + c.itens.length + (c.itens.length === 1 ? ' post)' : ' posts)'),
      htmlBody: '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1d1d1f;max-width:560px">' +
        '<h2 style="margin:0 0 14px;font-size:22px;font-weight:600">' + escH_(c.av.titulo) + '</h2>' +
        '<p style="margin:0 0 10px"><b>' + escH_(eu.nome) + '</b> ' + escH_(c.av.frase) + ':</p>' +
        '<ul style="margin:0 0 18px;padding-left:18px">' + c.itens.map(t => '<li style="margin:3px 0">' + escH_(t) + '</li>').join('') + '</ul>' +
        (link ? '<p><a href="' + link + '" style="background:#1d1d1f;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">' + (c.u.papel === 'cliente' ? 'Ver e aprovar' : 'Abrir o sistema') + '</a></p>' : '') + '</div>'
    });
  });
  return { feitas: feitas.length, falhas: falhas };
}

/* ---------- Melhor horário para postar ----------
 * Usa o engajamento dos últimos posts (curtidas + comentários por dia da semana e faixa de horário)
 * e, quando a conta permite, os horários em que os seguidores ficam online. */
const FAIXAS_HORA = [[6, 9], [9, 12], [12, 15], [15, 18], [18, 21], [21, 24]];
function melhorHorario_(eu, marcaId, forcar) {
  if (!acesso_(eu, marcaId)) throw erro_('permissao', 'Sem acesso a esta marca.');
  const d = instaDados_(marcaId);
  if (!d) return { conectado: false };
  const cache = CacheService.getScriptCache(), chave = 'mh_' + marcaId;
  if (!forcar) { const c = cache.get(chave); if (c) return JSON.parse(c); }
  const b = igBase_(d), tok = encodeURIComponent(d.token);
  let midias = [];
  try {
    let url = b.host + b.conta + '/media?fields=id,like_count,comments_count,timestamp&limit=50&access_token=' + tok;
    for (let i = 0; i < 2 && url; i++) { const j = instaGet_(url); midias = midias.concat(j.data || []); url = j.paging && j.paging.next; }
  } catch (e) { return { conectado: true, erro: String(e.message || e) }; }
  const grade = Array.from({ length: 7 }, () => FAIXAS_HORA.map(() => ({ soma: 0, n: 0 })));
  midias.forEach(m => {
    const t = new Date(m.timestamp);
    if (isNaN(t)) return;
    const h = t.getHours(), f = FAIXAS_HORA.findIndex(x => h >= x[0] && h < x[1]);
    if (f < 0) return;
    const c = grade[t.getDay()][f]; c.soma += (Number(m.like_count) || 0) + (Number(m.comments_count) || 0) * 2; c.n++;
  });
  const celulas = [];
  grade.forEach((l, dia) => l.forEach((c, f) => { if (c.n) celulas.push({ dia: dia, faixa: f, media: Math.round(c.soma / c.n), n: c.n }); }));
  celulas.sort((x, y) => y.media - x.media);
  let online = null;
  try {
    const j = instaGet_(b.host + (d.tipo === 'fb' ? d.igId : 'me') + '/insights?metric=online_followers&period=lifetime&access_token=' + tok);
    const v = j.data && j.data[0] && j.data[0].values && j.data[0].values[0] && j.data[0].values[0].value;
    if (v && typeof v === 'object') online = Array.from({ length: 24 }, (_, h) => Number(v[h] || v[String(h)]) || 0);
  } catch (e) { /* nem toda conta tem essa métrica */ }
  const res = {
    conectado: true, posts: midias.length, faixas: FAIXAS_HORA,
    grade: grade.map(l => l.map(c => c.n ? Math.round(c.soma / c.n) : null)),
    contagem: grade.map(l => l.map(c => c.n)),
    top: celulas.slice(0, 3), online: online, em: Date.now()
  };
  try { cache.put(chave, JSON.stringify(res), 43200); } catch (e) {}
  return res;
}

/* ---------- Relatório do mês para o cliente (e-mail com PDF) ---------- */
function relatorioHtml_(marcaId, mes) {
  const sistema = { id: '', nome: 'Sistema', papel: 'admin', marcas: ['*'] };
  const m = ler_(ABA_MARCAS, CAMPOS_MARCA).filter(x => x.id === marcaId)[0];
  if (!m) throw erro_('server', 'Marca não encontrada.');
  const pautas = ler_(ABA_PAUTAS, CAMPOS_PAUTA).filter(p => p.marcaId === marcaId && paraISO_(p.data).indexOf(mes) === 0).map(pautaParaSite_)
    .sort((a, b) => a.data.localeCompare(b.data));
  const stories = ler_(ABA_STORIES, CAMPOS_STORY).filter(x => x.marcaId === marcaId && paraISO_(x.data).indexOf(mes) === 0);
  const postados = pautas.filter(p => p.status === 'Postado');
  let met = null;
  try { met = metricas_(sistema, marcaId, mes, false); } catch (e) {}
  const porId = {};
  if (met && met.itens) met.itens.forEach(it => porId[it.pautaId] = it);
  const soma = k => met && met.itens ? met.itens.reduce((s, it) => s + (Number(it[k]) || 0), 0) : null;
  const n = v => v == null ? '—' : Number(v).toLocaleString('pt-BR');
  const nomeMes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][Number(mes.slice(5, 7)) - 1] + ' de ' + mes.slice(0, 4);
  const kpi = (v, l) => '<td style="padding:12px;background:#f2f2f0;border-radius:10px;text-align:center"><div style="font-size:24px;font-weight:700">' + v + '</div><div style="font-size:12px;color:#6b6b70">' + l + '</div></td>';
  const top = met && met.itens ? met.itens.slice().sort((a, b) => (b.curtidas + b.comentarios + (b.salvos || 0) * 2) - (a.curtidas + a.comentarios + (a.salvos || 0) * 2)).slice(0, 3) : [];
  const tituloP = p => (p.produto ? p.produto + ': ' : '') + (p.postagem || 'Postagem');
  const html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1d1d1f;max-width:640px">' +
    '<p style="margin:0;color:#6b6b70;font-size:12px;letter-spacing:.08em;text-transform:uppercase">Relatório do mês</p>' +
    '<h1 style="margin:4px 0 16px;font-size:26px">' + escH_(m.nome) + ' · ' + escH_(nomeMes) + '</h1>' +
    '<table style="border-collapse:separate;border-spacing:8px;width:100%;margin:0 -8px 10px"><tr>' + kpi(pautas.length, 'posts planejados') + kpi(postados.length, 'posts publicados') + kpi(stories.filter(x => x.status === 'Postado').length, 'stories publicados') + '</tr>' +
    (met && met.itens && met.itens.length ? '<tr>' + kpi(n(soma('curtidas')), 'curtidas') + kpi(n(soma('alcance')), 'alcance') + kpi(n(soma('salvos')), 'salvamentos') + '</tr>' : '') + '</table>' +
    (top.length ? '<h3 style="margin:18px 0 8px">Destaques</h3><ol style="margin:0;padding-left:18px">' + top.map(it => { const p = pautas.filter(x => x.id === it.pautaId)[0]; return p ? '<li style="margin:4px 0"><a href="' + escH_(it.link) + '" style="color:#1d1d1f">' + escH_(tituloP(p)) + '</a> — ' + n(it.curtidas) + ' curtidas, ' + n(it.comentarios) + ' comentários' + (it.salvos != null ? ', ' + n(it.salvos) + ' salvamentos' : '') + '</li>' : ''; }).join('') + '</ol>' : '') +
    '<h3 style="margin:18px 0 8px">Posts do mês</h3><table style="border-collapse:collapse;width:100%;font-size:13px"><tr style="text-align:left;color:#6b6b70"><th style="padding:6px 4px;border-bottom:1px solid #ddd">Data</th><th style="padding:6px 4px;border-bottom:1px solid #ddd">Post</th><th style="padding:6px 4px;border-bottom:1px solid #ddd">Situação</th><th style="padding:6px 4px;border-bottom:1px solid #ddd;text-align:right">Curtidas</th></tr>' +
    pautas.map(p => '<tr><td style="padding:6px 4px;border-bottom:1px solid #eee">' + paraBR_(p.data).slice(0, 5) + '</td><td style="padding:6px 4px;border-bottom:1px solid #eee">' + (p.postLink ? '<a href="' + escH_(p.postLink) + '" style="color:#1d1d1f">' + escH_(tituloP(p)) + '</a>' : escH_(tituloP(p))) + '</td><td style="padding:6px 4px;border-bottom:1px solid #eee">' + escH_(p.status) + '</td><td style="padding:6px 4px;border-bottom:1px solid #eee;text-align:right">' + (porId[p.id] ? n(porId[p.id].curtidas) : '') + '</td></tr>').join('') + '</table>' +
    '</div>';
  return { html: html, nome: m.nome, nomeMes: nomeMes };
}
function enviarRelatorio_(eu, marcaId, mes, site) {
  limite_('rel_' + eu.id, 10, 3600, 'Muitos relatórios enviados agora. Tente de novo em uma hora.');
  site = site_(); // endereço oficial; o do pedido é ignorado
  if (!podeEditar_(eu, marcaId)) throw erro_('permissao', 'Só quem alimenta a marca envia o relatório.');
  if (!/^\d{4}-\d{2}$/.test(mes || '')) throw erro_('server', 'Mês inválido.');
  return mandarRelatorio_(marcaId, mes, eu, site);
}
function mandarRelatorio_(marcaId, mes, eu, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  const r = relatorioHtml_(marcaId, mes);
  const clientes = ler_(ABA_USUARIOS, CAMPOS_USUARIO).map(publicoUsuario_)
    .filter(u => u.ativo && u.papel === 'cliente' && u.marcas.indexOf('*') < 0 && u.marcas.indexOf(marcaId) >= 0 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(u.login));
  if (!clientes.length) throw erro_('server', 'Esta marca não tem aprovador do cliente com e-mail cadastrado.');
  let pdf = null;
  try { pdf = Utilities.newBlob(r.html, 'text/html', 'relatorio.html').getAs('application/pdf').setName('Relatório ' + r.nome + ' - ' + r.nomeMes + '.pdf'); } catch (e) {}
  const base = String(site || site_() || '').split('#')[0];
  clientes.forEach(u => {
    if (MailApp.getRemainingDailyQuota() < 1) return;
    const link = /^https?:\/\//.test(base) ? base + '#entrar=' + criarLink_(u.id) : '';
    const o = {
      to: u.login, name: NOME_APP, subject: '📊 Relatório de ' + r.nomeMes + ' · ' + r.nome,
      htmlBody: '<p style="font-family:Arial,sans-serif;font-size:15px">Olá, ' + escH_(u.nome.split(' ')[0]) + '! Aqui está o resumo de ' + escH_(r.nomeMes) + (pdf ? ' (também em PDF, em anexo)' : '') + '.</p>' + r.html +
        (link ? '<p style="font-family:Arial,sans-serif;margin-top:18px"><a href="' + link + '" style="background:#1d1d1f;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">Ver o calendário</a></p>' : '')
    };
    if (eu && /@/.test(eu.login || '')) o.replyTo = eu.login;
    if (pdf) o.attachments = [pdf];
    MailApp.sendEmail(o);
  });
  return { enviados: clientes.map(u => u.nome) };
}
// roda sozinho no dia 1, às 9h: manda o relatório do mês anterior das marcas que pediram envio automático
function relatorioMensal() {
  const hoje = new Date(), ant = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const mes = ant.getFullYear() + '-' + ('0' + (ant.getMonth() + 1)).slice(-2);
  ler_(ABA_MARCAS, CAMPOS_MARCA).forEach(m => {
    if (!(parseJSON_(m.perfil, {}) || {}).relatorioAuto) return;
    try { mandarRelatorio_(m.id, mes, null, ''); } catch (e) { Logger.log('Relatório ' + m.nome + ': ' + e.message); }
  });
  try { pedirAvaliacoes_(mes); } catch (e) { Logger.log('Avaliações: ' + e.message); }
}

/* ======================================================================
 * Novidades 2026-11-05: agenda (reuniões, pedidos de reunião, atividades) e cores pessoais
 * ====================================================================== */

// só aceita cores no formato #rrggbb e chaves conhecidas
function limparCores_(c) {
  const ok = ['destaque', 'cabecalho', 'calendario', 's-ideia', 's-validacao', 's-cliente', 's-ajustes', 's-producao', 's-aprovacao', 's-aprovado', 's-agendado', 's-postado', 's-reuniao', 's-atividade'];
  const o = {};
  Object.keys(c || {}).forEach(k => { if (ok.indexOf(k) >= 0 && /^#[0-9a-fA-F]{6}$/.test(String(c[k]))) o[k] = String(c[k]); });
  return o;
}

/* ---------- Agenda ----------
 * tipo reuniao: quem é da gestão (admin, diretor, gestor) marca direto; os outros mandam um pedido
 *   (status "solicitada") que a gestão aceita (pode mudar dia e hora) ou recusa com motivo.
 * tipo atividade: compromisso pessoal; só a própria pessoa vê. */
const chefe_ = u => VEEM_TODAS.indexOf(u.papel) >= 0;
function eventoParaSite_(x) {
  x.data = paraISO_(x.data);
  x.duracao = Number(x.duracao) || 60;
  x.participantes = parseJSON_(x.participantes, []);
  x.respostas = parseJSON_(x.respostas, {});
  x.criado = Number(x.criado) || 0;
  x.atualizado = Number(x.atualizado) || 0;
  return x;
}
function participa_(u, x) {
  const parts = Array.isArray(x.participantes) ? x.participantes : parseJSON_(x.participantes, []);
  return x.criadoPorId === u.id || parts.indexOf(u.id) >= 0;
}
function veEvento_(eu, x) {
  if (!mesmaEmp_(eu, x.empresaId)) return false;
  if (x.tipo === 'atividade') return x.criadoPorId === eu.id;
  if (participa_(eu, x)) return true;
  // a direção vê todas as reuniões; o gestor vê os pedidos para poder responder
  return TODAS_MARCAS.indexOf(eu.papel) >= 0 || (eu.papel === 'gestor' && x.status === 'solicitada');
}
function duracaoTxt_(min) {
  min = Number(min) || 60;
  const h = Math.floor(min / 60), m = min % 60;
  return (h ? h + 'h' : '') + (m ? (h ? ('0' + m).slice(-2) : m + ' min') : '');
}
function eventoPorId_(id) {
  const x = ler_(ABA_AGENDA, CAMPOS_AGENDA).filter(e => e.id === String(id))[0];
  return x ? eventoParaSite_(x) : null;
}
function gravarEvento_(x) {
  const o = Object.assign({}, x, { data: paraBR_(x.data), participantes: JSON.stringify(x.participantes || []), respostas: JSON.stringify(x.respostas || {}) });
  gravar_(ABA_AGENDA, CAMPOS_AGENDA, o);
}
function salvarEvento_(eu, ev, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  const atual = ev.id ? eventoPorId_(ev.id) : null;
  if (ev.id && !atual) throw erro_('server', 'Compromisso não encontrado. Atualize a página.');
  const tipo = atual ? atual.tipo : (ev.tipo === 'atividade' ? 'atividade' : 'reuniao');
  if (atual && !mesmaEmp_(eu, atual.empresaId)) throw erro_('permissao', 'Compromisso de outra empresa.');
  if (atual && atual.criadoPorId !== eu.id && !(tipo === 'reuniao' && chefe_(eu))) throw erro_('permissao', 'Só quem criou (ou a gestão) altera este compromisso.');
  if (eu.papel === 'cliente') throw erro_('permissao', 'O cliente não marca reuniões por aqui.');
  const data = String(ev.data || ''), hora = String(ev.hora || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw erro_('server', 'Escolha o dia.');
  if (!/^\d{1,2}:\d{2}$/.test(hora)) throw erro_('server', 'Escolha o horário.');
  const titulo = String(ev.titulo || '').trim().slice(0, 200);
  if (!titulo) throw erro_('server', tipo === 'reuniao' ? 'Escreva o assunto da reunião.' : 'Escreva o que é a atividade.');
  const duracao = Math.max(5, Math.min(600, parseInt(ev.duracao, 10) || 60));
  const empEv = atual ? atual.empresaId : eu.empresaId;
  if (!empEv) throw erro_('server', 'Escolha a empresa no topo antes de marcar.');
  const ativos = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(u => u.ativo === 'sim' && u.empresaId === empEv).map(u => u.id);
  let parts = tipo === 'reuniao' ? (Array.isArray(ev.participantes) ? ev.participantes : []).map(String).filter(id => ativos.indexOf(id) >= 0 && id !== eu.id) : [];
  parts = parts.filter((id, i) => parts.indexOf(id) === i).slice(0, 50);
  if (tipo === 'reuniao' && !parts.length) throw erro_('server', 'Escolha quem participa da reunião.');
  // quem não é da gestão: vira pedido (ou continua pedido ao editar)
  let status = 'confirmada';
  if (tipo === 'reuniao' && !chefe_(eu)) status = 'solicitada';
  if (atual && atual.status === 'confirmada' && tipo === 'reuniao' && !chefe_(eu)) status = 'solicitada';
  const x = {
    id: atual ? atual.id : Utilities.getUuid().slice(0, 13), tipo: tipo, status: tipo === 'atividade' ? 'confirmada' : status,
    titulo: titulo, data: data, hora: hora, duracao: duracao, participantes: parts,
    local: String(ev.local || '').trim().slice(0, 500), descricao: String(ev.descricao || '').slice(0, 3000),
    respostas: atual ? (atual.data !== data || atual.hora !== hora ? {} : atual.respostas) : {}, motivo: '',
    cor: /^#[0-9a-fA-F]{6}$/.test(ev.cor || '') ? ev.cor : (atual ? atual.cor : ''), marcaId: String(ev.marcaId || (atual ? atual.marcaId : '') || ''),
    criadoPorId: atual ? atual.criadoPorId : eu.id, criadoPor: atual ? atual.criadoPor : eu.nome,
    criado: atual ? atual.criado : Date.now(), atualizado: Date.now(), decididoPor: atual ? atual.decididoPor : (status === 'confirmada' ? eu.nome : ''),
    empresaId: empEv
  };
  x.meet = ev.meet ? 'sim' : (atual ? atual.meet : '');
  x.gcal = atual ? atual.gcal : '';
  if (tipo === 'reuniao' && x.status === 'confirmada') sincronizarGcal_(x);
  gravarEvento_(x);
  if (tipo === 'reuniao') {
    try {
      if (x.status === 'solicitada') avisarEvento_(eu, x, 'pedido', site);
      else avisarEvento_(eu, x, atual ? 'alterada' : 'marcada', site);
    } catch (e) { Logger.log('Aviso de reunião: ' + e); }
  }
  return x.id;
}
// resposta: aceitar ou recusar um pedido (gestão); sim / nao / talvez (participante)
function responderEvento_(eu, id, resposta, motivo, dados, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  const x = eventoPorId_(id);
  if (x && !mesmaEmp_(eu, x.empresaId)) throw erro_('permissao', 'Reunião de outra empresa.');
  if (!x || x.tipo !== 'reuniao') throw erro_('server', 'Reunião não encontrada. Atualize a página.');
  if (resposta === 'aceitar' || resposta === 'recusar') {
    if (!chefe_(eu)) throw erro_('permissao', 'Só a gestão aceita ou recusa pedidos de reunião.');
    if (x.status !== 'solicitada') throw erro_('server', 'Este pedido já foi respondido.');
    if (resposta === 'recusar') {
      motivo = String(motivo || '').trim();
      if (!motivo) throw erro_('server', 'Escreva o motivo (ou sugira outro horário).');
      x.status = 'recusada'; x.motivo = motivo.slice(0, 1000);
    } else {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dados.data || '')) x.data = dados.data;
      if (/^\d{1,2}:\d{2}$/.test(dados.hora || '')) x.hora = dados.hora;
      if (parseInt(dados.duracao, 10) > 0) x.duracao = Math.min(600, parseInt(dados.duracao, 10));
      x.status = 'confirmada'; x.motivo = '';
      if (x.participantes.indexOf(eu.id) < 0 && x.criadoPorId !== eu.id) x.participantes.push(eu.id);
      x.respostas[eu.id] = 'sim';
      sincronizarGcal_(x);
    }
    x.decididoPor = eu.nome; x.atualizado = Date.now();
    gravarEvento_(x);
    try { avisarEvento_(eu, x, resposta === 'aceitar' ? 'aceita' : 'recusada', site); } catch (e) { Logger.log(e); }
    return;
  }
  if (['sim', 'nao', 'talvez'].indexOf(resposta) < 0) throw erro_('server', 'Resposta inválida.');
  if (!participa_(eu, x)) throw erro_('permissao', 'Você não está nesta reunião.');
  x.respostas[eu.id] = resposta; x.atualizado = Date.now();
  gravarEvento_(x);
}
function excluirEvento_(eu, id, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  const x = eventoPorId_(id);
  if (!x) return;
  if (!mesmaEmp_(eu, x.empresaId)) throw erro_('permissao', 'Compromisso de outra empresa.');
  if (x.criadoPorId !== eu.id && !(x.tipo === 'reuniao' && chefe_(eu))) throw erro_('permissao', 'Só quem criou (ou a gestão) cancela este compromisso.');
  excluirLinha_(ABA_AGENDA, CAMPOS_AGENDA, id);
  if (x.gcal) apagarGcal_(x.gcal);
  if (x.tipo === 'reuniao' && x.status === 'confirmada') { try { avisarEvento_(eu, x, 'cancelada', site); } catch (e) { Logger.log(e); } }
}
// arquivo .ics: abre direto no Google Agenda, Outlook ou no calendário do celular
function icsDe_(x) {
  const m = x.data.match(/^(\d{4})-(\d{2})-(\d{2})$/), h = x.hora.match(/^(\d{1,2}):(\d{2})$/);
  const ini = new Date(+m[1], +m[2] - 1, +m[3], +h[1], +h[2]), fim = new Date(ini.getTime() + x.duracao * 60000);
  const f = d => Utilities.formatDate(d, 'UTC', "yyyyMMdd'T'HHmmss'Z'");
  const t = s => String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Planejamento de Conteudo//PT-BR', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    'UID:' + x.id + '@planejamento', 'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(ini), 'DTEND:' + f(fim),
    'SUMMARY:' + t(x.titulo), 'DESCRIPTION:' + t(x.descricao), 'LOCATION:' + t(x.local), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}
function avisarEvento_(eu, x, tipo, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  const pessoas = ler_(ABA_USUARIOS, CAMPOS_USUARIO).map(publicoUsuario_).filter(u => u.ativo && u.notificar && u.id !== eu.id && u.empresaId === x.empresaId && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(u.login));
  let dest = [];
  if (tipo === 'pedido') {
    // vai para quem da gestão está na reunião; se não tiver ninguém, para a direção
    dest = pessoas.filter(u => chefe_(u) && x.participantes.indexOf(u.id) >= 0);
    if (!dest.length) dest = pessoas.filter(u => TODAS_MARCAS.indexOf(u.papel) >= 0);
  } else if (tipo === 'aceita' || tipo === 'recusada') {
    dest = pessoas.filter(u => u.id === x.criadoPorId || (tipo === 'aceita' && x.participantes.indexOf(u.id) >= 0));
  } else {
    dest = pessoas.filter(u => x.participantes.indexOf(u.id) >= 0 || u.id === x.criadoPorId);
  }
  if (!dest.length || MailApp.getRemainingDailyQuota() < dest.length) return;
  const titulos = { pedido: '🙋 Pedido de reunião', marcada: '📅 Reunião marcada', alterada: '🔁 Reunião alterada', aceita: '✅ Reunião confirmada', recusada: '❌ Pedido de reunião recusado', cancelada: '🚫 Reunião cancelada' };
  const frases = { pedido: 'pediu uma reunião', marcada: 'marcou uma reunião com você', alterada: 'alterou a reunião', aceita: 'confirmou a reunião', recusada: 'recusou o pedido de reunião', cancelada: 'cancelou a reunião' };
  const nomes = {}; ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(u => u.empresaId === x.empresaId).forEach(u => nomes[u.id] = u.nome);
  const quem = [x.criadoPor].concat(x.participantes.map(id => nomes[id]).filter(String)).filter((n, i, a) => n && a.indexOf(n) === i);
  const dia = DIAS[parse_(x.data).getDay()] + ', ' + paraBR_(x.data);
  const link = /^https:\/\//.test(String(site || '')) ? String(site).split('#')[0] + '#agenda' : '';
  const linha = (k, v) => v ? '<tr><td style="padding:4px 12px 4px 0;color:#6b6b70;vertical-align:top">' + k + '</td><td style="padding:4px 0">' + escH_(v) + '</td></tr>' : '';
  const html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1d1d1f;max-width:560px">' +
    '<h2 style="margin:0 0 14px;font-size:22px;font-weight:600">' + titulos[tipo] + '</h2>' +
    '<p style="margin:0 0 12px"><b>' + escH_(eu.nome) + '</b> ' + frases[tipo] + ':</p>' +
    '<p style="margin:0 0 12px;font-size:18px"><b>' + escH_(x.titulo) + '</b></p>' +
    (x.motivo ? '<div style="border-left:4px solid #b3362f;background:#fbeeed;padding:10px 14px;margin:0 0 14px"><b style="color:#b3362f">Motivo</b><br>' + escH_(x.motivo) + '</div>' : '') +
    '<table style="border-collapse:collapse;font-size:14px;margin:0 0 18px">' + linha('Quando', dia + ' às ' + x.hora) + linha('Duração', duracaoTxt_(x.duracao)) + linha('Participantes', quem.join(', ')) + linha('Local / link', x.local) + linha('Pauta', x.descricao) + '</table>' +
    (link ? '<p><a href="' + link + '" style="background:#1d1d1f;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">' + (tipo === 'pedido' ? 'Responder o pedido' : 'Ver na agenda') + '</a></p>' : '') +
    (['marcada', 'alterada', 'aceita'].indexOf(tipo) >= 0 ? '<p style="margin:0;color:#6b6b70;font-size:12px">O convite vai em anexo: abra para colocar no seu Google Agenda ou no calendário do celular.</p>' : '') + '</div>';
  const anexo = ['marcada', 'alterada', 'aceita'].indexOf(tipo) >= 0 && !x.gcal ? [Utilities.newBlob(icsDe_(x), 'text/calendar', 'reuniao.ics')] : null;
  dest.forEach(u => { const o = { to: u.login, subject: titulos[tipo] + ': ' + x.titulo + ' · ' + paraBR_(x.data).slice(0, 5) + ' ' + x.hora, htmlBody: html, name: NOME_APP }; if (anexo) o.attachments = anexo; MailApp.sendEmail(o); });
}
function parse_(isoData) {
  const m = String(isoData || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date();
}

/* ======================================================================
 * Novidades 2026-11-05.2: ata da reunião, horários livres, banco de horas, mural de avisos
 * ====================================================================== */

/* ---------- Ata: o que foi decidido vira tarefa ---------- */
function salvarAta_(eu, id, ata, tarefas, enviar, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  const x = eventoPorId_(id);
  if (x && !mesmaEmp_(eu, x.empresaId)) throw erro_('permissao', 'Reunião de outra empresa.');
  if (!x || x.tipo !== 'reuniao') throw erro_('server', 'Reunião não encontrada.');
  if (!participa_(eu, x) && TODAS_MARCAS.indexOf(eu.papel) < 0) throw erro_('permissao', 'Só quem participou escreve a ata.');
  x.ata = String(ata || '').slice(0, 10000); x.ataPor = eu.nome; x.atualizado = Date.now();
  gravarEvento_(x);
  const criadas = [];
  (tarefas || []).slice(0, 30).forEach(t => {
    if (!String(t.titulo || '').trim()) return;
    salvarTarefa_(eu, { titulo: t.titulo, responsavelId: t.responsavelId || '', prazo: t.prazo || '', prioridade: t.prioridade || 'Média', marcaId: x.marcaId && acesso_(eu, x.marcaId) ? x.marcaId : '', descricao: 'Da reunião "' + x.titulo + '" de ' + paraBR_(x.data) + '.' }, site);
    criadas.push(t.titulo);
  });
  if (enviar && x.ata.trim()) {
    const pessoas = ler_(ABA_USUARIOS, CAMPOS_USUARIO).map(publicoUsuario_).filter(u => u.ativo && u.id !== eu.id && participa_(u, x) && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(u.login));
    if (pessoas.length && MailApp.getRemainingDailyQuota() >= pessoas.length) {
      const html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1d1d1f;max-width:560px"><h2 style="margin:0 0 6px;font-size:22px">📝 Ata: ' + escH_(x.titulo) + '</h2>' +
        '<p style="margin:0 0 14px;color:#6b6b70">' + paraBR_(x.data) + ' às ' + x.hora + ' · escrita por ' + escH_(eu.nome) + '</p>' +
        '<div style="white-space:pre-wrap;background:#f2f2f0;border-radius:10px;padding:12px 14px">' + escH_(x.ata) + '</div>' +
        (criadas.length ? '<h3 style="margin:16px 0 6px;font-size:15px">Tarefas criadas</h3><ul>' + criadas.map(t => '<li>' + escH_(t) + '</li>').join('') + '</ul>' : '') + '</div>';
      pessoas.forEach(u => MailApp.sendEmail({ to: u.login, subject: '📝 Ata da reunião: ' + x.titulo, htmlBody: html, name: NOME_APP }));
    }
  }
}

/* ---------- Horários ocupados de cada pessoa num dia (sem mostrar o que é) ---------- */
function horariosLivres_(eu, ids, data) {
  if (eu.papel === 'cliente') throw erro_('permissao', 'Sem acesso.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data || '')) throw erro_('server', 'Dia inválido.');
  const todos = ler_(ABA_AGENDA, CAMPOS_AGENDA).map(eventoParaSite_).filter(x => x.data === data && x.status !== 'recusada');
  const ocupado = {}, daEmpresa = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(u => mesmaEmp_(eu, u.empresaId)).map(u => u.id);
  ids.concat([eu.id]).filter(uid => daEmpresa.indexOf(uid) >= 0).slice(0, 50).forEach(uid => {
    ocupado[uid] = todos.filter(x => (x.tipo === 'atividade' ? x.criadoPorId === uid : participa_({ id: uid }, x)) && !(x.tipo === 'reuniao' && x.respostas[uid] === 'nao'))
      .map(x => { const p = x.hora.split(':'); const ini = +p[0] * 60 + +p[1]; return [ini, ini + x.duracao]; });
  });
  return { ocupado: ocupado };
}

/* ---------- Banco de horas ---------- */
function veHora_(eu, h) {
  if (!mesmaEmp_(eu, h.empresaId)) return false;
  return h.uid === eu.id || TODAS_MARCAS.indexOf(eu.papel) >= 0 || (eu.papel === 'gestor' && h.marcaId && acesso_(eu, h.marcaId));
}
function salvarHora_(eu, h) {
  if (eu.papel === 'cliente') throw erro_('permissao', 'Sem acesso.');
  const atual = h.id ? ler_(ABA_HORAS, CAMPOS_HORA).filter(x => x.id === String(h.id))[0] : null;
  if (atual && (!mesmaEmp_(eu, atual.empresaId) || (atual.uid !== eu.id && TODAS_MARCAS.indexOf(eu.papel) < 0))) throw erro_('permissao', 'Só quem lançou altera estas horas.');
  const marcaId = String(h.marcaId || '');
  if (marcaId && !acesso_(eu, marcaId)) throw erro_('permissao', 'Sem acesso a esta marca.');
  const min = Math.round(Number(h.minutos) || 0);
  if (min < 1 || min > 24 * 60) throw erro_('server', 'Coloque um tempo entre 1 minuto e 24 horas.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(h.data || '')) throw erro_('server', 'Escolha o dia.');
  const id = atual ? atual.id : Utilities.getUuid().slice(0, 13);
  gravar_(ABA_HORAS, CAMPOS_HORA, { id: id, uid: atual ? atual.uid : eu.id, nome: atual ? atual.nome : eu.nome, marcaId: marcaId, marca: marcaId ? nomeDaMarca_(marcaId) : '', data: paraBR_(h.data), minutos: min, descricao: String(h.descricao || '').slice(0, 500), criado: atual ? atual.criado : Date.now(), empresaId: atual ? atual.empresaId : (marcaId ? empresaDe_(marcaId) : eu.empresaId) });
  return id;
}
function excluirHora_(eu, id) {
  const x = ler_(ABA_HORAS, CAMPOS_HORA).filter(h => h.id === String(id))[0];
  if (!x) return;
  if (!mesmaEmp_(eu, x.empresaId) || (x.uid !== eu.id && TODAS_MARCAS.indexOf(eu.papel) < 0)) throw erro_('permissao', 'Só quem lançou apaga estas horas.');
  excluirLinha_(ABA_HORAS, CAMPOS_HORA, id);
}

/* ---------- Mural de avisos ---------- */
function avisoParaSite_(a) {
  a.criado = Number(a.criado) || 0; a.lidos = parseJSON_(a.lidos, []); a.importante = a.importante === 'sim'; a.fixado = a.fixado === 'sim'; a.ate = paraISO_(a.ate);
  return a;
}
function salvarAviso_(eu, a, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  if (VEEM_TODAS.indexOf(eu.papel) < 0) throw erro_('permissao', 'Só a gestão publica no mural.');
  const atual = a.id ? ler_(ABA_MURAL, CAMPOS_AVISO).filter(x => x.id === String(a.id))[0] : null;
  if (atual && !mesmaEmp_(eu, atual.empresaId)) throw erro_('permissao', 'Aviso de outra empresa.');
  if (!atual && !eu.empresaId) throw erro_('server', 'Escolha a empresa no topo antes de publicar.');
  const titulo = String(a.titulo || '').trim().slice(0, 150), texto = String(a.texto || '').slice(0, 4000);
  if (!titulo) throw erro_('server', 'Escreva o título do aviso.');
  const id = atual ? atual.id : Utilities.getUuid().slice(0, 13);
  gravar_(ABA_MURAL, CAMPOS_AVISO, { id: id, titulo: titulo, texto: texto, importante: a.importante ? 'sim' : '', fixado: a.fixado ? 'sim' : '', ate: paraBR_(/^\d{4}-\d{2}-\d{2}$/.test(a.ate || '') ? a.ate : ''), por: atual ? atual.por : eu.nome, uid: atual ? atual.uid : eu.id, criado: atual ? atual.criado : Date.now(), lidos: atual ? atual.lidos : JSON.stringify([eu.id]), empresaId: atual ? atual.empresaId : eu.empresaId });
  if (!atual && a.importante) {
    try {
      const base = /^https:\/\//.test(String(site || '')) ? String(site).split('#')[0] + '#mural' : '';
      const pessoas = ler_(ABA_USUARIOS, CAMPOS_USUARIO).map(publicoUsuario_).filter(u => u.ativo && u.notificar && u.papel !== 'cliente' && u.id !== eu.id && u.empresaId === eu.empresaId && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(u.login));
      if (MailApp.getRemainingDailyQuota() >= pessoas.length) pessoas.forEach(u => MailApp.sendEmail({ to: u.login, name: NOME_APP, subject: '📌 Aviso: ' + titulo,
        htmlBody: '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1d1d1f;max-width:560px"><h2 style="margin:0 0 10px;font-size:22px">📌 ' + escH_(titulo) + '</h2><div style="white-space:pre-wrap">' + escH_(texto) + '</div><p style="color:#6b6b70;font-size:13px">' + escH_(eu.nome) + '</p>' + (base ? '<p><a href="' + base + '" style="background:#1d1d1f;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">Ver o mural</a></p>' : '') + '</div>' }));
    } catch (e) { Logger.log(e); }
  }
  return id;
}
function excluirAviso_(eu, id) {
  const x = ler_(ABA_MURAL, CAMPOS_AVISO).filter(a => a.id === String(id))[0];
  if (!x || !mesmaEmp_(eu, x.empresaId)) return;
  if (x.uid !== eu.id && TODAS_MARCAS.indexOf(eu.papel) < 0) throw erro_('permissao', 'Só quem publicou (ou a direção) apaga o aviso.');
  excluirLinha_(ABA_MURAL, CAMPOS_AVISO, id);
}
function lerAviso_(eu, ids) {
  const aba = aba_(ABA_MURAL, CAMPOS_AVISO);
  ler_(ABA_MURAL, CAMPOS_AVISO).forEach(a => {
    if (ids.indexOf(a.id) < 0 || !mesmaEmp_(eu, a.empresaId)) return;
    const l = parseJSON_(a.lidos, []);
    if (l.indexOf(eu.id) >= 0) return;
    l.push(eu.id);
    const r = linhaDoId_(aba, a.id);
    if (r) aba.getRange(r, colunaDe_(CAMPOS_AVISO, 'lidos')).setValue(JSON.stringify(l));
  });
  mexeu_();
}

/* ======================================================================
 * Novidades 2026-11-06: importar conteúdo do mês, trends, copiar mês, lixeira, briefing do cliente,
 * avaliação mensal, financeiro e checklist de cliente novo
 * ====================================================================== */

/* ---------- Importar o documento do conteúdo do mês ---------- */
function textoDoDrive_(id) {
  const tok = { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() };
  let mt = '', arq = null;
  try { arq = DriveApp.getFileById(id); mt = arq.getMimeType(); } catch (e) { throw erro_('server', 'Não consegui abrir o arquivo. Confira se ele está compartilhado como "Qualquer pessoa com o link".'); }
  if (!publicoPorLink_(arq)) throw erro_('permissao', 'Esse documento é particular. No Drive, compartilhe como "Qualquer pessoa com o link" e tente de novo.');
  let docId = id, temp = '';
  if (mt !== MimeType.GOOGLE_DOCS) {
    // .docx ou outro: converte numa cópia temporária em Google Docs
    const c = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + id + '/copy', { method: 'post', contentType: 'application/json', headers: tok, payload: JSON.stringify({ mimeType: MimeType.GOOGLE_DOCS, name: 'tmp-importacao' }), muteHttpExceptions: true });
    const j = parseJSON_(c.getContentText(), {});
    if (!j.id) throw erro_('server', 'Não consegui converter o arquivo. Use um Google Docs ou um .docx.');
    docId = temp = j.id;
  }
  const r = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + docId + '/export?mimeType=text/plain', { headers: tok, muteHttpExceptions: true });
  if (temp) { try { DriveApp.getFileById(temp).setTrashed(true); } catch (e) {} }
  if (r.getResponseCode() !== 200) throw erro_('server', 'Não consegui ler o documento.');
  return r.getContentText().replace(/^﻿/, '');
}
function lerConteudo_(eu, link) {
  limite_('doc_' + eu.id, 30, 3600, 'Muitas leituras de documento agora. Tente de novo em uma hora.');
  if (['cliente', 'aprovador'].indexOf(eu.papel) >= 0) throw erro_('permissao', 'Sem permissão.');
  const m = String(link || '').match(/\/d\/([\w-]{20,})/) || String(link || '').match(/[?&]id=([\w-]{20,})/);
  if (!m) throw erro_('server', 'Cole o link do documento (Google Docs ou .docx no Drive).');
  return { texto: textoDoDrive_(m[1]).slice(0, 200000) };
}
function importarPostagens_(eu, marcaId, posts) {
  if (!podeEditar_(eu, marcaId)) throw erro_('permissao', 'Você não pode criar postagens nesta marca.');
  const ok = ['data', 'postagem', 'formato', 'legenda', 'observacao', 'objetivo', 'cta', 'pauta', 'fase', 'produto', 'rede', 'gravacao', 'inspiracao'];
  return posts.slice(0, 80).map(p => {
    const o = { marcaId: marcaId };
    ok.forEach(k => { if (p[k] != null) o[k] = String(p[k]).slice(0, k === 'legenda' || k === 'observacao' ? 8000 : 500); });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(o.data || '')) o.data = '';
    if (o.data) { o.prazoArte = somaDias_(o.data, -5); o.prazoAprovacao = somaDias_(o.data, -2); }
    return salvarPauta_(eu, o);
  });
}

/* ---------- Trends da semana (planilha que a agência já mantém) ---------- */
function lerTrends_(eu) {
  if (eu.papel === 'cliente') throw erro_('permissao', 'Sem acesso.');
  const link = PropertiesService.getScriptProperties().getProperty('trends_' + eu.empresaId);
  if (!link) return { configurado: false };
  const cache = CacheService.getScriptCache(), c = cache.get('trends_' + eu.empresaId);
  if (c) return JSON.parse(c);
  const m = String(link).match(/\/d\/([\w-]{20,})/);
  let ss;
  try { if (!publicoPorLink_(DriveApp.getFileById(m ? m[1] : link))) throw new Error('particular'); ss = SpreadsheetApp.openById(m ? m[1] : link); } catch (e) { return { configurado: true, erro: 'Não consegui abrir a planilha de trends. Confira o link e se a conta dona do sistema tem acesso.' }; }
  const itens = [];
  ss.getSheets().forEach(aba => {
    const v = aba.getDataRange().getDisplayValues();
    if (v.length < 2) return;
    const cab = v[0].map(h => String(h).toLowerCase());
    const col = re => cab.findIndex(h => re.test(h));
    const cN = col(/trend|nome|t[íi]tulo/), cL = col(/link|v[íi]deo|url/), cP = col(/por que|porque|motivo|alta|descri/), cR = col(/rede|plataforma/), cD = col(/data|semana/);
    v.slice(1).forEach(l => {
      const nome = String(l[cN >= 0 ? cN : 0] || '').trim();
      if (!nome) return;
      itens.push({ nome: nome.slice(0, 200), link: cL >= 0 ? String(l[cL] || '').trim() : '', porque: cP >= 0 ? String(l[cP] || '').slice(0, 600) : '', rede: cR >= 0 ? String(l[cR] || '') : '', data: cD >= 0 ? String(l[cD] || '') : aba.getName() });
    });
  });
  const res = { configurado: true, itens: itens.slice(-40).reverse() };
  try { cache.put('trends_' + eu.empresaId, JSON.stringify(res), 1800); } catch (e) {}
  return res;
}

/* ---------- Copiar a estrutura de um mês para outro ---------- */
function copiarMes_(eu, marcaId, de, para) {
  if (!podeEditar_(eu, marcaId)) throw erro_('permissao', 'Você não pode criar postagens nesta marca.');
  if (!/^\d{4}-\d{2}$/.test(de || '') || !/^\d{4}-\d{2}$/.test(para || '') || de === para) throw erro_('server', 'Escolha os meses.');
  const origem = ler_(ABA_PAUTAS, CAMPOS_PAUTA).map(pautaParaSite_).filter(p => p.marcaId === marcaId && p.data.indexOf(de) === 0);
  if (!origem.length) throw erro_('server', 'O mês de origem não tem postagens.');
  const [ay, am] = para.split('-').map(Number), ultimo = new Date(ay, am, 0).getDate();
  // mesmo dia da semana e mesma semana do mês (ex.: 2ª terça); se não existir, a última daquele dia da semana
  const destino = iso => {
    const d = parse_(iso), dow = d.getDay(), n = Math.ceil(d.getDate() / 7);
    const dias = []; for (let i = 1; i <= ultimo; i++) if (new Date(ay, am - 1, i).getDay() === dow) dias.push(i);
    const dia = dias[Math.min(n, dias.length) - 1];
    return para + '-' + ('0' + dia).slice(-2);
  };
  origem.forEach(p => {
    const data = destino(p.data);
    salvarPauta_(eu, { marcaId: marcaId, data: data, formato: p.formato, fase: p.fase, produto: p.produto, rede: p.rede, objetivo: p.objetivo, cta: p.cta, gravacao: p.gravacao,
      postagem: '', observacao: 'Mês anterior (' + paraBR_(p.data).slice(0, 5) + '): ' + (p.postagem || p.pauta || ''), prazoArte: somaDias_(data, -5), prazoAprovacao: somaDias_(data, -2) });
  });
  return origem.length;
}

/* ---------- Lixeira (30 dias) ---------- */
function paraLixeira_(eu, tipo, linha, titulo) {
  if (!linha) return;
  gravar_(ABA_LIXEIRA, CAMPOS_LIXEIRA, { id: Utilities.getUuid().slice(0, 13), tipo: tipo, itemId: linha.id, marcaId: linha.marcaId, titulo: String(titulo || '').slice(0, 200), dados: JSON.stringify(linha), por: eu.nome, em: Date.now() });
}
function lixeira_(eu) {
  const lim = Date.now() - 30 * 864e5;
  return ler_(ABA_LIXEIRA, CAMPOS_LIXEIRA).filter(x => Number(x.em) >= lim && podeEditar_(eu, x.marcaId))
    .map(x => { const d = parseJSON_(x.dados, {}); return { id: x.id, tipo: x.tipo, marcaId: x.marcaId, titulo: x.titulo, data: paraISO_(d.data), por: x.por, em: Number(x.em) }; })
    .sort((a, b) => b.em - a.em);
}
function restaurar_(eu, id) {
  const x = ler_(ABA_LIXEIRA, CAMPOS_LIXEIRA).filter(l => l.id === String(id))[0];
  if (!x) throw erro_('server', 'Item não está mais na lixeira.');
  if (!podeEditar_(eu, x.marcaId)) throw erro_('permissao', 'Sem permissão nesta marca.');
  const d = parseJSON_(x.dados, null);
  if (!d) throw erro_('server', 'Não consegui recuperar.');
  if (x.tipo === 'story') gravar_(ABA_STORIES, CAMPOS_STORY, d);
  else {
    const h = parseJSON_(d.historico, []); h.push({ em: Date.now(), por: eu.nome, uid: eu.id, acao: 'Recuperou da lixeira' }); d.historico = JSON.stringify(h);
    gravar_(ABA_PAUTAS, CAMPOS_PAUTA, d);
  }
  excluirLinha_(ABA_LIXEIRA, CAMPOS_LIXEIRA, id);
}
function limparLixeira_() {
  const lim = Date.now() - 30 * 864e5;
  ler_(ABA_LIXEIRA, CAMPOS_LIXEIRA).filter(x => Number(x.em) < lim).forEach(x => excluirLinha_(ABA_LIXEIRA, CAMPOS_LIXEIRA, x.id));
}

/* ---------- Briefing do cliente novo (link público, sem login) ---------- */
const CAMPOS_BRIEFING = ['instagram', 'site', 'segmento', 'cidade', 'desde', 'canais', 'ticket', 'responsavel', 'historia', 'proposito', 'diferenciais', 'carroChefe',
  'pResumo', 'pIdade', 'pGenero', 'pLocal', 'pClasse', 'pMomento', 'pValores', 'pHorarios', 'tom', 'palavrasUsar', 'palavrasEvitar', 'naoFazer', 'concorrentes', 'referencias', 'cores', 'fontes', 'estiloFoto', 'datasImportantes', 'expectativas'];
function briefingLink_(eu, marcaId, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  if (!podeEditar_(eu, marcaId)) throw erro_('permissao', 'Só quem alimenta a marca gera o briefing.');
  const chave = Utilities.getUuid().replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty('brf_' + chave, JSON.stringify({ marcaId: marcaId, exp: Date.now() + 30 * 864e5, por: eu.nome, uid: eu.id }));
  site = String(site || site_() || '').split('#')[0];
  return { url: site + '#briefing=' + chave };
}
function briefingDe_(chave) {
  const raw = chave ? PropertiesService.getScriptProperties().getProperty('brf_' + String(chave).replace(/\W/g, '')) : null;
  const b = raw ? parseJSON_(raw, null) : null;
  if (!b || b.exp < Date.now()) throw erro_('briefing', 'Este link de briefing expirou ou não existe. Peça um novo para a agência.');
  return b;
}
function briefingVer_(chave) {
  const b = briefingDe_(chave);
  const m = ler_(ABA_MARCAS, CAMPOS_MARCA).filter(x => x.id === b.marcaId)[0];
  if (!m) throw erro_('briefing', 'Marca não encontrada.');
  const pf = parseJSON_(m.perfil, {}) || {}, atuais = {};
  CAMPOS_BRIEFING.forEach(k => { if (pf[k]) atuais[k] = pf[k]; });
  return { marca: m.nome, agencia: b.por, atuais: atuais, produtos: String(m.produtos || '').split('\n').filter(String), enviado: pf.briefingEm || 0 };
}
function briefingArquivo_(chave, req) {
  const b = briefingDe_(chave);
  limite_('brfup_' + String(chave).slice(0, 40), 15, 21600, 'Limite de arquivos do briefing atingido. Mande o resto pela agência.');
  const a = arquivoSeguro_(req.base64, 20, false);
  const pasta = pasta_(pasta_(DriveApp.getRootFolder(), PASTA_ARQUIVOS), nomeDaMarca_(b.marcaId) || 'Sem marca');
  const f = pasta.createFile(Utilities.newBlob(a.bytes, a.mime, nomeArquivo_(req.nome)));
  try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  return { url: f.getUrl(), driveId: f.getId() };
}
function briefingEnviar_(chave, d, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  const b = briefingDe_(chave);
  const m = ler_(ABA_MARCAS, CAMPOS_MARCA).filter(x => x.id === b.marcaId)[0];
  if (!m) throw erro_('briefing', 'Marca não encontrada.');
  const pf = parseJSON_(m.perfil, {}) || {};
  CAMPOS_BRIEFING.forEach(k => { const v = String((d.campos || {})[k] || '').trim(); if (v) pf[k] = v.slice(0, 4000); });
  pf.briefingEm = Date.now(); pf.briefingNome = String(d.nome || '').slice(0, 100);
  const pe = d.persona || {};
  if (['dores', 'desejos', 'objecoes'].some(k => String(pe[k] || '').trim())) {
    pf.personas = (Array.isArray(pf.personas) ? pf.personas : []).concat([{ nome: 'Cliente ideal (do briefing)', dores: String(pe.dores || '').slice(0, 2000), desejos: String(pe.desejos || '').slice(0, 2000), objecoes: String(pe.objecoes || '').slice(0, 2000) }]);
  }
  const produtos = String(m.produtos || '').split('\n').filter(String);
  (d.produtos || []).forEach(p => { p = String(p || '').trim().slice(0, 120); if (p && produtos.indexOf(p) < 0) produtos.push(p); });
  const arquivos = parseJSON_(m.arquivos, []);
  (d.arquivos || []).slice(0, 20).forEach(a => { if (a && a.url && !/^https:\/\/drive\.google\.com\//.test(urlSegura_(a.url))) return; if (a && a.url) arquivos.push({ id: 'b' + Date.now().toString(36) + Math.floor(Math.random() * 1e4), tipo: a.tipo || 'Outros', nome: String(a.nome || 'Arquivo').slice(0, 120), nota: 'Enviado pelo cliente no briefing', data: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'), url: a.url, driveId: a.driveId || '' }); });
  gravar_(ABA_MARCAS, CAMPOS_MARCA, Object.assign({}, m, { produtos: produtos.join('\n'), perfil: JSON.stringify(pf), arquivos: JSON.stringify(arquivos) }));
  // acessos vão para o cofre da marca, fora da planilha
  const acs = (d.acessos || []).filter(a => a && (a.usuario || a.email || a.senha)).slice(0, 20);
  if (acs.length) {
    const props = PropertiesService.getScriptProperties(), atual = parseJSON_(props.getProperty('cred_' + b.marcaId), null) || {};
    const lista = (atual.acessos || []).concat(acs.map(a => ({ plataforma: String(a.plataforma || '').slice(0, 100), usuario: String(a.usuario || '').slice(0, 200), email: String(a.email || '').slice(0, 200), senha: String(a.senha || '').slice(0, 200), chave: '', obs: 'Enviado pelo cliente no briefing' })));
    props.setProperty('cred_' + b.marcaId, JSON.stringify({ acessos: lista, por: 'Cliente (briefing)', em: Date.now() }));
  }
  // avisa quem gerou o link
  try {
    const u = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(x => x.id === b.uid)[0];
    if (u && /@/.test(u.login) && MailApp.getRemainingDailyQuota() > 0) {
      const base = String(site || site_() || '').split('#')[0];
      MailApp.sendEmail({ to: u.login, name: NOME_APP, subject: '📋 Briefing recebido: ' + m.nome,
        htmlBody: '<div style="font-family:Arial,sans-serif;font-size:15px"><h2>📋 Briefing de ' + escH_(m.nome) + ' recebido</h2><p>' + escH_(d.nome || 'O cliente') + ' preencheu o briefing. As respostas já estão na área da marca (Sobre, Público-alvo, Produtos, Arquivos e Acessos).</p>' + (base ? '<p><a href="' + base + '#marca" style="background:#1d1d1f;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">Ver a marca</a></p>' : '') + '</div>' });
    }
  } catch (e) { Logger.log(e); }
  return { ok: true };
}

/* ---------- Avaliação mensal do cliente ---------- */
function avaliar_(eu, marcaId, mes, nota, comentario) {
  if (eu.papel !== 'cliente' || !acesso_(eu, marcaId)) throw erro_('permissao', 'Só o cliente da marca avalia.');
  nota = parseInt(nota, 10);
  if (!(nota >= 0 && nota <= 10)) throw erro_('server', 'Escolha uma nota de 0 a 10.');
  if (!/^\d{4}-\d{2}$/.test(mes || '')) throw erro_('server', 'Mês inválido.');
  const atual = ler_(ABA_AVALIACOES, CAMPOS_AVALIACAO).filter(a => a.marcaId === marcaId && a.mes === mes && a.uid === eu.id)[0];
  gravar_(ABA_AVALIACOES, CAMPOS_AVALIACAO, { id: atual ? atual.id : Utilities.getUuid().slice(0, 13), marcaId: marcaId, marca: nomeDaMarca_(marcaId), mes: mes, uid: eu.id, nome: eu.nome, nota: nota, comentario: String(comentario || '').slice(0, 2000), em: Date.now() });
  // nota baixa: avisa a direção na hora
  if (nota <= 6) {
    try {
      const dir = ler_(ABA_USUARIOS, CAMPOS_USUARIO).map(publicoUsuario_).filter(u => u.ativo && TODAS_MARCAS.indexOf(u.papel) >= 0 && u.empresaId === empresaDe_(marcaId) && /@/.test(u.login));
      dir.forEach(u => MailApp.sendEmail({ to: u.login, name: NOME_APP, subject: '⚠️ Nota ' + nota + ' de ' + eu.nome + ' (' + nomeDaMarca_(marcaId) + ')', htmlBody: '<p style="font-family:Arial,sans-serif;font-size:15px"><b>' + escH_(eu.nome) + '</b> deu nota <b>' + nota + '</b> para ' + mes + '.<br><br>' + escH_(comentario || '(sem comentário)') + '</p>' }));
    } catch (e) { Logger.log(e); }
  }
}
function pedirAvaliacoes_(mes) {
  const site = site_() || '';
  ler_(ABA_USUARIOS, CAMPOS_USUARIO).map(publicoUsuario_).filter(u => u.ativo && u.papel === 'cliente' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(u.login) && u.marcas.indexOf('*') < 0).forEach(u => {
    if (MailApp.getRemainingDailyQuota() < 1 || !site) return;
    const link = site + '#entrar=' + criarLink_(u.id);
    MailApp.sendEmail({ to: u.login, name: NOME_APP, subject: '⭐ Como foi o seu conteúdo em ' + mes.slice(5, 7) + '/' + mes.slice(0, 4) + '?',
      htmlBody: '<div style="font-family:Arial,sans-serif;font-size:15px;max-width:520px"><h2>Olá, ' + escH_(u.nome.split(' ')[0]) + '!</h2><p>Leva 10 segundos: de 0 a 10, quanto você ficou satisfeito(a) com o conteúdo do mês passado? A sua resposta ajuda a gente a melhorar.</p><p><a href="' + link + '" style="background:#1d1d1f;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Dar minha nota</a></p></div>' });
  });
}

/* ---------- Financeiro ---------- */
function pagamento_(eu, marcaId, mes, pago, valor, obs) {
  if (TODAS_MARCAS.indexOf(eu.papel) < 0 || !acesso_(eu, marcaId)) throw erro_('permissao', 'Só o administrador e o diretor da empresa mexem no financeiro.');
  if (!/^\d{4}-\d{2}$/.test(mes || '')) throw erro_('server', 'Mês inválido.');
  const atual = ler_(ABA_PAGAMENTOS, CAMPOS_PAGAMENTO).filter(p => p.marcaId === marcaId && p.mes === mes)[0];
  if (!pago) { if (atual) excluirLinha_(ABA_PAGAMENTOS, CAMPOS_PAGAMENTO, atual.id); return; }
  gravar_(ABA_PAGAMENTOS, CAMPOS_PAGAMENTO, { id: atual ? atual.id : Utilities.getUuid().slice(0, 13), marcaId: marcaId, marca: nomeDaMarca_(marcaId), mes: mes, valor: Number(valor) || 0,
    pagoEm: paraBR_(/^\d{4}-\d{2}-\d{2}$/.test(pago) ? pago : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')), por: eu.nome, obs: String(obs || '').slice(0, 300), criado: atual ? atual.criado : Date.now() });
}
// cobranças em aberto do mês atual e do anterior
function cobrancas_(hoje, empId) {
  const pagos = {}; ler_(ABA_PAGAMENTOS, CAMPOS_PAGAMENTO).forEach(p => pagos[p.marcaId + '|' + p.mes] = true);
  const meses = [hoje.slice(0, 7), somaDias_(hoje.slice(0, 7) + '-01', 0, -1).slice(0, 7)], l = [];
  ler_(ABA_MARCAS, CAMPOS_MARCA).forEach(m => {
    if (empId && m.empresaId !== empId) return;
    const pf = parseJSON_(m.perfil, {}) || {}, fin = pf.financeiro || {}, valor = Number(pf.valorMensal) || 0, dia = parseInt(fin.vencimento, 10);
    if (!valor || !(dia >= 1 && dia <= 31)) return;
    meses.forEach(mes => {
      if (pagos[m.id + '|' + mes] || (fin.inicio && mes < String(fin.inicio).slice(0, 7))) return;
      const ult = new Date(+mes.slice(0, 4), +mes.slice(5, 7), 0).getDate();
      l.push({ marca: m.nome, mes: mes, vence: mes + '-' + ('0' + Math.min(dia, ult)).slice(-2), valorTxt: 'R$ ' + valor.toFixed(2).replace('.', ',') });
    });
  });
  return l;
}

/* ---------- Checklist de cliente novo ---------- */
function checklistMarca_(eu, marcaId) {
  const hoje = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  [['Pegar os acessos das contas (Instagram, Meta, TikTok…)', 1, 'Alta'], ['Mandar o link do briefing para o cliente', 1, 'Alta'], ['Receber o manual da marca, logotipo e fontes', 3, 'Alta'],
    ['Reunião inicial com o cliente', 3, 'Alta'], ['Fazer o direcionamento de marca', 7, 'Média'], ['Cadastrar o pacote contratado e o valor do contrato', 2, 'Média'], ['Montar a primeira grade do mês', 10, 'Média']]
    .forEach(t => { try { salvarTarefa_(eu, { titulo: t[0], marcaId: marcaId, responsavelId: eu.id, prazo: somaDias_(hoje, t[1]), prioridade: t[2], descricao: 'Checklist de cliente novo.' }, ''); } catch (e) { Logger.log(e); } });
}

/* ======================================================================
 * Novidades 2026-11-06.2: IA (Claude), Google Agenda com Meet, propostas comerciais
 * ====================================================================== */

/* ---------- IA: sugestões na voz da marca ----------
 * Usa a API da Anthropic (Claude). A chave fica só nas Propriedades do script (ANTHROPIC_KEY),
 * cadastrada pelo administrador em Minha conta. Cada pedido custa centavos. */
function contextoMarca_(marcaId) {
  const m = ler_(ABA_MARCAS, CAMPOS_MARCA).filter(x => x.id === marcaId)[0];
  if (!m) return '';
  const pf = parseJSON_(m.perfil, {}) || {};
  const campos = [['Segmento', pf.segmento], ['Cidade', pf.cidade], ['Público', pf.pResumo], ['Faixa etária', pf.pIdade], ['Tom de voz', pf.tom], ['Palavras que usamos', pf.palavrasUsar],
    ['Palavras e assuntos proibidos', pf.palavrasEvitar], ['Pilares de conteúdo', pf.pilares], ['Diferenciais', pf.diferenciais], ['Carro-chefe', pf.carroChefe], ['Propósito', pf.proposito]];
  const personas = (pf.personas || []).slice(0, 2).map(p => '- ' + [p.nome, p.dores && 'dores: ' + p.dores, p.desejos && 'desejos: ' + p.desejos].filter(Boolean).join('; ')).join('\n');
  return 'Marca: ' + m.nome + (pf.instagram ? ' (' + pf.instagram + ')' : '') + '\n' + campos.filter(c => c[1]).map(c => c[0] + ': ' + String(c[1]).slice(0, 600)).join('\n') +
    (m.produtos ? '\nProdutos: ' + String(m.produtos).split('\n').slice(0, 30).join(', ') : '') + (personas ? '\nPersonas:\n' + personas : '');
}
function ia_(eu, tarefa, marcaId, d) {
  if (!podeEditar_(eu, marcaId)) throw erro_('permissao', 'Só quem alimenta a marca usa a IA.');
  limite_('ia_u_' + eu.id, 20, 3600, 'Você usou a IA muitas vezes na última hora. Tente de novo mais tarde.');
  limite_('ia_e_' + empresaDe_(marcaId), 150, 21600, 'A empresa chegou ao limite de sugestões da IA por agora (150 a cada 6 horas).');
  const chave = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_KEY_' + empresaDe_(marcaId));
  if (!chave) throw erro_('server', 'A IA não está ligada. O administrador cadastra a chave em Minha conta.');
  const ctx = contextoMarca_(marcaId);
  const post = d.post || {};
  const sobrePost = ['Título: ' + (post.postagem || ''), 'Formato: ' + (post.formato || ''), post.produto && 'Produto: ' + post.produto, post.objetivo && 'Objetivo: ' + post.objetivo, post.cta && 'CTA: ' + post.cta, post.observacao && 'Roteiro/observações: ' + String(post.observacao).slice(0, 1500), post.legenda && 'Legenda atual: ' + String(post.legenda).slice(0, 1500)].filter(Boolean).join('\n');
  const pedidos = {
    legenda: 'Escreva UMA legenda de Instagram para este post, na voz da marca. Comece com um gancho forte na primeira linha, use parágrafos curtos, termine com a chamada para ação. No fim, até 8 hashtags relevantes. Máximo 1.500 caracteres. Responda só com a legenda, sem comentários.\n\n' + sobrePost,
    hashtags: 'Sugira 20 hashtags para este post, misturando grandes, médias e de nicho, em português. Responda só com as hashtags separadas por espaço.\n\n' + sobrePost,
    ideias: 'Sugira ' + Math.min(15, Math.max(3, parseInt(d.quantidade, 10) || 8)) + ' ideias de posts para o Instagram da marca' + (d.mes ? ' em ' + d.mes : '') + (d.tema ? ', com foco em: ' + d.tema : '') + '. Varie formatos (Carrossel, Estático, Vídeo) e objetivos. Responda uma ideia por linha, exatamente assim, sem numeração e sem nada antes ou depois:\nFormato | Título curto do post | Uma frase explicando o conteúdo',
    stories: 'Monte uma sequência de ' + Math.min(8, Math.max(3, parseInt(d.quantidade, 10) || 5)) + ' stories para o dia' + (d.tema ? ' sobre: ' + d.tema : '') + ', com começo, meio e chamada para ação. Use figurinhas quando fizer sentido (Enquete, Caixinha de perguntas, Quiz, Link, Contagem regressiva). Responda um story por linha, exatamente assim, sem nada antes ou depois:\nTipo (Foto, Vídeo, Texto, Bastidores, Produto ou Depoimento) | Texto curto que aparece na tela | Figurinha ou - | Texto da figurinha ou - | O que mostrar ou falar',
    roteiro: 'Escreva um roteiro curto de Reels (até 45 segundos) para este post: gancho nos 3 primeiros segundos, cenas numeradas com o que mostrar e o que falar, e o fechamento com CTA. Responda só com o roteiro.\n\n' + sobrePost
  };
  const pedido = pedidos[tarefa];
  if (!pedido) throw erro_('server', 'Pedido inválido.');
  const corpo = {
    model: 'claude-opus-5-5', max_tokens: 4000,
    output_config: { effort: 'low' },
    fallbacks: 'default',
    system: 'Você é social media sênior de uma agência brasileira. Escreve em português do Brasil, na voz da marca descrita abaixo, respeitando as palavras e assuntos proibidos. Nunca invente preços, promoções ou dados que não estejam no contexto.\n\n' + ctx,
    messages: [{ role: 'user', content: pedido }]
  };
  const r = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true, payload: JSON.stringify(corpo),
    headers: { 'x-api-key': chave, 'anthropic-version': '2026-10-21', 'anthropic-beta': 'server-side-fallback-2026-07-01' }
  });
  const j = parseJSON_(r.getContentText(), {});
  if (r.getResponseCode() !== 200) {
    const msg = (j.error && j.error.message) || ('erro ' + r.getResponseCode());
    throw erro_('server', r.getResponseCode() === 401 ? 'A chave da IA é inválida. Confira em Minha conta.' : r.getResponseCode() === 429 ? 'A IA está ocupada agora. Tente de novo em um minuto.' : 'A IA não respondeu: ' + msg);
  }
  if (j.stop_reason === 'refusal') throw erro_('server', 'A IA não quis responder a este pedido. Reformule e tente de novo.');
  const texto = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
  if (!texto) throw erro_('server', 'A IA não devolveu texto. Tente de novo.');
  return { texto: texto };
}

/* ---------- Google Agenda: a reunião vira evento com convite e link do Meet ----------
 * Liga em Minha conta (administrador). Os eventos ficam na agenda da conta dona do sistema. */
function sincronizarGcal_(x) {
  if (PropertiesService.getScriptProperties().getProperty('gcal_' + x.empresaId) !== 'sim') return;
  try {
    CalendarApp.getDefaultCalendar(); // garante a permissão de agenda
    const pessoas = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(u => u.empresaId === x.empresaId);
    const emails = x.participantes.concat([x.criadoPorId]).map(id => (pessoas.filter(u => u.id === id)[0] || {}).login).filter(e => /@/.test(e || ''));
    const m = x.data.match(/^(\d{4})-(\d{2})-(\d{2})$/), h = x.hora.match(/^(\d{1,2}):(\d{2})$/);
    const ini = new Date(+m[1], +m[2] - 1, +m[3], +h[1], +h[2]), fim = new Date(ini.getTime() + x.duracao * 60000);
    const tz = Session.getScriptTimeZone(), f = dt => Utilities.formatDate(dt, tz, "yyyy-MM-dd'T'HH:mm:ss");
    const ev = { summary: x.titulo, description: x.descricao || '', location: x.local || '', start: { dateTime: f(ini), timeZone: tz }, end: { dateTime: f(fim), timeZone: tz }, attendees: emails.map(e => ({ email: e })) };
    if (x.meet === 'sim' && !x.gcal) ev.conferenceData = { createRequest: { requestId: x.id + Date.now(), conferenceSolutionKey: { type: 'hangoutsMeet' } } };
    const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events' + (x.gcal ? '/' + x.gcal : '') + '?sendUpdates=all&conferenceDataVersion=1';
    const r = UrlFetchApp.fetch(url, { method: x.gcal ? 'patch' : 'post', contentType: 'application/json', payload: JSON.stringify(ev), headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
    const j = parseJSON_(r.getContentText(), {});
    if (j.id) { x.gcal = j.id; if (j.hangoutLink && !x.local) x.local = j.hangoutLink; }
    else Logger.log('Google Agenda: ' + r.getContentText());
  } catch (e) { Logger.log('Google Agenda: ' + e); }
}
function apagarGcal_(gid) {
  try { UrlFetchApp.fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events/' + gid + '?sendUpdates=all', { method: 'delete', headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true }); } catch (e) { Logger.log(e); }
}

/* ---------- Propostas comerciais (link para o cliente aceitar) ---------- */
function salvarProposta_(eu, p, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  if (TODAS_MARCAS.indexOf(eu.papel) < 0) throw erro_('permissao', 'Só o administrador e o diretor fazem propostas.');
  const atual = p.id ? ler_(ABA_PROPOSTAS, CAMPOS_PROPOSTA).filter(x => x.id === String(p.id))[0] : null;
  if (atual && !mesmaEmp_(eu, atual.empresaId)) throw erro_('permissao', 'Proposta de outra empresa.');
  if (!atual && !eu.empresaId) throw erro_('server', 'Escolha a empresa no topo antes de criar a proposta.');
  if (atual && atual.status === 'aceita') throw erro_('server', 'Esta proposta já foi aceita.');
  const cliente = String(p.cliente || '').trim().slice(0, 120);
  if (!cliente) throw erro_('server', 'Escreva o nome do cliente.');
  const n = k => Math.max(0, Number(p[k]) || 0);
  const dados = { cliente: cliente, contato: String(p.contato || '').slice(0, 200), email: String(p.email || '').trim().slice(0, 200), feed: n('feed'), reels: n('reels'), stories: n('stories'),
    valor: n('valor'), meses: Math.max(1, Math.min(60, parseInt(p.meses, 10) || 3)), inicio: /^\d{4}-\d{2}-\d{2}$/.test(p.inicio || '') ? p.inicio : '', vencimento: Math.min(31, parseInt(p.vencimento, 10) || 10),
    inclui: String(p.inclui || '').slice(0, 4000), extras: String(p.extras || '').slice(0, 2000), validade: /^\d{4}-\d{2}-\d{2}$/.test(p.validade || '') ? p.validade : '', agencia: String(p.agencia || '').slice(0, 120) };
  const chave = atual ? atual.chave : Utilities.getUuid().replace(/-/g, '');
  const id = atual ? atual.id : Utilities.getUuid().slice(0, 13);
  gravar_(ABA_PROPOSTAS, CAMPOS_PROPOSTA, { id: id, cliente: cliente, status: p.enviar ? 'enviada' : (atual ? atual.status : 'rascunho'), dados: JSON.stringify(dados), chave: chave, marcaId: '', por: atual ? atual.por : eu.nome, uid: atual ? atual.uid : eu.id, criado: atual ? atual.criado : Date.now(), respondido: '', empresaId: atual ? atual.empresaId : eu.empresaId });
  const base = String(site || site_() || '').split('#')[0];
  const url = base + '#proposta=' + chave;
  if (p.enviar && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(dados.email) && MailApp.getRemainingDailyQuota() > 0) {
    MailApp.sendEmail(Object.assign(/@/.test(eu.login || '') ? { replyTo: eu.login } : {}, { to: dados.email, name: dados.agencia || NOME_APP, subject: 'Proposta de social media para ' + cliente,
      htmlBody: '<div style="font-family:Arial,sans-serif;font-size:15px;max-width:540px"><p>Olá' + (dados.contato ? ', ' + escH_(dados.contato.split(' ')[0]) : '') + '!</p><p>Preparamos a proposta de gestão de Instagram para a <b>' + escH_(cliente) + '</b>. Você pode ver todos os detalhes e aceitar pelo link:</p><p><a href="' + url + '" style="background:#1d1d1f;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Ver a proposta</a></p><p style="color:#6b6b70;font-size:13px">' + escH_(eu.nome) + '</p></div>' }));
  }
  return { id: id, url: url };
}
function excluirProposta_(eu, id) {
  if (TODAS_MARCAS.indexOf(eu.papel) < 0) throw erro_('permissao', 'Sem permissão.');
  const x = ler_(ABA_PROPOSTAS, CAMPOS_PROPOSTA).filter(p => p.id === String(id))[0];
  if (!x || !mesmaEmp_(eu, x.empresaId)) throw erro_('permissao', 'Proposta de outra empresa.');
  excluirLinha_(ABA_PROPOSTAS, CAMPOS_PROPOSTA, id);
}
function propostaDe_(chave) {
  const x = ler_(ABA_PROPOSTAS, CAMPOS_PROPOSTA).filter(p => p.chave && p.chave === String(chave || '').replace(/\W/g, ''))[0];
  if (!x) throw erro_('proposta', 'Proposta não encontrada.');
  return x;
}
function propostaVer_(chave) {
  const x = propostaDe_(chave), d = parseJSON_(x.dados, {});
  const venc = d.validade && d.validade < Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return { cliente: x.cliente, status: x.status, dados: d, por: x.por, vencida: !!venc && x.status !== 'aceita', briefing: x.status === 'aceita' ? (PropertiesService.getScriptProperties().getProperty('brfprop_' + x.id) || '') : '' };
}
function propostaAceitar_(chave, nome, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  const x = propostaDe_(chave), d = parseJSON_(x.dados, {});
  if (x.status === 'aceita') return propostaVer_(chave);
  if (d.validade && d.validade < Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')) throw erro_('proposta', 'Esta proposta venceu. Fale com a agência.');
  const autor = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(u => u.id === x.uid)[0];
  const eu = autor ? publicoUsuario_(autor) : { id: '', nome: x.por, papel: 'admin', marcas: ['*'], login: '' };
  eu.papel = TODAS_MARCAS.indexOf(eu.papel) >= 0 ? eu.papel : 'admin';
  eu.empresaId = x.empresaId || eu.empresaId; eu.dono = false;
  // cria a marca já com o pacote, o valor e o financeiro; o checklist de cliente novo nasce junto
  const perfil = { pacote: {}, valorMensal: d.valor, financeiro: { vencimento: d.vencimento, inicio: d.inicio, renovacao: d.inicio ? somaDias_(d.inicio, 0, d.meses) : '' }, responsavel: [d.contato, d.email].filter(Boolean).join(' · ') };
  ['feed', 'reels', 'stories'].forEach(k => { if (d[k]) perfil.pacote[k] = d[k]; });
  const marcaId = salvarMarca_(eu, { nome: x.cliente, produtos: [], fases: FASES_PADRAO, observacoes: 'Cliente desde a proposta aceita em ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy') + (nome ? ' por ' + nome : '') + '.', perfil: perfil, arquivos: [] });
  x.status = 'aceita'; x.marcaId = marcaId; x.respondido = Date.now();
  gravar_(ABA_PROPOSTAS, CAMPOS_PROPOSTA, x);
  // próximo passo para o cliente: o briefing
  let brief = '';
  try { brief = briefingLink_(Object.assign({}, eu, { papel: 'admin' }), marcaId, site).url; PropertiesService.getScriptProperties().setProperty('brfprop_' + x.id, brief); } catch (e) { Logger.log(e); }
  try {
    if (autor && /@/.test(autor.login)) MailApp.sendEmail({ to: autor.login, name: NOME_APP, subject: '🎉 Proposta aceita: ' + x.cliente,
      htmlBody: '<div style="font-family:Arial,sans-serif;font-size:15px"><h2>🎉 ' + escH_(x.cliente) + ' aceitou a proposta!</h2><p>' + (nome ? escH_(nome) + ' aceitou. ' : '') + 'A marca já foi criada com o pacote, o valor e o checklist de cliente novo. O cliente recebeu o link do briefing na própria tela.</p></div>' });
  } catch (e) { Logger.log(e); }
  return propostaVer_(chave);
}

/* ======================================================================
 * Empresas (várias agências na mesma plataforma)
 * Cada pessoa e cada marca pertence a uma empresa; ninguém vê nem recebe
 * e-mail de outra empresa. A dona da plataforma (dono = sim) vê todas e
 * escolhe no topo qual está olhando.
 * ====================================================================== */
let EMP_CACHE = null;
function empresas_() {
  return ler_(ABA_EMPRESAS, CAMPOS_EMPRESA).map(e => ({ id: e.id, nome: e.nome, ativo: e.ativo !== 'não', criado: Number(e.criado) || 0, obs: e.obs || '', perfil: parseJSON_(e.perfil, {}), permissoes: parseJSON_(e.permissoes, {}) }));
}
// empresa de uma marca (lida uma vez por pedido)
function empresaDe_(marcaId) {
  if (!EMP_CACHE) { EMP_CACHE = {}; ler_(ABA_MARCAS, CAMPOS_MARCA).forEach(m => EMP_CACHE[m.id] = m.empresaId || ''); }
  return EMP_CACHE[marcaId] || '';
}
// a dona da plataforma com "Todas" escolhido vê tudo; os outros só a própria empresa
function mesmaEmp_(eu, empId) {
  if (eu.dono && !eu.empresaId) return true;
  return !!eu.empresaId && String(empId || '') === String(eu.empresaId);
}
function empresaAtiva_(u) {
  if (u.dono === 'sim' || !u.empresaId) return true;
  const e = ler_(ABA_EMPRESAS, CAMPOS_EMPRESA).filter(x => x.id === u.empresaId)[0];
  return !e || e.ativo !== 'não';
}
// cria ou altera uma empresa; ao criar, cadastra também o primeiro administrador dela
function salvarEmpresa_(eu, e) {
  if (!eu.dono) throw erro_('permissao', 'Só a dona da plataforma cria empresas.');
  const todas = ler_(ABA_EMPRESAS, CAMPOS_EMPRESA);
  const atual = e.id ? todas.filter(x => x.id === String(e.id))[0] : null;
  const nome = String(e.nome || '').trim().slice(0, 120);
  if (!nome) throw erro_('server', 'Escreva o nome da empresa.');
  if (todas.some(x => x.nome.toLowerCase() === nome.toLowerCase() && x.id !== (atual && atual.id))) throw erro_('server', 'Já existe uma empresa com este nome.');
  const id = atual ? atual.id : 'e' + Utilities.getUuid().slice(0, 10);
  let adm = null;
  if (!atual && e.admin && e.admin.login) {
    const login = normLogin_(e.admin.login);
    if (ler_(ABA_USUARIOS, CAMPOS_USUARIO).some(u => u.login === login)) throw erro_('server', 'Já existe alguém com o login ' + login + '.');
    senhaValida_(e.admin.senha);
    adm = { login: login, nome: String(e.admin.nome || '').trim() || login, senha: e.admin.senha };
  }
  gravar_(ABA_EMPRESAS, CAMPOS_EMPRESA, { id: id, nome: nome, ativo: e.ativo === false ? 'não' : 'sim', criado: atual ? atual.criado : Date.now(), obs: String(e.obs || '').slice(0, 500), perfil: atual ? atual.perfil : '', permissoes: atual ? atual.permissoes : '' });
  if (adm) {
    const sal = Utilities.getUuid();
    gravar_(ABA_USUARIOS, CAMPOS_USUARIO, { id: Utilities.getUuid().slice(0, 13), nome: adm.nome, login: adm.login, papel: 'admin', marcas: '*', ativo: 'sim', hash: hash_(adm.senha, sal), sal: sal, criado: String(Date.now()), empresaId: id, dono: '' });
  }
  return { id: id };
}
// roda dentro do "configurar": tudo o que já existia vai para a primeira empresa
function migrarEmpresas_() {
  aba_(ABA_EMPRESAS, CAMPOS_EMPRESA);
  let emps = ler_(ABA_EMPRESAS, CAMPOS_EMPRESA);
  const usuarios = ler_(ABA_USUARIOS, CAMPOS_USUARIO);
  if (!usuarios.length) return;
  if (!emps.length) {
    gravar_(ABA_EMPRESAS, CAMPOS_EMPRESA, { id: 'e' + Utilities.getUuid().slice(0, 10), nome: 'Valim Creative Studio', ativo: 'sim', criado: Date.now(), obs: 'Empresa criada na atualização' });
    emps = ler_(ABA_EMPRESAS, CAMPOS_EMPRESA);
    Logger.log('Empresa "Valim Creative Studio" criada; tudo o que já existia foi colocado nela.');
  }
  const emp = emps[0].id;
  [[ABA_USUARIOS, CAMPOS_USUARIO], [ABA_MARCAS, CAMPOS_MARCA], [ABA_TAREFAS, CAMPOS_TAREFA], [ABA_AGENDA, CAMPOS_AGENDA], [ABA_HORAS, CAMPOS_HORA], [ABA_MURAL, CAMPOS_AVISO], [ABA_PROPOSTAS, CAMPOS_PROPOSTA]].forEach(([nome, campos]) => {
    const aba = aba_(nome, campos), n = aba.getLastRow() - 1;
    if (n < 1) return;
    const col = aba.getRange(2, colunaDe_(campos, 'empresaId'), n, 1), v = col.getValues();
    if (v.some(l => l[0] === '')) col.setValues(v.map(l => [l[0] === '' ? emp : l[0]]));
  });
  // a conta dona do script vira dona da plataforma (ou o primeiro administrador)
  const me = normLogin_(Session.getEffectiveUser().getEmail());
  const todos = ler_(ABA_USUARIOS, CAMPOS_USUARIO);
  if (!todos.some(u => u.dono === 'sim')) {
    const d = todos.filter(u => u.login === me && u.papel === 'admin')[0] || todos.filter(u => u.papel === 'admin')[0];
    if (d) { d.dono = 'sim'; gravar_(ABA_USUARIOS, CAMPOS_USUARIO, d); Logger.log(d.login + ' agora é dona da plataforma (vê todas as empresas).'); }
  }
  // chaves que eram de todo o sistema passam a ser da primeira empresa
  const props = PropertiesService.getScriptProperties();
  [['ANTHROPIC_KEY', 'ANTHROPIC_KEY_'], ['trends', 'trends_'], ['gcal', 'gcal_']].forEach(([velha, nova]) => {
    const v = props.getProperty(velha);
    if (v && !props.getProperty(nova + emp)) props.setProperty(nova + emp, v);
    if (v) props.deleteProperty(velha);
  });
  mexeu_();
}

/* ---------- Perfil, cores e permissões de cada empresa ---------- */
const TELAS_PERM = ['calendario', 'stories', 'ideias', 'pautas', 'fluxo', 'grade', 'aprovacoes', 'resumo', 'painel', 'resultados', 'marca', 'marca-acessos', 'agenda', 'tarefas', 'horas', 'mural', 'equipe', 'equipe-atividade', 'financeiro', 'empresa'];
function podeEmpresa_(eu) {
  if (!eu.empresaId) throw erro_('server', 'Escolha a empresa no topo.');
  if (!eu.dono && eu.papel !== 'admin') throw erro_('permissao', 'Só o administrador da empresa altera isso.');
}
function salvarPerfilEmpresa_(eu, perfil, permissoes, nome) {
  podeEmpresa_(eu);
  const e = ler_(ABA_EMPRESAS, CAMPOS_EMPRESA).filter(x => x.id === eu.empresaId)[0];
  if (!e) throw erro_('server', 'Empresa não encontrada.');
  if (perfil) {
    const t = (k, n) => String(perfil[k] || '').trim().slice(0, n || 300);
    const cores = {};
    Object.keys(perfil.cores || {}).forEach(k => { if (/^[\w-]{3,20}$/.test(k) && /^#[0-9a-fA-F]{6}$/.test(String(perfil.cores[k]))) cores[k] = perfil.cores[k]; });
    e.perfil = JSON.stringify({ logo: /^[\w-]{20,}$/.test(perfil.logo || '') ? perfil.logo : '', texto: t('texto', 3000), desde: t('desde', 40), instagram: t('instagram', 100), whatsapp: t('whatsapp', 40), email: t('email', 200), site: t('site', 300), cidade: t('cidade', 120), cores: cores });
  }
  if (permissoes) {
    const ok = {};
    TELAS_PERM.forEach(v => { const x = permissoes[v]; if (x && typeof x === 'object') { ok[v] = {}; PAPEIS.forEach(p => { if (typeof x[p] === 'boolean') ok[v][p] = x[p]; }); } });
    e.permissoes = JSON.stringify(ok);
  }
  if (nome && String(nome).trim()) e.nome = String(nome).trim().slice(0, 120);
  gravar_(ABA_EMPRESAS, CAMPOS_EMPRESA, e);
}
function logoEmpresa_(eu, req) {
  podeEmpresa_(eu);
  const a = arquivoSeguro_(req.base64, 3, true);
  const pasta = pasta_(pasta_(DriveApp.getRootFolder(), PASTA_ARQUIVOS), 'Empresas');
  const f = pasta.createFile(Utilities.newBlob(a.bytes, a.mime, 'logo-' + eu.empresaId));
  try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  return { id: f.getId() };
}

/* ======================================================================
 * Novidades 2026-11-08: esqueci minha senha, registro de quem fez o quê, exportar dados
 * ====================================================================== */

/* ---------- Esqueci minha senha (link por e-mail, vale 1 hora) ---------- */
function esqueciSenha_(login, site) {
  site = site_(); // endereço oficial; o do pedido é ignorado
  login = normLogin_(login);
  const cache = CacheService.getScriptCache(), k = 'rstq_' + login;
  const tent = Number(cache.get(k) || 0);
  if (tent >= 5) throw erro_('server', 'Muitos pedidos seguidos. Espere uma hora e tente de novo.');
  cache.put(k, String(tent + 1), 3600);
  limite_('rst_geral', 40, 3600, 'Muitos pedidos de senha agora. Tente de novo em uma hora.');
  const u = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(x => x.login === login && x.ativo === 'sim')[0];
  // a resposta é sempre a mesma, para não revelar quem tem cadastro
  if (!u || !empresaAtiva_(u) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(u.login) || MailApp.getRemainingDailyQuota() < 1) return { enviado: true };
  const chave = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty('rst_' + chave, JSON.stringify({ uid: u.id, exp: Date.now() + 3600000 }));
  const base = String(site || site_() || '').split('#')[0];
  const url = base + '#redefinir=' + chave;
  MailApp.sendEmail({ to: u.login, name: NOME_APP, subject: '🔑 Criar uma senha nova',
    htmlBody: '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1d1d1f;max-width:520px"><h2 style="margin:0 0 12px">Olá, ' + escH_(u.nome.split(' ')[0]) + '!</h2>' +
      '<p>Recebemos um pedido para criar uma senha nova no ' + NOME_APP + '. Clique no botão (vale por 1 hora):</p>' +
      '<p><a href="' + url + '" style="background:#1d1d1f;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Criar senha nova</a></p>' +
      '<p style="color:#6b6b70;font-size:13px">Se não foi você, ignore este e-mail: a sua senha continua a mesma.</p></div>' });
  try { auditar_(publicoUsuario_(u), 'Pediu para criar uma senha nova', '', '', u.empresaId); } catch (e) {}
  return { enviado: true };
}
function redefinirSenha_(chave, nova) {
  const props = PropertiesService.getScriptProperties(), k = 'rst_' + String(chave || '').replace(/\W/g, '');
  const d = parseJSON_(props.getProperty(k), null);
  if (!d || d.exp < Date.now()) throw erro_('server', 'Este link venceu ou já foi usado. Peça um novo em "Esqueci minha senha".');
  senhaValida_(nova);
  const u = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(x => x.id === d.uid)[0];
  if (!u || u.ativo !== 'sim') throw erro_('server', 'Conta não encontrada.');
  u.sal = Utilities.getUuid(); u.hash = hash_(nova, u.sal);
  gravar_(ABA_USUARIOS, CAMPOS_USUARIO, u);
  props.deleteProperty(k);
  // encerra as sessões abertas dessa pessoa em outros aparelhos
  derrubarSessoes_(u.id);
  CacheService.getScriptCache().remove('lgf_' + u.login);
  try { auditar_(publicoUsuario_(u), 'Criou uma senha nova pelo link do e-mail', '', '', u.empresaId); } catch (e) {}
  return { login: u.login };
}

/* ---------- Registro de quem fez o quê ---------- */
function auditar_(eu, acao, alvo, detalhe, empresaId) {
  const aba = aba_(ABA_AUDITORIA, CAMPOS_AUDITORIA);
  const linha = { id: Utilities.getUuid().slice(0, 12), empresaId: empresaId != null && empresaId !== '' ? empresaId : (eu.empresaId || ''), em: Date.now(), uid: eu.id || '', nome: eu.nome || '', acao: String(acao || '').slice(0, 200), alvo: String(alvo || '').slice(0, 300), detalhe: String(detalhe || '').slice(0, 500) };
  aba.getRange(aba.getLastRow() + 1, 1, 1, CAMPOS_AUDITORIA.length).setNumberFormat('@').setValues([CAMPOS_AUDITORIA.map(c => String(linha[c[0]]))]);
}
// descreve a ação antes de rodar (para saber o nome do que vai ser apagado)
function antesDoRegistro_(eu, req) {
  const titPost = id => { const p = pautaPorId_(id); return p ? [(p.postagem || 'Postagem') + ' · ' + nomeDaMarca_(p.marcaId), empresaDe_(p.marcaId)] : ['', '']; };
  switch (req.action) {
    case 'salvarUsuario': {
      const u = req.usuario || {}, atual = u.id ? ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(x => x.id === u.id)[0] : null;
      const mud = atual ? [atual.papel !== u.papel && 'papel: ' + atual.papel + ' → ' + u.papel, (atual.ativo === 'sim') !== (u.ativo !== false) && (u.ativo === false ? 'desativou o acesso' : 'reativou o acesso'), u.senha && 'senha nova', String(atual.marcas) !== (u.marcas || []).join(',') && 'mudou as marcas'].filter(Boolean).join('; ') : 'papel: ' + u.papel;
      return [atual ? 'Alterou a pessoa' : 'Cadastrou a pessoa', (u.nome || u.login || '') + ' (' + (PAPEIS.indexOf(u.papel) >= 0 ? u.papel : '') + ')', mud];
    }
    case 'excluirPauta': { const t = titPost(req.id); return ['Apagou a postagem', t[0], 'foi para a lixeira', t[1]]; }
    case 'excluirStory': { const x = ler_(ABA_STORIES, CAMPOS_STORY).filter(s => s.id === String(req.id))[0]; return x ? ['Apagou um story', (x.titulo || x.tipo || 'Story') + ' · ' + nomeDaMarca_(x.marcaId), 'foi para a lixeira', empresaDe_(x.marcaId)] : null; }
    case 'excluirMarca': return ['Excluiu a marca', nomeDaMarca_(req.id), 'com todas as postagens', empresaDe_(req.id)];
    case 'trocarSenha': return ['Trocou a própria senha', '', ''];
    case 'iaConfig': return ['Mudou as integrações', '', ('chave' in req ? (req.chave === '' ? 'desligou a IA' : 'trocou a chave da IA') : '') + ('gcal' in req ? (req.gcal ? ' ligou o Google Agenda' : ' desligou o Google Agenda') : '')];
    case 'perfilEmpresa': return [req.permissoes && !req.perfil ? 'Mudou quem vê o quê' : 'Alterou o perfil e as cores da empresa', '', ''];
    case 'salvarEmpresa': { const d = req.empresaDados || {}; return [d.id ? 'Alterou a empresa' : 'Criou a empresa', d.nome || '', d.ativo === false ? 'desativou' : '', d.id || '']; }
    case 'pagamento': return [req.pago ? 'Marcou pagamento como pago' : 'Desfez um pagamento', nomeDaMarca_(req.marcaId) + ' · ' + req.mes, '', empresaDe_(req.marcaId)];
    case 'restaurar': return ['Recuperou da lixeira', '', ''];
    case 'linkCliente': { const u = ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(x => x.id === req.usuarioId)[0]; return ['Gerou o link sem senha do cliente', u ? u.nome : '', req.enviar ? 'enviado por e-mail' : '']; }
    case 'briefingLink': return ['Gerou o link do briefing', nomeDaMarca_(req.marcaId), '', empresaDe_(req.marcaId)];
    case 'excluirEvento': { const x = eventoPorId_(req.id); return x ? [x.tipo === 'reuniao' ? 'Cancelou a reunião' : 'Excluiu uma atividade', x.titulo + ' · ' + paraBR_(x.data), '', x.empresaId] : null; }
    case 'salvarProposta': return [req.proposta && req.proposta.id ? 'Alterou a proposta' : 'Criou a proposta', (req.proposta || {}).cliente || '', (req.proposta || {}).enviar ? 'enviada por e-mail' : ''];
    case 'excluirProposta': return ['Apagou a proposta', '', ''];
    case 'acao': if (req.acao === 'definir') { const t = titPost(req.id); return ['Forçou o status', t[0], 'para ' + req.status, t[1]]; } return null;
    case 'exportar': return ['Exportou os dados da empresa', '', ''];
    default: return null;
  }
}
function listarAuditoria_(eu) {
  if (TODAS_MARCAS.indexOf(eu.papel) < 0 && !eu.dono) throw erro_('permissao', 'Só o administrador e o diretor veem o registro.');
  const l = ler_(ABA_AUDITORIA, CAMPOS_AUDITORIA).filter(x => mesmaEmp_(eu, x.empresaId));
  return l.slice(-1500).reverse().map(x => ({ em: Number(x.em) || 0, uid: x.uid, nome: x.nome, acao: x.acao, alvo: x.alvo, detalhe: x.detalhe }));
}

/* ---------- Exportar todos os dados da empresa ---------- */
function exportar_(eu) {
  if (eu.papel !== 'admin' && !eu.dono) throw erro_('permissao', 'Só o administrador da empresa exporta os dados.');
  if (!eu.empresaId) throw erro_('server', 'Escolha a empresa no topo.');
  const emp = eu.empresaId, marcas = ler_(ABA_MARCAS, CAMPOS_MARCA).filter(m => m.empresaId === emp), ids = marcas.map(m => m.id);
  const daMarca = x => ids.indexOf(x.marcaId) >= 0;
  const sem = (o, ks) => { const c = Object.assign({}, o); ks.forEach(k => delete c[k]); return c; };
  return {
    empresa: (empresas_().filter(e => e.id === emp)[0] || {}).nome || '',
    geradoEm: Date.now(),
    tabelas: {
      Marcas: marcas.map(m => sem(m, ['empresaId'])),
      Postagens: ler_(ABA_PAUTAS, CAMPOS_PAUTA).filter(daMarca),
      Stories: ler_(ABA_STORIES, CAMPOS_STORY).filter(daMarca),
      Pessoas: ler_(ABA_USUARIOS, CAMPOS_USUARIO).filter(u => u.empresaId === emp).map(u => sem(u, ['hash', 'sal', 'cores', 'empresaId', 'dono'])),
      Tarefas: ler_(ABA_TAREFAS, CAMPOS_TAREFA).filter(t => t.empresaId === emp),
      Agenda: ler_(ABA_AGENDA, CAMPOS_AGENDA).filter(x => x.empresaId === emp).map(x => sem(x, ['gcal'])),
      Horas: ler_(ABA_HORAS, CAMPOS_HORA).filter(h => h.empresaId === emp),
      Pagamentos: ler_(ABA_PAGAMENTOS, CAMPOS_PAGAMENTO).filter(daMarca),
      Avaliacoes: ler_(ABA_AVALIACOES, CAMPOS_AVALIACAO).filter(daMarca),
      Propostas: ler_(ABA_PROPOSTAS, CAMPOS_PROPOSTA).filter(p => p.empresaId === emp).map(p => sem(p, ['chave'])),
      Mural: ler_(ABA_MURAL, CAMPOS_AVISO).filter(a => a.empresaId === emp),
      Registro: ler_(ABA_AUDITORIA, CAMPOS_AUDITORIA).filter(a => a.empresaId === emp)
    }
  };
}

/* ======================================================================
 * Segurança (2026-11-09): validação de dados que vêm do navegador,
 * permissões por tela no servidor, limites de uso e limpeza diária.
 * ====================================================================== */

// só links https (nada de javascript:, data: etc.)
function urlSegura_(u) {
  u = String(u || '').trim();
  return /^https:\/\/[^\s<>"'`]+$/i.test(u) ? u.slice(0, 1000) : '';
}
const idSeguro_ = v => /^[\w-]{6,80}$/.test(String(v || '')) ? String(v) : '';
const textoCurto_ = (v, n) => String(v || '').replace(/[<>"'`\\]/g, '').trim().slice(0, n || 60);
function limparArquivos_(l) {
  return (Array.isArray(l) ? l : []).slice(0, 300).map(a => ({
    id: idSeguro_(a && a.id) || ('a' + Utilities.getUuid().slice(0, 8)), tipo: textoCurto_(a.tipo, 60), nome: String(a.nome || '').slice(0, 200),
    nota: String(a.nota || '').slice(0, 1000), data: /^\d{4}-\d{2}-\d{2}$/.test(a.data || '') ? a.data : '', url: urlSegura_(a.url), driveId: idSeguro_(a.driveId)
  })).filter(a => a.url || a.driveId);
}
// campos de dinheiro e de pacote só o administrador e o diretor mudam; o resto do perfil é limpo
const CAMPOS_FINANCEIROS = ['valorMensal', 'financeiro', 'pacote', 'relatorioAuto'];
function limparPerfilMarca_(eu, novo, atual) {
  const p = Object.assign({}, novo);
  if (TODAS_MARCAS.indexOf(eu.papel) < 0 && !eu.dono) CAMPOS_FINANCEIROS.forEach(k => { if (k in atual) p[k] = atual[k]; else delete p[k]; });
  if ('valorMensal' in p) p.valorMensal = Math.max(0, Number(p.valorMensal) || 0);
  if (Array.isArray(p.biblioteca)) p.biblioteca = p.biblioteca.slice(0, 400).map(x => ({ id: idSeguro_(x && x.id), nome: String(x.nome || '').slice(0, 200), tipo: x.tipo === 'video' ? 'video' : 'imagem', tags: (Array.isArray(x.tags) ? x.tags : []).map(t => textoCurto_(t, 40).toLowerCase()).filter(String).slice(0, 15) })).filter(x => x.id);
  ['site', 'fotoPerfil'].forEach(k => { if (k in p && p[k]) p[k] = urlSegura_(p[k]); });
  if (Array.isArray(p.redes)) p.redes = p.redes.map(x => textoCurto_(x, 60)).filter(String).slice(0, 40);
  if (Array.isArray(p.hashtags)) p.hashtags = p.hashtags.slice(0, 50).map(x => ({ nome: String(x.nome || '').slice(0, 80), texto: String(x.texto || '').slice(0, 2000) }));
  if (Array.isArray(p.modelos)) p.modelos = p.modelos.slice(0, 50).map(x => ({ nome: String(x.nome || '').slice(0, 80), texto: String(x.texto || '').slice(0, 3000) }));
  if (Array.isArray(p.nichos)) p.nichos = p.nichos.map(x => textoCurto_(x, 30)).slice(0, 20);
  return p;
}
// tabela "quem vê o quê" aplicada no servidor (mesmas regras da tela)
const TELAS_SERV = {
  stories: ['admin diretor gestor social aprovador cliente', 'admin diretor gestor social aprovador cliente'],
  'marca-acessos': ['admin diretor gestor social', 'admin diretor gestor social'],
  agenda: ['admin diretor gestor social aprovador', 'admin diretor gestor social aprovador'],
  tarefas: ['admin diretor gestor social aprovador', 'admin diretor gestor social aprovador'],
  horas: ['admin diretor gestor social aprovador', 'admin diretor gestor social aprovador'],
  mural: ['admin diretor gestor social aprovador', 'admin diretor gestor social aprovador'],
  equipe: ['admin diretor', 'admin diretor'],
  'equipe-atividade': ['admin diretor gestor', 'admin diretor gestor'],
  financeiro: ['admin diretor', 'admin diretor'],
  registro: ['admin diretor', 'admin diretor'],
  empresa: ['admin', 'admin'],
  ideias: ['admin diretor gestor social aprovador', 'admin diretor gestor social aprovador']
};
function podeTela_(eu, tela) {
  if (eu.dono) return true;
  const t = TELAS_SERV[tela]; if (!t) return true;
  if (t[0].split(' ').indexOf(eu.papel) < 0) return false;
  const e = eu.empresaId ? empresas_().filter(x => x.id === eu.empresaId)[0] : null;
  const o = e && e.permissoes && e.permissoes[tela] && e.permissoes[tela][eu.papel];
  return typeof o === 'boolean' ? o : t[1].split(' ').indexOf(eu.papel) >= 0;
}
function exigeTela_(eu, tela) {
  if (!podeTela_(eu, tela)) throw erro_('permissao', 'Esta função não está liberada para o seu papel nesta empresa.');
}
// tipos de arquivo aceitos, conferidos pelos primeiros bytes (não pelo nome nem pelo tipo que o navegador diz)
function tipoArquivo_(bytes) {
  const b = i => (bytes[i] + 256) % 256, txt = (i, n) => String.fromCharCode.apply(null, bytes.slice(i, i + n).map(x => (x + 256) % 256));
  if (b(0) === 0xFF && b(1) === 0xD8 && b(2) === 0xFF) return ['image/jpeg', 'imagem'];
  if (txt(1, 3) === 'PNG') return ['image/png', 'imagem'];
  if (txt(0, 4) === 'GIF8') return ['image/gif', 'imagem'];
  if (txt(0, 4) === 'RIFF' && txt(8, 4) === 'WEBP') return ['image/webp', 'imagem'];
  if (txt(4, 4) === 'ftyp') return [/qt/.test(txt(8, 4)) ? 'video/quicktime' : 'video/mp4', 'video'];
  if (txt(0, 4) === '%PDF') return ['application/pdf', 'documento'];
  if (txt(0, 4) === '8BPS') return ['image/vnd.adobe.photoshop', 'documento'];
  if (txt(0, 2) === '%!') return ['application/postscript', 'documento'];
  if (b(0) === 0x50 && b(1) === 0x4B) return ['application/zip', 'documento']; // docx, xlsx, pptx, zip
  return null;
}
function arquivoSeguro_(base64, maxMB, soImagem) {
  if (!base64) throw erro_('server', 'Arquivo vazio.');
  if (base64.length > maxMB * 1.37 * 1048576) throw erro_('server', 'Arquivo grande demais (máx. ' + maxMB + ' MB).');
  const bytes = Utilities.base64Decode(base64), t = tipoArquivo_(bytes);
  if (!t || (soImagem && t[1] !== 'imagem')) throw erro_('server', soImagem ? 'Envie uma imagem (JPG, PNG, GIF ou WEBP).' : 'Tipo de arquivo não aceito. Use imagem, vídeo MP4/MOV, PDF, PSD, EPS ou Office/ZIP.');
  return { bytes: bytes, mime: t[0] };
}
const nomeArquivo_ = n => String(n || 'arquivo').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 120) || 'arquivo';
// limpeza diária: sessões, convites e links vencidos (as Propriedades do Script têm limite de tamanho)
function limpezaDiaria() {
  const props = PropertiesService.getScriptProperties(), todas = props.getProperties(), agora = Date.now();
  let n = 0;
  Object.keys(todas).forEach(k => {
    if (!/^(tok_|lnk_|rst_|brf_)/.test(k)) return;
    const d = parseJSON_(todas[k], null);
    if (!d || !d.exp || d.exp < agora) { props.deleteProperty(k); n++; }
  });
  Logger.log('Limpeza: ' + n + ' acessos vencidos removidos.');
}
