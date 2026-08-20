const { run } = require('./gate.js');
(async () => {
  const dir = process.argv[2], N = 5;
  const acc = {};
  for (let i = 0; i < N; i++) {
    for (const r of await run(dir)) (acc[`${r.major} / gscan ${r.gscan}`] ||= []).push(r.ms);
  }
  let total = 0;
  for (const [k, v] of Object.entries(acc)) {
    const med = v.slice().sort((a, b) => a - b)[Math.floor(v.length / 2)];
    total += med;
    console.log(`  ${k.padEnd(26)} median ${med.toFixed(1)} ms   runs [${v.map(x=>x.toFixed(0)).join(', ')}]`);
  }
  console.log(`  ${'BOTH CHECKERS'.padEnd(26)} median ${total.toFixed(1)} ms`);
})();
