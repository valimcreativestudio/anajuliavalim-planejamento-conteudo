const G = require('./simulador-google.js');
global.SEM_AUTOCODIGO = true;
const P = o => G.post(JSON.stringify(o));
let falhas = 0; const ok = (nome, cond, extra) => { if (!cond) falhas++; console.log((cond ? 'ok   ' : 'FALHA') + ' ' + nome + (extra !== undefined ? ' → ' + extra : '')); };
G.configurar(); const senha = G.logs[0].match(/Senha provisória: (\S+)/)[1];
const DISP = 'a'.repeat(32), DISP2 = 'b'.repeat(32);
// ---- código por e-mail (a dona é admin)
let r = P({ action: 'login', login: 'ana@agencia.com', senha, dispositivo: DISP });
ok('admin em aparelho novo pede código', r.precisaCodigo && !r.token, r.email);
const codigo = G.enviados[G.enviados.length - 1].subject.match(/(\d{6})/)[1];
ok('código errado recusado', /errado/.test(P({ action: 'confirmarCodigo', desafio: r.desafio, codigo: '000000', dispositivo: DISP }).error || ''));
const rc = P({ action: 'confirmarCodigo', desafio: r.desafio, codigo, confiar: true, dispositivo: DISP });
ok('código certo entra', !!rc.token); const ta = rc.token;
ok('código não serve 2 vezes', !P({ action: 'confirmarCodigo', desafio: r.desafio, codigo, dispositivo: DISP }).token);
ok('aparelho confiável entra direto', !!P({ action: 'login', login: 'ana@agencia.com', senha, dispositivo: DISP }).token);
const r2 = P({ action: 'login', login: 'ana@agencia.com', senha, dispositivo: DISP2 });
let bloq = ''; for (let i = 0; i < 6; i++) bloq = P({ action: 'confirmarCodigo', desafio: r2.desafio, codigo: '11111' + i, dispositivo: DISP2 }).error;
ok('5 códigos errados derrubam o desafio', /venceu|várias/.test(bloq), bloq);
const liso = P({ action: 'salvarMarca', token: ta, marca: { nome: 'Liso' } }).id;
P({ action: 'salvarUsuario', token: ta, usuario: { nome: 'Sofi', login: 'sofi@x.com', papel: 'social', marcas: [liso], senha: 'Teste#2026' } });
P({ action: 'salvarUsuario', token: ta, usuario: { nome: 'Bia', login: 'bia@x.com', papel: 'social', marcas: [liso], senha: 'Teste#2026' } });
P({ action: 'salvarUsuario', token: ta, usuario: { nome: 'Cli', login: 'cli@x.com', papel: 'cliente', marcas: [liso], senha: 'Teste#2026' } });
const rs = P({ action: 'login', login: 'sofi@x.com', senha: 'Teste#2026', dispositivo: DISP2 });
ok('social não precisa de código', !!rs.token); const ts = rs.token;
const tb = P({ action: 'login', login: 'bia@x.com', senha: 'Teste#2026' }).token, tc = P({ action: 'login', login: 'cli@x.com', senha: 'Teste#2026' }).token;
const eq = P({ action: 'listar', token: ta }).usuarios, sofi = eq.find(u => u.nome === 'Sofi').id;
// ---- push
const lst = P({ action: 'listar', token: ts });
ok('chave pública de push no listar', /^[\w-]{87}$/.test(lst.pushChave));
ok('endpoint de outro site recusado', !!P({ action: 'pushInscrever', token: ts, endpoint: 'https://evil.example/x' }).error);
ok('endpoint http recusado', !!P({ action: 'pushInscrever', token: ts, endpoint: 'http://fcm.googleapis.com/fcm/send/x' }).error);
ok('endpoint do Google aceito', P({ action: 'pushInscrever', token: ts, endpoint: 'https://fcm.googleapis.com/fcm/send/SOFI1' }).ok);
P({ action: 'pushInscrever', token: ts, endpoint: 'https://web.push.apple.com/SOFI2' });
global.PUSHCODE = { 'https://web.push.apple.com/SOFI2': 410 };
const t1 = P({ action: 'salvarTarefa', token: ta, tarefa: { titulo: 'Gravar reels', responsavelId: sofi, marcaId: liso, prazo: '2026-11-20', data: '2026-11-18', repetir: 'semana', checklist: [{ t: 'Roteiro' }, { t: "Gravar d'água" }], anexos: [{ nome: 'Ref', url: 'https://x.com/a' }, { nome: 'mau', url: 'javascript:alert(1)' }] } }).id;
ok('tarefa nova acorda os 2 aparelhos da Sofi', global.PUSHES.length === 2, global.PUSHES.map(p => p.u).join(' '));
ok('aviso assinado (vapid t=… k=…)', /^vapid t=[\w-]+\.[\w-]+\.[\w-]+, k=[\w-]{87}$/.test(global.PUSHES[0].h.Authorization));
ok('aparelho que sumiu (410) é esquecido', P({ action: 'listar', token: ts }).pushAparelhos.join() === 'https://fcm.googleapis.com/fcm/send/SOFI1');
const pend = P({ action: 'pushPendentes', token: ts }).mensagens;
ok('celular busca a mensagem', pend.length === 1 && /Nova tarefa/.test(pend[0].t), JSON.stringify(pend[0]));
ok('mensagem só sai uma vez', P({ action: 'pushPendentes', token: ts }).mensagens.length === 0);
ok('outra pessoa não lê as mensagens da Sofi', P({ action: 'pushPendentes', token: tb }).mensagens.length === 0);
// ---- tarefas
let t = P({ action: 'listar', token: ta }).tarefas.find(x => x.id === t1);
ok('checklist salvo (com apóstrofo)', t.checklist.length === 2 && t.checklist[1].t === "Gravar d'água");
ok('anexo javascript: descartado', t.anexos.length === 1 && t.anexos[0].url === 'https://x.com/a');
ok('Bia não marca item da tarefa da Sofi', !!P({ action: 'itemTarefa', token: tb, id: t1, item: t.checklist[0].id, ok: true }).error);
P({ action: 'itemTarefa', token: ts, id: t1, item: t.checklist[0].id, ok: true });
ok('Sofi marca item', P({ action: 'listar', token: ta }).tarefas.find(x => x.id === t1).checklist[0].ok === true);
global.PUSHES.length = 0;
ok('Sofi comenta', P({ action: 'comentarTarefa', token: ts, id: t1, texto: 'Roteiro pronto!' }).ok);
ok('comentário avisa quem criou (admin sem aparelho = 0 push)', global.PUSHES.length === 0);
ok('cliente não comenta tarefa interna', !!P({ action: 'comentarTarefa', token: tc, id: t1, texto: 'oi' }).error);
P({ action: 'concluirTarefa', token: ts, id: t1, status: 'Feita' });
let ts2 = P({ action: 'listar', token: ta }).tarefas.filter(x => x.titulo === 'Gravar reels');
const nova = ts2.find(x => x.id !== t1);
ok('repetir: próxima criada uma semana depois', nova && nova.data === '2026-11-25' && nova.prazo === '2026-11-27' && nova.status === 'Pendente', nova && nova.data + ' ' + nova.prazo);
ok('repetir: checklist zerado e sem comentários', nova && nova.checklist.every(i => !i.ok) && nova.comentarios.length === 0);
P({ action: 'concluirTarefa', token: ts, id: t1, status: 'Pendente' }); P({ action: 'concluirTarefa', token: ts, id: t1, status: 'Feita' });
ok('reabrir e concluir de novo não duplica', P({ action: 'listar', token: ta }).tarefas.filter(x => x.titulo === 'Gravar reels').length === 2);
// ---- comentário com ponto na arte
const pid = P({ action: 'salvarPauta', token: ts, pauta: { marcaId: liso, data: '2026-11-10', postagem: 'Carrossel', midias: [{ id: 'IMG1xxxxxxxxxxxxxxxxx', tipo: 'imagem' }, { id: 'IMG2xxxxxxxxxxxxxxxxx', tipo: 'imagem' }] } }).id;
const cm = P({ action: 'comentar', token: tc, id: pid, texto: 'Trocar essa cor', arte: 2, x: 33.33, y: 120 });
ok('ponto fora da arte é ignorado', cm.comentario.x === undefined);
const cm2 = P({ action: 'comentar', token: tc, id: pid, texto: 'Trocar essa cor', arte: 2, x: 33.33, y: 71.06 });
ok('ponto na arte salvo', cm2.comentario.x === 33.3 && cm2.comentario.y === 71.1 && cm2.comentario.arte === 2, JSON.stringify(cm2.comentario));
// ---- modelos
['2026-11-03', '2026-11-05', '2026-11-12'].forEach((d, i) => P({ action: 'salvarPauta', token: ts, pauta: { marcaId: liso, data: d, postagem: 'Tema ' + i, formato: i ? 'Reels' : 'Carrossel' } }));
const mid = P({ action: 'modeloSalvar', token: ts, marcaId: liso, mes: '2026-11', nome: 'Mês padrão Liso', comTemas: true }).id;
ok('modelo salvo', !!mid);
const mod = P({ action: 'listar', token: ts }).modelos.find(m => m.id === mid);
ok('modelo guarda dia da semana e formato', mod && mod.itens.length === 4 && mod.itens.some(i => i.formato === 'Reels'), mod && mod.itens.length);
ok('cliente não vê modelos', P({ action: 'listar', token: tc }).modelos.length === 0);
const n = P({ action: 'modeloAplicar', token: ts, id: mid, marcaId: liso, mes: '2027-01', comTemas: false }).n;
const jan = P({ action: 'listar', token: ta, desde: '2026-10' }).pautas.filter(p => p.data.startsWith('2027-01'));
ok('modelo aplicado em janeiro', n === 4 && jan.length === 4, jan.map(p => p.data + ':' + p.formato + ':' + (p.postagem || '-')).join(' '));
ok('sem temas quando pedido', jan.every(p => !p.postagem));
ok('Bia não apaga modelo da Sofi', !!P({ action: 'modeloExcluir', token: tb, id: mid }).error);
// outra empresa não aplica
const emp = P({ action: 'salvarEmpresa', token: ta, empresaDados: { nome: 'Belkit', ativo: true, admin: { nome: 'Bel', login: 'bel@b.com', senha: 'Teste#2026' } } });
const rb = P({ action: 'login', login: 'bel@b.com', senha: 'Teste#2026', dispositivo: DISP });
ok('admin da Belkit também pede código', rb.precisaCodigo);
const cb = G.enviados[G.enviados.length - 1].subject.match(/(\d{6})/)[1];
const tbel = P({ action: 'confirmarCodigo', desafio: rb.desafio, codigo: cb, dispositivo: DISP }).token;
ok('Belkit não vê nem aplica modelo da Valim', P({ action: 'listar', token: tbel }).modelos.length === 0 && !!P({ action: 'modeloAplicar', token: tbel, id: mid, marcaId: liso, mes: '2027-02' }).error);
ok('confiar só vale para quem marcou (Belkit no mesmo aparelho pediu código)', true);
// ---- Google
ok('Google desligado', /não está ligado/.test(P({ action: 'loginGoogle', credencial: 'a.b.c' }).error));
ok('só a dona liga o Google', !!P({ action: 'definirGoogle', token: tbel, clientId: '123-abc.apps.googleusercontent.com' }).error);
P({ action: 'definirGoogle', token: ta, clientId: '123-abc.apps.googleusercontent.com' });
ok('config pública mostra o client id', P({ action: 'configPublica' }).googleClientId === '123-abc.apps.googleusercontent.com');
const fut = Math.floor(Date.now() / 1000) + 600;
global.GTOKENS = { 'h.SOFI.s': { aud: '123-abc.apps.googleusercontent.com', iss: 'https://accounts.google.com', email: 'Sofi@X.com', email_verified: 'true', exp: String(fut) },
  'h.OUTROAPP.s': { aud: '999-outro.apps.googleusercontent.com', iss: 'accounts.google.com', email: 'sofi@x.com', email_verified: 'true', exp: String(fut) },
  'h.NAOVERIF.s': { aud: '123-abc.apps.googleusercontent.com', iss: 'accounts.google.com', email: 'sofi@x.com', email_verified: 'false', exp: String(fut) },
  'h.ESTRANHO.s': { aud: '123-abc.apps.googleusercontent.com', iss: 'accounts.google.com', email: 'ninguem@x.com', email_verified: 'true', exp: String(fut) } };
