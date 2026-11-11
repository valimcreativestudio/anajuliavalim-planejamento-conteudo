// Monta o site como um Cloudflare Worker (os arquivos vão dentro do próprio Worker).
// Assim dá para publicar só com a chave da API, sem o upload de arquivos do Pages.
// uso: node ferramentas/montar-worker.js <pasta-de-saida>
//   gera <saida>/worker.js, <saida>/metadata.json, os módulos m0, m1… e <saida>/curl-args.txt
// publicar: eval curl -X PUT https://api.cloudflare.com/client/v4/accounts/<conta>/workers/scripts/planejaae $(cat <saida>/curl-args.txt)
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..'), saida = path.resolve(process.argv[2] || path.join(raiz, 'ferramentas', 'worker-out'));
const ARQS = ['index.html', 'config.js', 'sw.js', 'manifest.webmanifest', 'robots.txt', 'icone-180.png', 'icone-192.png', 'icone-512.png', 'icone-maskable.png', 'apps-script/Codigo.gs']
  .concat(fs.readdirSync(path.join(raiz, 'vendor')).map(f => 'vendor/' + f));
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.gs': 'text/plain; charset=utf-8' };
const binario = f => /\.png$/.test(f);
// cabeçalhos de segurança: os mesmos do arquivo _headers (regra "/*")
const cab = {};
let bloco = null;
fs.readFileSync(path.join(raiz, '_headers'), 'utf8').split('\n').forEach(l => {
  if (/^\S/.test(l)) bloco = l.trim(); else if (bloco === '/*' && l.includes(':')) { const i = l.indexOf(':'); cab[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
});
fs.rmSync(saida, { recursive: true, force: true }); fs.mkdirSync(saida, { recursive: true });
const imports = [], mapa = [], args = [];
ARQS.forEach((f, i) => {
  const ext = path.extname(f), nome = 'm' + i;
  fs.copyFileSync(path.join(raiz, f), path.join(saida, nome));
  imports.push(`import ${nome} from "./${nome}";`);
  mapa.push(`  ${JSON.stringify('/' + f)}: [${nome}, ${JSON.stringify(TIPOS[ext] || 'application/octet-stream')}]`);
  args.push('-F', `${nome}=@${path.join(saida, nome)};filename=${nome};type=${binario(f) ? 'application/octet-stream' : 'text/plain'}`);
});
const semCache = ['/', '/index.html', '/sw.js', '/config.js', '/manifest.webmanifest'];
const worker = `${imports.join('\n')}
const ARQ = {
${mapa.join(',\n')}
};
const CAB = ${JSON.stringify(cab)};
const SEM_CACHE = ${JSON.stringify(semCache)};
export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.hostname.startsWith('www.')) { url.hostname = url.hostname.slice(4); return Response.redirect(url.toString(), 301); }
    if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('Método não permitido', { status: 405 });
    const caminho = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const a = ARQ[caminho];
    const h = new Headers(CAB);
    if (!a) { h.set('Content-Type', 'text/plain; charset=utf-8'); return new Response('Página não encontrada', { status: 404, headers: h }); }
    h.set('Content-Type', a[1]);
    h.set('Cache-Control', SEM_CACHE.includes(url.pathname) || SEM_CACHE.includes(caminho) ? 'no-cache' : 'public, max-age=3600');
    return new Response(req.method === 'HEAD' ? null : a[0], { headers: h });
  }
};
`;
fs.writeFileSync(path.join(saida, 'worker.js'), worker);
fs.writeFileSync(path.join(saida, 'metadata.json'), JSON.stringify({ main_module: 'worker.js', compatibility_date: '2026-01-01' }));
args.unshift('-F', `metadata=@${path.join(saida, 'metadata.json')};type=application/json`, '-F', `worker.js=@${path.join(saida, 'worker.js')};filename=worker.js;type=application/javascript+module`);
fs.writeFileSync(path.join(saida, 'curl-args.txt'), args.map(a => JSON.stringify(a)).join(' '));
console.log(`${ARQS.length} arquivos montados em ${saida}`);
