// Story 7.18a — the theme's zip (`server/deploy/zip.ts`): every entry read back with `inflateRawSync` from the central
// directory, its CRC and sizes checked; two runs byte-identical, and the input's key order changes nothing (AD-14).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crc32, deflateRawSync, inflateRawSync } from 'node:zlib'
import { LIVE_MAX_BYTES, unzipTheme, zipTheme } from './server/deploy/zip.ts'

/** A zip's entries, read the way an extractor reads them: the end record, then the central directory, then each local entry. */
function unzip(bytes: Uint8Array): { path: string; data: Buffer; time: number; date: number; flags: number }[] {
  const b = Buffer.from(bytes)
  const end = b.length - 22
  assert.equal(b.readUInt32LE(end), 0x06054b50, 'the end record is last, with no comment')
  const count = b.readUInt16LE(end + 10)
  let at = b.readUInt32LE(end + 16)
  assert.equal(at + b.readUInt32LE(end + 12), end, 'the directory ends where the end record starts')
  const out = []
  for (let i = 0; i < count; i++) {
    assert.equal(b.readUInt32LE(at), 0x02014b50)
    const flags = b.readUInt16LE(at + 8)
    const time = b.readUInt16LE(at + 12)
    const date = b.readUInt16LE(at + 14)
    const crc = b.readUInt32LE(at + 16)
    const packed = b.readUInt32LE(at + 20)
    const size = b.readUInt32LE(at + 24)
    const nameLength = b.readUInt16LE(at + 28)
    const local = b.readUInt32LE(at + 42)
    const path = b.subarray(at + 46, at + 46 + nameLength).toString('utf8')
    assert.equal(b.readUInt32LE(local), 0x04034b50, path)
    assert.equal(b.readUInt16LE(local + 26), nameLength, path)
    const start = local + 30 + nameLength + b.readUInt16LE(local + 28)
    const data = inflateRawSync(b.subarray(start, start + packed))
    assert.equal(data.length, size, path)
    assert.equal(crc32(data), crc, path)
    out.push({ path, data, time, date, flags })
    at += 46 + nameLength
  }
  return out
}

const FILES = {
  'package.json': '{\n  "name": "inflozo-field-notes"\n}\n',
  'default.hbs': '<!DOCTYPE html>\n<html lang="{{@site.locale}}">\n',
  'partials/sections/home/hero.hbs': '<section class="a4-13">Café — “quoted”</section>\n',
  'assets/fonts/inter-latin.woff2': new Uint8Array([0, 1, 2, 3, 255, 254, 0, 0, 7]),
  'locales/en.json': '{}\n',
  'empty.txt': '',
}

test('every entry reads back byte for byte, in code-unit path order, at the DOS epoch, with UTF-8 names', () => {
  const entries = unzip(zipTheme(FILES))
  assert.deepEqual(entries.map((e) => e.path), Object.keys(FILES).sort((a, b) => (a < b ? -1 : 1)))
  for (const e of entries) {
    const want = FILES[e.path as keyof typeof FILES]
    assert.deepEqual(e.data, Buffer.from(typeof want === 'string' ? Buffer.from(want, 'utf8') : want), e.path)
    assert.equal(e.time, 0, e.path)
    assert.equal(e.date, 0x21, `${e.path}: 1980-01-01`)
    assert.equal(e.flags & 0x0800, 0x0800, e.path)
  }
})

test('two runs, and the same files handed in another order, give identical bytes (AD-14); one byte changed does not', () => {
  const a = zipTheme(FILES)
  const reordered = Object.fromEntries(Object.entries(FILES).reverse())
  assert.deepEqual(zipTheme(FILES), a)
  assert.deepEqual(zipTheme(reordered), a)
  // the control: the comparison can fail
  assert.notDeepEqual(zipTheme({ ...FILES, 'locales/en.json': '{ }\n' }), a)
})

test('a path that is no relative file path is refused, never written', () => {
  for (const bad of ['', '/etc/passwd', '../up.hbs', 'a//b.hbs', 'a/./b.hbs', 'a\\b.hbs', 'dir/']) {
    assert.throws(() => zipTheme({ [bad]: 'x' }), /is no relative file path/, JSON.stringify(bad))
  }
  assert.doesNotThrow(() => zipTheme({ 'partials/a.hbs': 'x' }), 'the control')
})

// ── Story 7.21 — the live theme read back (`unzipTheme`): untrusted input, central directory, stored and deflated, size-capped ──

/** A zip as Ghost's `@tryghost/zip` (archiver) writes one: a directory entry per folder, each file's sizes and CRC left out of its
 *  local header and written after its data in a data descriptor (flag bit 3), some entries stored. `method` per path */