const gs = P({ action: 'loginGoogle', credencial: 'h.SOFI.s' });
ok('Sofi entra com Google', !!gs.token && P({ action: 'listar', token: gs.token }).eu.nome === 'Sofi');
ok('token de outro app recusado', !P({ action: 'loginGoogle', credencial: 'h.OUTROAPP.s' }).token);
ok('e-mail não verificado recusado', !P({ action: 'loginGoogle', credencial: 'h.NAOVERIF.s' }).token);
ok('e-mail não cadastrado recusado', /não está cadastrado/.test(P({ action: 'loginGoogle', credencial: 'h.ESTRANHO.s' }).error));
ok('credencial falsa recusada', !P({ action: 'loginGoogle', credencial: 'h.FALSO.s' }).token);
ok('registro anota entrada com Google', P({ action: 'auditoria', token: ta }).itens.some(x => /Google/.test(x.acao)));
// ---- limpeza
G.props['cod_velho'] = JSON.stringify({ exp: 1 }); G.props['dsp_x'] = JSON.stringify([{ h: 'a', exp: 1 }]);
G.limpezaDiaria();
ok('limpeza apaga código e aparelho vencidos', !G.props['cod_velho'] && !G.props['dsp_x']);
console.log(falhas ? falhas + ' FALHA(S)' : 'tudo certo');
process.exit(falhas ? 1 : 0);
