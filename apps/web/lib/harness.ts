/** Story 5.9 (R-146) — the ONE switch the keyboard harness answers to, read in one place so the page and the canvas
 *  route cannot disagree about it. The gate (`tools/keyboard/run-keyboard-gate.sh`) sets it on the `next dev` it
 *  boots; nothing in production sets it, so both harness routes answer "not found" there and the deployed walk
 *  asserts that they do. */
export const HARNESS = process.env.INFLOZO_HARNESS === '1'
