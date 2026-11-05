const G = require('./simulador-google.js');
const P = o => G.post(JSON.stringify(o));
G.configurar(); const senha = G.logs[0].match(/Senha provisória: (\S+)/)[1];
const ta = P({ action: 'login', login: 'ana@agencia.com', senha }).token;
const valim = P({ action: 'listar', token: ta }).empresa.id;
const liso = P({ action: 'salvarMarca', token: ta, marca: { nome: 'Liso' } }).id;
const outra = P({ action: 'salvarMarca', token: ta, marca: { nome: 'OutraMarca' } }).id;
P({ action: 'salvarUsuario', token: ta, usuario: { nome: 'Social V', login: 'sv@v.com', papel: 'social', marcas: [liso], senha: 'Teste#2026' } });
P({ action: 'salvarUsuario', token: ta, usuario: { nome: 'Cli A', login: 'clia@x.com', papel: 'cliente', marcas: [liso], senha: 'Teste#2026', whatsapp: '11911112222' } });
P({ action: 'salvarUsuario', token: ta, usuario: { nome: 'Cli B', login: 'clib@x.com', papel: 'cliente', marcas: [outra], senha: 'Teste#2026', whatsapp: '11933334444' } });
P({ action: 'salvarEmpresa', token: ta, empresaDados: { nome: 'Belkit', admin: { nome: 'Adm B', login: 'adm@b.com', senha: 'Teste#2026' } } });
const tb = P({ action: 'login', login: 'adm@b.com', senha: 'Teste#2026' }).token;
const tsv = P({ action: 'login', login: 'sv@v.com', senha: 'Teste#2026' }).token;
const tca = P({ action: 'login', login: 'clia@x.com', senha: 'Teste#2026' }).token;
let vulneravel = 0; process.on('exit', () => { if (vulneravel) { console.log(vulneravel + ' VULNERABILIDADE(S)'); process.exitCode = 1; } });
const out = (n, ok, d) => (ok && vulneravel++, console.log((ok ? 'VULNERÁVEL ' : 'protegido  ') + n + (d ? ' → ' + d : '')));
// 1 forçar status cross-tenant
const pid = P({ action: 'salvarPauta', token: tsv, pauta: { marcaId: liso, data: '2026-11-10', postagem: 'Post Valim' } }).id;
const r1 = P({ action: 'acao', token: tb, id: pid, acao: 'definir', status: 'Postado' });
out('Admin da Belkit força status de post da Valim pelo ID', r1.ok, P({ action: 'listar', token: ta, empresa: valim }).pautas.find(p => p.id === pid).status);
// 2 agenda cross-tenant
const ev = P({ action: 'salvarEvento', token: ta, empresa: valim, evento: { tipo: 'reuniao', titulo: 'Reunião Valim', data: '2026-11-10', hora: '10:00', participantes: [P({ action: 'listar', token: ta }).usuarios.find(u => u.nome === 'Social V').id] } }).id;
const r2 = P({ action: 'salvarEvento', token: tb, evento: { id: ev, titulo: 'ALTERADO PELA BELKIT', data: '2026-11-10', hora: '10:00', participantes: [] } });
out('Admin da Belkit altera reunião da Valim pelo ID', r2.ok, r2.error);
const r2b = P({ action: 'excluirEvento', token: tb, id: ev });
out('Admin da Belkit apaga reunião da Valim pelo ID', r2b.ok && !P({ action: 'listar', token: ta }).agenda.some(x => x.id === ev));
// 3 horas cross-tenant
const h = P({ action: 'salvarHora', token: tsv, hora: { marcaId: liso, data: '2026-11-05', minutos: 60 } }).id;
const r3 = P({ action: 'excluirHora', token: tb, id: h });
out('Admin da Belkit apaga horas da Valim pelo ID', r3.ok && !P({ action: 'listar', token: ta }).horas.some(x => x.id === h));
// 4 Drive: ler pasta qualquer
const r4 = P({ action: 'lerPasta', token: P({ action: 'login', login: 'adm@b.com', senha: 'Teste#2026' }).token, link: 'https://drive.google.com/drive/folders/PASTAPRIVADA123' });
out('Usuário da Belkit lê uma pasta PARTICULAR do Drive da dona', r4.ok, r4.error);
const r4p = P({ action: 'lerPasta', token: tsv, link: 'https://drive.google.com/drive/folders/PASTA123456789' }); console.log('(pasta aberta por link continua funcionando:', r4p.ok, ')');
const r4b = P({ action: 'lerConteudo', token: tsv, link: 'https://docs.google.com/document/d/DOCPRIVADOxxxxxxxxxxxxxxx/edit' });
out('Social lê um documento PARTICULAR do Drive da dona', r4b.ok, r4b.error);
const pidx = P({ action: 'salvarPauta', token: tsv, pauta: { marcaId: liso, data: '2026-11-15', postagem: 'roubo', midias: [{ id: 'IMGPRIVADOxxxxxxxxxxxxxxx', tipo: 'imagem' }] } }).id;
G.props['ig_' + liso] = JSON.stringify({ tipo: 'fb', token: 'TK', igId: '999' });
const rpub = P({ action: 'publicarAgora', token: tsv, id: pidx });
out('Publicar torna público um arquivo particular da dona', global.TORNOU_PUBLICO === 'IMGPRIVADOxxxxxxxxxxxxxxx', rpub.error);
// 5 reset poisoning (sem login)
G.enviados.length = 0;
P({ action: 'esqueciSenha', login: 'ana@agencia.com', site: 'https://atacante.example/' });
out('Sem login: link de "esqueci a senha" aponta para site do atacante', (G.enviados[0] || {}).htmlBody && /atacante\.example\/#redefinir=/.test(G.enviados[0].htmlBody));
// 6 envenenar o site global (resumo diário)
P({ action: 'listar', token: tsv, site: 'https://atacante.example/' });
out('Usuário comum troca o endereço usado nos e-mails automáticos', G.props.site === 'https://atacante.example/');
// 7 links mágicos em e-mail de notificação apontam para o site enviado pelo usuário
G.enviados.length = 0;
const pid2 = P({ action: 'salvarPauta', token: tsv, pauta: { marcaId: liso, data: '2026-11-12', postagem: 'X' } }).id;
P({ action: 'acao', token: tsv, id: pid2, acao: 'enviarValidacao', site: 'https://atacante.example/' }); P({ action: 'acao', token: ta, id: pid2, acao: 'validar', site: 'https://atacante.example/' });
out('Cliente recebe e-mail com login sem senha apontando para o atacante', G.enviados.some(e => e.to === 'clia@x.com' && /atacante\.example\/#entrar=/.test(e.htmlBody)));
// 8 social gera login do cliente
const r8 = P({ action: 'linkCliente', token: tsv, usuarioId: P({ action: 'listar', token: ta }).usuarios.find(u => u.nome === 'Cli A').id, site: 'https://site.test/' });
const tokCli = (r8.url || '').split('#entrar=')[1];
out('Social media vira o cliente e aprova no lugar dele', !!tokCli && P({ action: 'listar', token: tokCli }).eu.papel === 'cliente');
// 9 cliente vê dados de outro cliente
const eqA = P({ action: 'listar', token: tca }).equipe;
out('Cliente A vê nome e WhatsApp do Cliente B', eqA.some(u => u.nome === 'Cli B' && u.whatsapp), eqA.filter(u => u.papel === 'cliente').map(u => u.nome + ' ' + (u.whatsapp ? 'whats' : '')).join(', '));
// 10 cliente vê tarefas internas
P({ action: 'salvarTarefa', token: ta, tarefa: { titulo: 'Cobrar cliente atrasado (interno)', marcaId: liso } });
out('Cliente vê tarefas internas da equipe sobre a marca dele', P({ action: 'listar', token: tca }).tarefas.some(t => /interno/.test(t.titulo)));
// 11 social altera valor do contrato
const m = P({ action: 'listar', token: tsv }).marcas.find(x => x.id === liso);
P({ action: 'salvarMarca', token: tsv, marca: Object.assign({}, m, { perfil: Object.assign({}, m.perfil, { valorMensal: 1, financeiro: { vencimento: 1 } }) }) });
out('Social media altera o valor do contrato da marca', P({ action: 'listar', token: ta }).marcas.find(x => x.id === liso).perfil.valorMensal === 1);
// 12 briefing anônimo injeta link javascript:
const ch = P({ action: 'briefingLink', token: ta, marcaId: liso, site: 'https://site.test/' }).url.split('#briefing=')[1];
P({ action: 'briefingEnviar', chave: ch, dados: { nome: 'x', arquivos: [{ nome: 'Contrato', url: "javascript:alert(document.domain)", tipo: 'Outros' }] } });
out('Quem tem o link do briefing grava um link javascript: nos arquivos da marca', P({ action: 'listar', token: ta }).marcas.find(x => x.id === liso).arquivos.some(a => /^javascript:/.test(a.url)));
// 13 força bruta no login
let bloqueou = false; for (let i = 0; i < 30; i++) { const r = P({ action: 'login', login: 'sv@v.com', senha: 'errada' + i }); if (r.error && !/incorretos/.test(r.error)) bloqueou = true; }
out('Login aceita 30 tentativas seguidas sem bloquear', !bloqueou && !!P({ action: 'login', login: 'sv@v.com', senha: 'Teste#2026' }).token);
// 14 trocar senha não derruba outras sessões
const outraSessao = P({ action: 'login', login: 'sv@v.com', senha: 'Teste#2026' }).token;
P({ action: 'trocarSenha', token: tsv, atual: 'Teste#2026', nova: 'nova123456' });
out('Depois de trocar a senha, a sessão de OUTRO aparelho continua válida', !!P({ action: 'listar', token: outraSessao }).eu);
console.log('(a sessão de quem trocou continua:', !!P({ action: 'listar', token: tsv }).eu, ')');
// 15 permissão "quem vê o quê" só na tela
P({ action: 'perfilEmpresa', token: ta, empresa: valim, permissoes: { horas: { social: false } } });
const tsv2 = P({ action: 'login', login: 'sv@v.com', senha: 'nova123456' }).token;
out('Tela desligada em "quem vê o quê" continua acessível pela API', P({ action: 'salvarHora', token: tsv2, hora: { marcaId: liso, data: '2026-11-05', minutos: 5 } }).ok);
// 16 IA sem limite
P({ action: 'iaConfig', token: ta, chave: 'sk-ant-x' }); let iaBloq = false; for (let i = 0; i < 25; i++) { const r = P({ action: 'ia', token: tsv, tarefa: 'legenda', marcaId: liso, dados: {} }); if (r.error && /muitas vezes/.test(r.error)) { iaBloq = true; break; } }
out('IA sem limite de uso por pessoa', !iaBloq);
// controles que devem segurar
out('Sem token: listar', !!P({ action: 'listar', token: '' }).eu);
out('Social chama ação de admin (criar empresa)', P({ action: 'salvarEmpresa', token: tsv2, empresaDados: { nome: 'Hack' } }).ok);
out('Social lê o registro', P({ action: 'auditoria', token: tsv2 }).ok);
out('Social exporta dados', P({ action: 'exportar', token: tsv2 }).ok);
out('Social abre senhas de marca sem acesso', P({ action: 'acessosListar', token: tsv2, marcaId: outra }).ok);
out('Cliente aprova post de outra marca', P({ action: 'acao', token: tca, id: P({ action: 'salvarPauta', token: ta, pauta: { marcaId: outra, data: '2026-11-11', postagem: 'B' } }).id, acao: 'clienteAprovar' }).ok);
out('Belkit lista marcas da Valim', P({ action: 'listar', token: tb }).marcas.some(x => x.id === liso));
out('Belkit lê comentários/posts da Valim pelo ID (comentar)', P({ action: 'comentar', token: tb, id: pid, texto: 'oi' }).ok);
out('Belkit exporta dados da Valim', JSON.stringify(P({ action: 'exportar', token: tb })).includes('Liso'));
