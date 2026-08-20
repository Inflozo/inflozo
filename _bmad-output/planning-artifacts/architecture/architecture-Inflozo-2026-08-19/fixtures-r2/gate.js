// The Ghost-major -> gscan-version map. THE BUNDLED VERSION IS THE INPUT, not the spec flag.
// Ghost 5.130.6 bundles gscan 4.49.7; Ghost 6.58.0 bundles gscan 6.4.2 (read from both images).
const TARGETS = [
  { major: '5.x', pkg: 'gscan4', checkVersion: 'v5' },
  { major: '6.x', pkg: 'gscan6', checkVersion: 'v6' },
];
async function run(themeDir) {
  const out = [];
  for (const t of TARGETS) {
    const gscan = require(t.pkg);
    const started = process.hrtime.bigint();
    const res = await gscan.check(themeDir, { checkVersion: t.checkVersion });
    const f = gscan.format(res, { checkVersion: t.checkVersion });
    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    const errs = f.results.error || [], warns = f.results.warning || [];
    out.push({
      major: t.major, gscan: require(`${t.pkg}/package.json`).version, spec: t.checkVersion,
      ms: +ms.toFixed(1),
      errors: errs.map((e) => (e.code || e.rule || '').replace(/<[^>]+>/g, '').slice(0, 60)),
      warnings: warns.map((w) => (w.code || w.rule || '').replace(/<[^>]+>/g, '').slice(0, 60)),
    });
  }
  return out;
}
if (require.main === module) {
  run(process.argv[2]).then((r) => {
    for (const x of r) {
      console.log(`Ghost ${x.major}  via gscan ${x.gscan} (${x.spec})  ->  ERRORS ${x.errors.length}  WARNINGS ${x.warnings.length}   [${x.ms} ms]`);
      x.errors.forEach((e) => console.log('    ERROR  ', e));
      x.warnings.forEach((w) => console.log('    WARN   ', w));
    }
  });
}
module.exports = { run, TARGETS };
