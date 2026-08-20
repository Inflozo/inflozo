// APP: reads the per-request nonce, which is what makes the page dynamic.
import { headers } from 'next/headers'
export default async function Editor() {
  const nonce = (await headers()).get('x-nonce') ?? '(none)'
  return (
    <main>
      <h1 id="probe">APP-DYNAMIC</h1>
      <p id="nonce">{nonce}</p>
      <script nonce={nonce} dangerouslySetInnerHTML={{ __html: `window.__NONCED__ = true;` }} />
    </main>
  )
}
