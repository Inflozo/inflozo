// Story 7.18a — the theme's zip (`server/deploy/zip.ts`): every entry read back with `inflateRawSync` from the central
// directory, its CRC and sizes checked; two runs byte-identical, and the input's key order changes nothing (AD-14).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crc32, inflateRawSync } from 'node:zlib'
import { zipTheme } from './server/deploy/zip.ts'

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