function archiverZip(files: Record<string, string | null>, method: (path: string) => 0 | 8 = () => 8, extra: Partial<{ flags: number; method: number; unpacked: number }> = {}): Uint8Array {
  const parts: Buffer[] = []
  const centrals: Buffer[] = []
  let offset = 0
  for (const [path, body] of Object.entries(files)) {
    const name = Buffer.from(path, 'utf8')
    const data = Buffer.from(body ?? '', 'utf8')
    const m = body === null ? 0 : (extra.method ?? method(path))
    const packed = m === 8 ? deflateRawSync(data) : data
    const flags = (body === null ? 0 : 0x0008) | (extra.flags ?? 0)
    const crc = crc32(data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(flags, 6)
    local.writeUInt16LE(m, 8)
    local.writeUInt16LE(name.length, 26)
    const descriptor = Buffer.alloc(body === null ? 0 : 16)
    if (body !== null) {
      descriptor.writeUInt32LE(0x08074b50, 0)
      descriptor.writeUInt32LE(crc, 4)
      descriptor.writeUInt32LE(packed.length, 8)
      descriptor.writeUInt32LE(data.length, 12)
    }
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(flags, 8)
    central.writeUInt16LE(m, 10)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(packed.length, 20)
    central.writeUInt32LE(extra.unpacked ?? data.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt32LE(offset, 42)
    parts.push(local, name, packed, descriptor)
    centrals.push(central, name)
    offset += local.length + name.length + packed.length + descriptor.length
  }
  const directory = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(Object.keys(files).length, 8)
  end.writeUInt16LE(Object.keys(files).length, 10)
  end.writeUInt32LE(directory.length, 12)
  end.writeUInt32LE(offset, 16)
  return new Uint8Array(Buffer.concat([...parts, directory, end]))
}
const text = (files: Record<string, Uint8Array>) => Object.fromEntries(Object.entries(files).map(([p, b]) => [p, Buffer.from(b).toString('utf8')]))

test('7.21 · zipTheme → unzipTheme: every file back byte for byte, binary included, under its own path', () => {
  const back = unzipTheme(zipTheme(FILES))
  assert.deepEqual(Object.keys(back).sort(), Object.keys(FILES).sort())
  for (const [path, want] of Object.entries(FILES)) {
    assert.deepEqual(Buffer.from(back[path] as Uint8Array), typeof want === 'string' ? Buffer.from(want, 'utf8') : Buffer.from(want), path)
  }
})

test('7.21 · an archiver-shaped zip — directory entries, data descriptors, stored and deflated entries, a dot file — reads right; its directories are skipped', () => {
  const files = { 'partials/': null, 'partials/sections/': null, 'partials/sections/home/hero.hbs': '<section>Hand edited</section>\n', '.editorconfig': 'root = true\n', 'package.json': '{}\n' }
  const back = unzipTheme(archiverZip(files, (p) => (p === 'package.json' ? 0 : 8)))
  assert.deepEqual(text(back), { 'partials/sections/home/hero.hbs': '<section>Hand edited</section>\n', '.editorconfig': 'root = true\n', 'package.json': '{}\n' })
})

test(`7.21 · what is never read throws: past the cap (${LIVE_MAX_BYTES} bytes by default), a lying size, ZIP64, an encrypted entry, another method, not a zip — the check reads each as unreadable`, () => {
  const ok = { 'a.hbs': 'x'.repeat(100), 'b.hbs': 'y'.repeat(100) }
  assert.doesNotThrow(() => unzipTheme(archiverZip(ok), 200), 'the control: exactly the cap reads')
  assert.throws(() => unzipTheme(archiverZip(ok), 199), /past the size cap/)
  assert.throws(() => unzipTheme(archiverZip({ 'a.hbs': 'x'.repeat(100) }, undefined, { unpacked: 10 })), /not what its header says/, 'a declared size is a claim')
  assert.throws(() => unzipTheme(archiverZip({ 'a.hbs': 'x' }, undefined, { unpacked: 0xffffffff })), /ZIP64/)
  assert.throws(() => unzipTheme(archiverZip({ 'a.hbs': 'x' }, undefined, { flags: 0x0001 })), /encrypted/)
  assert.throws(() => unzipTheme(archiverZip({ 'a.hbs': 'x' }, undefined, { method: 12 })), /method 12/)
  const zip64 = Buffer.from(zipTheme({ 'a.hbs': 'x' }))
  zip64.writeUInt32LE(0xffffffff, zip64.length - 22 + 16)
  assert.throws(() => unzipTheme(new Uint8Array(zip64)), /ZIP64/)
  for (const junk of [new TextEncoder().encode('<html>Bad gateway</html>'), new Uint8Array(), new Uint8Array([0x50, 0x4b, 3, 4])]) {
    assert.throws(() => unzipTheme(junk), /not a zip|no end record/)
  }
  const cut = zipTheme({ 'a.hbs': 'x' }).slice(0, -5)
  assert.throws(() => unzipTheme(cut), /no end record/, 'a zip cut short')
})
