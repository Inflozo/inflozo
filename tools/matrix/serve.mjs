// Story 4.11 — the render matrix's page server: `node:http`, nothing else. It serves the editor's canvas document
// (`pilotsCanvasDocument()`, the exact bytes `/canvas` serves to the editor and `/pilots`) and Orbit Weekly's pictures (`pilotImage()`), so
// `url()`, `srcset` and every picture resolve as they do in the editor. The spec routes the pictures' real origin
// (`https://orbit-weekly.example`) to `/images/` here; no URL in the markup is ever rewritten.
//
// Story 6.2 — `/?pack=<id>` is that document in a reference pack, as `/canvas?pack=` serves it; `/?specimen=<pairing>` is a
// pairing's specimen document (`cases.mjs`); and `/canvas?font=<file>` is the pool's own woff2, as the app's route serves
// it — so every face a case draws is the theme's file from this server, and nothing else is on the network.

import { createServer } from 'node:http'
import { pilotImage, pilotsCanvasDocument, poolFont, presetPack, specimenDocument, SPECIMENS } from './cases.mjs'

export async function serve() {
  const docs = new Map()
  const doc = (key, build) => docs.get(key) ?? docs.set(key, build()).get(key)
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    if (url.pathname === '/') {
      const specimen = url.searchParams.get('specimen')
      const pack = url.searchParams.get('pack') ?? 'paper'
      if (specimen !== null && !SPECIMENS().includes(specimen)) return res.writeHead(404).end()
      if (specimen === null && presetPack(pack) === undefined) return res.writeHead(404).end()
      const html = specimen !== null ? doc(`specimen:${specimen}`, () => specimenDocument(specimen)) : doc(`pack:${pack}`, () => pilotsCanvasDocument(undefined, [], pack))
      return res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html)
    }
    if (url.pathname === '/canvas') {
      const font = poolFont(url.searchParams.get('font') ?? '')
      if (font === null) return res.writeHead(404).end()
      return res.writeHead(200, { 'content-type': 'font/woff2' }).end(font)
    }
    const name = /^\/images\/([a-z0-9-]+)\.svg$/.exec(url.pathname)?.[1]
    const svg = name === undefined ? null : pilotImage(name)
    if (svg === null) return res.writeHead(404).end()
    return res.writeHead(200, { 'content-type': 'image/svg+xml' }).end(svg)
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve) }) }
}
