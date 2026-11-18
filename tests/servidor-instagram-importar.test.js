// Puxar posts do Instagram para o calendário
const G = require('./simulador-google.js');
const P = o => G.post(JSON.stringify(o));
let falhas = 0; const ok = (nome, cond, extra) => { if (!cond) falhas++; console.log((cond ? 'ok   ' : 'FALHA') + ' ' + nome + (extra !== undefined ? ' → ' + extra : '')); };
G.configurar(); const senha = G.logs[0].match(/Senha provisória: (\S+)/)[1];
const ta = P({ action: 'login', login: 'ana@agencia.com', senha }).token;
const liso = P({ action: 'salvarMarca', token: ta, marca: { nome: 'Liso' } }).id;
const outra = P({ action: 'salvarMarca', token: ta, marca: { nome: 'Outra' } }).id;
P({ action: 'salvarUsuario', token: ta, usuario: { nome: 'Sofi', login: 'sofi@x.com', papel: 'social', marcas: [liso], senha: 'Teste#2026' } });
P({ action: 'salvarUsuario', token: ta, usuario: { nome: 'Cli', login: 'cli@x.com', papel: 'cliente', marcas: [liso], senha: 'Teste#2026' } });
const ts = P({ action: 'login', login: 'sofi@x.com', senha: 'Teste#2026' }).token, tc = P({ action: 'login', login: 'cli@x.com', senha: 'Teste#2026' }).token;
const legendaLonga = 'Novidade chegando! ✨\nNossa coleção de verão\n' + 'texto '.repeat(60) + '#liso';
// ---- sem Instagram conectado: link + data escolhida
let r = P({ action: 'instaImportar', token: ts, marcaId: liso, itens: [{ link: 'https://www.instagram.com/p/ABC123xyz/?igsh=xx', data: '2026-11-04', formato: 'Carrossel' }] });
let ps = P({ action: 'listar', token: ta }).pautas;
let p1 = ps.find(p => p.postLink === 'https://www.instagram.com/p/ABC123xyz/');
ok('sem conexão: cria o post no dia escolhido como Postado', r.criados.length === 1 && p1 && p1.data === '2026-11-04' && p1.status === 'Postado' && p1.formato === 'Carrossel', JSON.stringify(r));
ok('sem conexão e sem data: pede a data', /Escolha a data/.test(P({ action: 'instaImportar', token: ts, marcaId: liso, itens: [{ link: 'https://www.instagram.com/reel/SEMDATA1/' }] }).erros[0].motivo));
ok('link repetido não duplica', P({ action: 'instaImportar', token: ts, marcaId: liso, itens: [{ link: 'https://instagram.com/p/ABC123xyz', data: '2026-11-04' }] }).pulados.length === 1);
ok('link que não é do Instagram é recusado', P({ action: 'instaImportar', token: ts, marcaId: liso, itens: [{ link: 'https://evil.com/p/ABC/', data: '2026-11-04' }] }).erros.length === 1);
ok('cliente não puxa posts', !!P({ action: 'instaImportar', token: tc, marcaId: liso, itens: [{ link: 'https://www.instagram.com/p/XYZ/', data: '2026-11-04' }] }).error);
ok('quem não cuida da marca não puxa', !!P({ action: 'instaImportar', token: ts, marcaId: outra, itens: [{ link: 'https://www.instagram.com/p/XYZ/', data: '2026-11-04' }] }).error);
// ---- com Instagram conectado: data, hora, legenda e formato vêm sozinhos
G.props['ig_' + liso] = JSON.stringify({ token: 'TK', usuario: 'liso', renovado: Date.now() });
global.IG.data = [
  { id: '901', caption: legendaLonga, media_type: 'CAROUSEL_ALBUM', permalink: 'https://www.instagram.com/p/CARR001/', timestamp: '2026-11-10T21:15:00+0000' },
  { id: '902', caption: 'Bastidores', media_type: 'VIDEO', permalink: 'https://www.instagram.com/reel/REEL002/', timestamp: '2026-11-12T13:00:00+0000' },
  { id: '903', caption: 'Já no calendário', media_type: 'IMAGE', permalink: 'https://www.instagram.com/p/ABC123xyz/', timestamp: '2026-11-04T12:00:00+0000' }
];
const f = P({ action: 'instaFaltando', token: ts, marcaId: liso });
ok('lista só o que falta no calendário', f.conectado && f.itens.length === 2 && f.itens.map(x => x.tipo).join(',') === 'Carrossel,Vídeo', JSON.stringify(f.itens.map(x => [x.link, x.data, x.tipo])));
r = P({ action: 'instaImportar', token: ts, marcaId: liso, itens: [{ link: 'https://www.instagram.com/p/CARR001/?utm_source=ig_web_copy_link' }, { link: 'https://www.instagram.com/reel/REEL002/' }] });
ps = P({ action: 'listar', token: ta }).pautas;
const c = ps.find(p => p.postLink === 'https://www.instagram.com/p/CARR001/'), v = ps.find(p => p.postLink === 'https://www.instagram.com/reel/REEL002/');
ok('conectado: data e hora do post (fuso de São Paulo)', c && c.data === '2026-11-10' && c.agHora === '18:15' && v.data === '2026-11-12', c && JSON.stringify([c.data, c.agHora, v && v.data]));
ok('conectado: legenda inteira, título da 1ª linha e formato', c.legenda === legendaLonga && c.postagem === 'Novidade chegando! ✨' && c.formato === 'Carrossel' && v.formato === 'Vídeo');
ok('conectado: fica Postado com o ID do Instagram (para métricas)', c.status === 'Postado' && c.igMidia === '901');
ok('histórico registra a importação', (c.historico || []).some(h => /Puxou do Instagram/.test(h.acao)));
ok('depois de puxar, nada mais falta', P({ action: 'instaFaltando', token: ts, marcaId: liso }).itens.length === 0);
// ---- conectar com chave do "login unificado" (usuário do sistema): chave + ID da conta, sem Página
const m3 = P({ action: 'salvarMarca', token: ta, marca: { nome: 'Liso 3' } }).id;
global.IG.pages = []; global.IG.contas = { '17841447646452710': 'lisoobrigatorio' };
const semId = P({ action: 'instaConectar', token: ta, marcaId: m3, chave: 'EAAsistemaXXXXXXXXXXXXXXXXXXXX' });
ok('sem o ID: explica que precisa do ID da conta', /ID da conta do Instagram/.test(semId.error || ''), semId.error);
const idErrado = P({ action: 'instaConectar', token: ta, marcaId: m3, chave: 'EAAsistemaXXXXXXXXXXXXXXXXXXXX', contaId: '17841400000000099' });
ok('ID errado: avisa', !!idErrado.error, idErrado.error);
const cx = P({ action: 'instaConectar', token: ta, marcaId: m3, chave: 'EAAsistemaXXXXXXXXXXXXXXXXXXXX', contaId: '17841447646452710' });
ok('chave + ID: conecta direto na conta', cx.usuario === 'lisoobrigatorio' && JSON.parse(G.props['ig_' + m3]).igId === '17841447646452710', JSON.stringify(cx));
global.IG.fbdata = [{ id: '777', caption: 'Post via sistema', media_type: 'IMAGE', permalink: 'https://www.instagram.com/p/SIS777/', timestamp: '2026-11-15T15:00:00+0000' }];
const f3 = P({ action: 'instaFaltando', token: ta, marcaId: m3 });
ok('com essa conexão, lista os posts do perfil', f3.itens.length === 1 && f3.itens[0].link === 'https://www.instagram.com/p/SIS777/', JSON.stringify(f3.itens));
console.log(falhas ? falhas + ' FALHA(S)' : 'tudo certo'); process.exit(falhas ? 1 : 0);
