import { crc32, deflateRawSync, inflateRawSync } from 'node:zlib'

/**
 * STORY 7.18a — THE THEME'S ZIP, WRITTEN BY US (no dependency where `node:zlib` does it). Deterministic, so identical files
 * make identical bytes (AD-14) — the artefact Pre-flight checked is the artefact Ship it uploads, byte for byte, and a
 * re-made one is equal when nothing moved:
 *   - entries in code-unit path order, every one at the root (Ghost reads `package.json` there — the recorders' shape);
 *   - every timestamp the DOS epoch, 1980-01-01 00:00:00, and no extra field (no Unix time, no uid);
 *   - DEFLATE through `deflateRawSync` at level 9, CRC-32 through `zlib.crc32`; UTF-8 names (flag bit 11);
 *   - no ZIP64: a theme past 4 GiB or 65,535 files is refused here (Ghost 6.58.0's own ceiling is 1 GiB compressed — 7.4's
 *     reading — and the size budget is Story 7.29's).
 * `zip.test.ts` reads every entry back with `inflateRawSync` and holds two runs byte-identical.
 */

const DOS_TIME = 0 // 00:00:00
const DOS_DATE = (0 << 9) | (1 << 5) | 1 // 1980-01-01
const UTF8 = 0x0800
const DEFLATE = 8
const VERSION = 20

const byCode = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

