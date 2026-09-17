// Story 4.11 — the render matrix's page server: `node:http`, nothing else. It serves the editor's canvas document
// (`pilotsCanvasDocument()`, the exact bytes `/pilots/frame` serves) and Orbit Weekly's pictures (`pilotImage()`), so
// `url()`, `srcset` and every picture resolve as they do in the editor. The spec routes the pictures' real origin
// (`https://orbit-weekly.example`) to `/images/` here; no URL in the markup is ever rewritten.

import { createServer } from 'node:http'
import { pilotImage, pilotsCanvasDocument } from './cases.mjs'

export async function serve() {
  const doc = pilotsCanvasDocument()
  const server = createServer((req, res) => {
    const path = new URL(req.url ?? '/', 'http://127.0.0.1').pathname
    if (path === '/') return res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(doc)
    const name = /^\/images\/([a-z0-9-]+)\.svg$/.exec(path)?.[1]
    const svg = name === undefined ? null : pilotImage(name)
    if (svg === null) return res.writeHead(404).end()
    return res.writeHead(200, { 'content-type': 'image/svg+xml' }).end(svg)
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((resolve) => server.close(resolve)) }
}
