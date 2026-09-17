// Story 4.11 — the render matrix's totals, printed once after every worker has finished and stored nowhere: the cases
// that ran, the designs and packs they cover (each case test carries both as annotations) and axe's violations.

export default class Totals {
  onBegin(_config, suite) {
    this.cases = suite.allTests().filter((t) => t.annotations.some((a) => a.type === 'design'))
    this.violations = 0
  }

  onTestEnd(test, result) {
    for (const a of result.annotations ?? test.annotations) if (a.type === 'violations') this.violations += Number(a.description)
  }

  onEnd(result) {
    const of = (type) => new Set(this.cases.map((t) => t.annotations.find((a) => a.type === type)?.description)).size
    console.log(`\nrender matrix: ${this.cases.length} cases · ${of('design')} designs · ${of('pack')} packs · ${this.violations} violations — ${result.status}\n`)
  }
}