export function zipTheme(files: Readonly<Record<string, string | Uint8Array>>): Uint8Array {
  const paths = Object.keys(files).sort(byCode)
  if (paths.length > 0xffff) throw new Error(`zip: ${paths.length} files is more than a zip without ZIP64 holds`)
  const locals: Buffer[] = []
  const centrals: Buffer[] = []
  let offset = 0
  for (const path of paths) {
    if (path === '' || path.startsWith('/') || path.split('/').some((part) => part === '' || part === '.' || part === '..') || path.includes('\\')) {
      throw new Error(`zip: ${JSON.stringify(path)} is no relative file path`)
    }
    const value = files[path] as string | Uint8Array
    const data = typeof value === 'string' ? Buffer.from(value, 'utf8') : Buffer.from(value.buffer, value.byteOffset, value.byteLength)
    const packed = deflateRawSync(data, { level: 9 })
    const crc = crc32(data)
    const name = Buffer.from(path, 'utf8')
    if (data.length > 0xfffffffe || packed.length > 0xfffffffe || offset > 0xfffffffe) throw new Error(`zip: ${path} takes the zip past 4 GiB`)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(VERSION, 4)
    local.writeUInt16LE(UTF8, 6)
    local.writeUInt16LE(DEFLATE, 8)
    local.writeUInt16LE(DOS_TIME, 10)
    local.writeUInt16LE(DOS_DATE, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(packed.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28)
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(VERSION, 4)
    central.writeUInt16LE(VERSION, 6)
    central.writeUInt16LE(UTF8, 8)
    central.writeUInt16LE(DEFLATE, 10)
    central.writeUInt16LE(DOS_TIME, 12)
    central.writeUInt16LE(DOS_DATE, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(packed.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(name.length, 28)
    // extra 0, comment 0, disk 0, internal attributes 0, external attributes 0 (each zero-filled by `alloc`)
    central.writeUInt32LE(offset, 42)
    locals.push(local, name, packed)
    centrals.push(central, name)
    offset += local.length + name.length + packed.length
  }
  const directory = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(paths.length, 8)
  end.writeUInt16LE(paths.length, 10)
  end.writeUInt32LE(directory.length, 12)
  end.writeUInt32LE(offset, 16)
  return new Uint8Array(Buffer.concat([...locals, directory, end]))
}

// ── STORY 7.21 — THE LIVE THEME, READ BACK (FR-J16's drift check) ────────────────────────────────────────────────────────

/** THE MOST A LIVE THEME MAY UNPACK TO, all its files together: the check holds the downloaded zip and every entry unpacked in one
 *  function at once, inside AD-11's 4096 MB (R-262), beside the compiled theme. 256 MiB is far past any theme Inflozo writes
 *  plus a customer's hand edits; a theme past it is said as unreadable (D3b) and the deploy goes on — never read, never drift. */
export const LIVE_MAX_BYTES = 256 * 1024 * 1024

const EOCD = 0x06054b50
const CENTRAL = 0x02014b50
const LOCAL = 0x04034b50
const STORED = 0

/**
 * THE LIVE THEME'S FILES, path → bytes, read from the zip Ghost hands over (`GET themes/{name}/download/`). UNTRUSTED INPUT: it is
 * read from its central directory (the sizes a data-descriptor zip leaves out of its local headers are there), stored and
 * deflated entries only, every entry checked against its declared size and CRC-32, under `cap` for all of them together, and
 * never written to disk. Directory entries are skipped (`@tryghost/zip`'s `compress` may write them). A ZIP64 zip, an encrypted
 * entry, any other method, a total past the cap, or anything that is not a zip THROWS — the drift check reads every throw as
 * `unreadable` and the deploy proceeds.
 */
export function unzipTheme(bytes: Uint8Array, cap: number = LIVE_MAX_BYTES): Record<string, Uint8Array> {
  const b = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (b.length < 22 || b.readUInt32LE(0) !== LOCAL) throw new Error('unzip: not a zip')
  // the end record: the last 22 bytes, or earlier by a comment of at most 65,535 bytes
  let end = -1
  for (let at = b.length - 22; at >= Math.max(0, b.length - 22 - 0xffff); at--) {
    if (b.readUInt32LE(at) === EOCD && at + 22 + b.readUInt16LE(at + 20) === b.length) {
      end = at
      break
    }
  }
  if (end < 0) throw new Error('unzip: no end record')
  const count = b.readUInt16LE(end + 10)
  const size = b.readUInt32LE(end + 12)
  const start = b.readUInt32LE(end + 16)
  if (count === 0xffff || size === 0xffffffff || start === 0xffffffff) throw new Error('unzip: ZIP64 is not read')
  if (b.readUInt16LE(end + 4) !== 0 || b.readUInt16LE(end + 6) !== 0 || b.readUInt16LE(end + 8) !== count) throw new Error('unzip: a split zip is not read')
  if (start + size > end) throw new Error('unzip: the central directory overruns the end record')
  const out: Record<string, Uint8Array> = {}
  let total = 0
  let at = start
  for (let i = 0; i < count; i++) {
    if (at + 46 > start + size || b.readUInt32LE(at) !== CENTRAL) throw new Error('unzip: a bad central directory')
    const flags = b.readUInt16LE(at + 8)
    const method = b.readUInt16LE(at + 10)
    const crc = b.readUInt32LE(at + 16)
    const packed = b.readUInt32LE(at + 20)
    const unpacked = b.readUInt32LE(at + 24)
    const nameLength = b.readUInt16LE(at + 28)
    const extra = b.readUInt16LE(at + 30)
    const comment = b.readUInt16LE(at + 32)
    const local = b.readUInt32LE(at + 42)
    const next = at + 46 + nameLength + extra + comment
    if (next > start + size) throw new Error('unzip: a bad central directory')
    const path = b.subarray(at + 46, at + 46 + nameLength).toString('utf8')
    at = next
    if (packed === 0xffffffff || unpacked === 0xffffffff || local === 0xffffffff) throw new Error('unzip: ZIP64 is not read')
    if ((flags & 0x0001) !== 0) throw new Error(`unzip: ${JSON.stringify(path)} is encrypted`)
    if (path.endsWith('/')) continue
    if (method !== STORED && method !== DEFLATE) throw new Error(`unzip: ${JSON.stringify(path)} uses method ${method}`)
    if (Object.hasOwn(out, path)) throw new Error(`unzip: ${JSON.stringify(path)} is in the zip twice`)
    total += unpacked
    if (total > cap) throw new Error('unzip: the theme unpacks past the size cap')
    if (local + 30 > b.length || b.readUInt32LE(local) !== LOCAL) throw new Error(`unzip: ${JSON.stringify(path)} has no local header`)
    const from = local + 30 + b.readUInt16LE(local + 26) + b.readUInt16LE(local + 28)
    if (from + packed > b.length) throw new Error(`unzip: ${JSON.stringify(path)} runs past the zip`)
    const data = b.subarray(from, from + packed)
    // a declared size is a claim: the inflate is held to what is left of the cap, then to the claim and the CRC
    const body = method === STORED ? data : inflateRawSync(data, { maxOutputLength: Math.max(1, cap - (total - unpacked)) })
    if (body.length !== unpacked || crc32(body) !== crc) throw new Error(`unzip: ${JSON.stringify(path)} is not what its header says`)
    out[path] = new Uint8Array(body)
  }
  return out
}
