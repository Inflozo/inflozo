// AD-21: the editing canvas is a SAME-ORIGIN iframe, which is why NFR-3 uses
// frame-ancestors 'self' rather than 'none'.
export default function Frame() {
  return <main><h1 id="probe">FRAME-HOST</h1><iframe src="/" title="canvas" width="400" height="200" /></main>
}
