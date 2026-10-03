// Story 4.11 — the render matrix's totals, printed once after every worker has finished and stored nowhere: the cases
// that ran, the designs and packs they cover (each case test carries both as annotations) and axe's violations. Story
// 6.1 adds the sideways check: how many drawn cases measured it behind its control, and how many scrolled sideways.

export default class Totals {
  onBegin(_config, suite) {
    this.cases = suite.allTests().filter((t) => t.annotations.some((a) => a.type === 'design'))
    this.violations = 0
    this.measured = 0
    this.sideways = 0
  }

  onTestEnd(test, result) {
    for (const a of result.annotations ?? test.annotations) {
      if (a.type === 'violations') this.violations += Number(a.description)
      if (a.type === 'overflow') { this.measured++; if (Number(a.description) > 0) this.sideways++ }
    }
  }

  onEnd(result) {
    const of = (type) => new Set(this.cases.map((t) => t.annotations.find((a) => a.type === type)?.description)).size
    console.log(`\nrender matrix: ${this.cases.length} cases · ${of('design')} designs · ${of('pack')} packs · ${this.violations} violations · ${this.sideways} of ${this.measured} drawn cases scroll sideways (each behind its positive control) — ${result.status}\n`)
  }
}
