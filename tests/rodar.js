// Roda todos os testes: node tests/rodar.js
const { spawnSync } = require('child_process'), fs = require('fs'), path = require('path');
fs.mkdirSync(path.join(__dirname, 'capturas'), { recursive: true });
const arquivos = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort();
let falhou = [];
for (const f of arquivos) {
  const t0 = Date.now(), r = spawnSync(process.execPath, [path.join(__dirname, f)], { encoding: 'utf8', cwd: __dirname, timeout: 300000 });
  const ok = r.status === 0;
  console.log(`${ok ? '✓' : '✗'} ${f} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  if (!ok) { falhou.push(f); console.log((r.stdout || '') + (r.stderr || '')); }
}
console.log(falhou.length ? `\n${falhou.length} arquivo(s) com falha: ${falhou.join(', ')}` : `\nTodos os ${arquivos.length} arquivos de teste passaram.`);
process.exit(falhou.length ? 1 : 0);
