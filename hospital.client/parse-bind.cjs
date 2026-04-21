const { execSync } = require('child_process');
try {
  const out = execSync('npx eslint ./src/pages/ --no-fix --format json', {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  parse(out);
} catch (e) {
  if (e.stdout) {
    parse(e.stdout);
  } else {
    console.error('Failed:', e.message);
  }
}

function parse(out) {
  const data = JSON.parse(out);
  const results = [];
  data.forEach(f => {
    const msgs = f.messages.filter(m => m.ruleId === 'react/jsx-no-bind');
    if (msgs.length) {
      const p = f.filePath.replace(/.*hospital\.client[\\/]/, '');
      results.push(`${p}: lines ${msgs.map(m => m.line).join(',')}`);
    }
  });
  console.log(`Total files with jsx-no-bind: ${results.length}`);
  console.log(`Total violations: ${data.reduce((s, f) => s + f.messages.filter(m => m.ruleId === 'react/jsx-no-bind').length, 0)}`);
  results.forEach(r => console.log(r));
}
