// MARKETING: reads no headers, so it must stay statically prerendered even though
// proxy.ts sets a CSP response header on it.
export default function Home() {
  return <main><h1 id="probe">MARKETING-STATIC</h1><p>No nonce here, by design.</p></main>
}
