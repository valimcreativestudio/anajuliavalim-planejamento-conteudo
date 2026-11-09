// Quadros livres (tipo Trello) e reordenar a grade
const G = require('./simulador-google.js');
const P = o => G.post(JSON.stringify(o));
let falhas = 0; const ok = (nome, cond, extra) => { if (!cond) falhas++; console.log((cond ? 'ok   ' : 'FALHA') + ' ' + nome + (extra !== undefined ? ' → ' + extra : '')); };
G.configurar(); const senha = G.logs[0].match(/Senha provisória: (\S+)/)[1];
const ta = P({ action: 'login', login: 'ana@agencia.com', senha }).token;
const liso = P({ action: 'salvarMarca', token: ta, marca: { nome: 'Liso' } }).id;
const novo = (nome, login, papel) => { P({ action: 'salvarUsuario', token: ta, usuario: { nome, login, papel, marcas: [liso], senha: 'Teste#2026' } }); return P({ action: 'login', login, senha: 'Teste#2026' }).token; };
const ts = novo('Sofi', 'sofi@x.com', 'social'), tb = novo('Bia', 'bia@x.com', 'social'), tc = novo('Cli', 'cli@x.com', 'cliente');
const sofi = P({ action: 'listar', token: ta }).usuarios.find(u => u.nome === 'Sofi').id;
// ---- quadros
const qid = P({ action: 'quadroSalvar', token: ts, quadro: { nome: 'Black Friday', cor: '#ff5a5f', colunas: [{ nome: 'Ideias' }, { nome: 'Fazendo' }, { nome: 'Pronto' }] } }).id;
let L = P({ action: 'listar', token: ta }); let q = L.quadros.find(x => x.id === qid);
ok('quadro criado com 3 colunas', q && q.colunas.length === 3, q && q.colunas.map(c => c.nome).join(','));
ok('cliente não vê quadros', P({ action: 'listar', token: tc }).quadros.length === 0);
ok('cliente não cria quadro', !!P({ action: 'quadroSalvar', token: tc, quadro: { nome: 'x', colunas: [{ nome: 'a' }] } }).error);
ok('quadro sem coluna recusado', !!P({ action: 'quadroSalvar', token: ts, quadro: { nome: 'x', colunas: [] } }).error);
const [c1, c2, c3] = q.colunas.map(c => c.id);
const k1 = P({ action: 'cartaoSalvar', token: ts, cartao: { quadroId: qid, coluna: c1, titulo: 'Briefing do cliente', ordem: 1, responsavelId: sofi, prazo: '2026-11-20', cor: '#3b82f6', checklist: [{ t: 'Ligar' }, { t: 'Mandar e-mail' }] } }).id;
const k2 = P({ action: 'cartaoSalvar', token: tb, cartao: { quadroId: qid, coluna: c1, titulo: 'Arte do banner', ordem: 2, cor: 'javascript:x' } }).id;
L = P({ action: 'listar', token: ta }); let k = L.cartoes.find(x => x.id === k1);
ok('cartão salvo com responsável, prazo, cor e checklist', k && k.responsavelId === sofi && k.prazo === '2026-11-20' && k.cor === '#3b82f6' && k.checklist.length === 2, k && JSON.stringify([k.prazo, k.cor, k.checklist.length]));
ok('cor inválida descartada', L.cartoes.find(x => x.id === k2).cor === '');
P({ action: 'cartaoMover', token: tb, id: k1, coluna: c2, ordem: 5 });
ok('cartão movido de coluna', P({ action: 'listar', token: ta }).cartoes.find(x => x.id === k1).coluna === c2);
ok('mover para coluna que não existe é recusado', !!P({ action: 'cartaoMover', token: tb, id: k1, coluna: 'naoexiste', ordem: 1 }).error);
// apagar coluna "Fazendo": cartão volta para a primeira
P({ action: 'quadroSalvar', token: ts, quadro: { id: qid, nome: 'Black Friday 2026', colunas: [{ id: c1, nome: 'Ideias' }, { id: c3, nome: 'Pronto' }] } });
L = P({ action: 'listar', token: ta });
ok('apagar coluna leva os cartões para a primeira', L.cartoes.find(x => x.id === k1).coluna === c1 && L.quadros.find(x => x.id === qid).nome === 'Black Friday 2026');
ok('Bia não apaga quadro da Sofi', !!P({ action: 'quadroExcluir', token: tb, id: qid }).error);
// outra empresa
P({ action: 'salvarEmpresa', token: ta, empresaDados: { nome: 'Belkit', ativo: true, admin: { nome: 'Bel', login: 'bel@b.com', senha: 'Teste#2026' } } });
const tbel = P({ action: 'login', login: 'bel@b.com', senha: 'Teste#2026' }).token;
ok('Belkit não vê nem mexe nos quadros da Valim', P({ action: 'listar', token: tbel }).quadros.length === 0 && !!P({ action: 'cartaoMover', token: tbel, id: k1, coluna: c1, ordem: 1 }).error && !!P({ action: 'cartaoSalvar', token: tbel, cartao: { quadroId: qid, titulo: 'x' } }).error);
P({ action: 'cartaoExcluir', token: ts, id: k2 });
ok('cartão apagado', !P({ action: 'listar', token: ta }).cartoes.some(x => x.id === k2));
P({ action: 'quadroExcluir', token: ta, id: qid });
L = P({ action: 'listar', token: ta });
ok('direção apaga o quadro e os cartões', !L.quadros.length && !L.cartoes.length);
// ---- reordenar grade
const ids = ['2026-11-03', '2026-11-10', '2026-11-17'].map((d, i) => P({ action: 'salvarPauta', token: ts, pauta: { marcaId: liso, data: d, postagem: 'P' + i } }).id);
const ag = P({ action: 'salvarPauta', token: ts, pauta: { marcaId: liso, data: '2026-11-24', postagem: 'Agendado' } }).id;
G.posts; // apenas para manter a referência
P({ action: 'acao', token: ta, id: ag, acao: 'definir', status: 'Agendado' });
const r = P({ action: 'reordenarGrade', token: ts, marcaId: liso, mudancas: [{ id: ids[0], data: '2026-11-17' }, { id: ids[2], data: '2026-11-03' }] });
const ps = P({ action: 'listar', token: ta }).pautas;
ok('datas trocadas de uma vez', r.n === 2 && ps.find(p => p.id === ids[0]).data === '2026-11-17' && ps.find(p => p.id === ids[2]).data === '2026-11-03', JSON.stringify(r));
ok('post agendado não muda de lugar', !!P({ action: 'reordenarGrade', token: ts, marcaId: liso, mudancas: [{ id: ag, data: '2026-11-01' }] }).error);
ok('cliente não reordena', !!P({ action: 'reordenarGrade', token: tc, marcaId: liso, mudancas: [{ id: ids[1], data: '2026-11-02' }] }).error);
ok('data inválida recusada (nada muda)', !!P({ action: 'reordenarGrade', token: ts, marcaId: liso, mudancas: [{ id: ids[1], data: '2026-11-05' }, { id: ids[0], data: 'ontem' }] }).error && P({ action: 'listar', token: ta }).pautas.find(p => p.id === ids[1]).data === '2026-11-10');
ok('registro anota a reordenação', P({ action: 'auditoria', token: ta }).itens.some(x => /Reordenou a grade/.test(x.acao)));
console.log(falhas ? falhas + ' FALHA(S)' : 'tudo certo'); process.exit(falhas ? 1 : 0);
