// Publica uma pasta no Cloudflare Pages mandando os arquivos junto com a implantação.
// uso: node ferramentas/publicar-cloudflare.js <pasta-com-o-site> <id-da-conta> <projeto>  → depois: eval curl $(cat ferramentas/curl-args.txt)
// precisa do pacote blake3-wasm (vem com o wrangler: npm install wrangler@4)
const fs = require('fs'), path = require('path'), { hash } = require('blake3-wasm');
const [dir, conta, projeto] = process.argv.slice(2);
const arquivos = [];
(function andar(d) { for (const f of fs.readdirSync(d)) { const c = path.join(d, f); if (fs.statSync(c).isDirectory()) andar(c); else arquivos.push(c); } })(dir);
const especiais = ['_headers', '_redirects', '_routes.json'];
const manifest = {}, args = ['-sS', '-X', 'POST', `https://api.cloudflare.com/client/v4/accounts/${conta}/pages/projects/${projeto}/deployments`];
for (const c of arquivos) {
  const rel = '/' + path.relative(dir, c).split(path.sep).join('/'), buf = fs.readFileSync(c);
  if (especiais.includes(rel.slice(1))) { args.push('-F', `${rel.slice(1)}=@${c};filename=${rel.slice(1)}`); continue; }
  const h = hash(buf.toString('base64') + path.extname(c).slice(1)).toString('hex').slice(0, 32);
  manifest[rel] = h; args.push('-F', `${h}=@${c};filename=${h}`);
}
fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(manifest));
args.push('-F', `manifest=<${path.join(__dirname, 'manifest.json')}`, '-F', 'branch=main');
fs.writeFileSync(path.join(__dirname, 'curl-args.txt'), args.map(a => JSON.stringify(a)).join(' '));
