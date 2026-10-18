import { crc32, deflateRawSync } from 'node:zlib'

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
