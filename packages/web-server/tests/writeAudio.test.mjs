import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { ReadableStream } from 'node:stream/web'
import test from 'node:test'

import { safeMusicName, writeAudio } from '../src/app/modules/music/writeAudio.ts'

const mp3 = Buffer.concat([Buffer.from('ID3\x04\0\0\0\0\0\0\0\0'), Buffer.from('test audio')])
const response = (data, type = 'audio/mpeg', chunkSize = data.length) => new Response(new ReadableStream({
  start(controller) {
    for (let start = 0; start < data.length; start += chunkSize) {
      controller.enqueue(data.subarray(start, start + chunkSize))
    }
    controller.close()
  },
}), { headers: { 'content-type': type, 'content-length': String(data.length) } })

const withDirectory = async (run) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'anylisten-audio-test-'))
  try { await run(root) } finally { await rm(root, { recursive: true, force: true }) }
}

test('writes a valid audio stream even when the signature crosses chunks', async () => withDirectory(async (root) => {
  const progress = []
  const result = await writeAudio({ root, id: 'one', baseName: 'Singer - Song', fallbackExtension: 'mp3',
    response: response(mp3, 'audio/mpeg', 2), onProgress: (value) => progress.push(value) })
  assert.deepEqual(result, { status: 'completed', fileName: 'Singer - Song.mp3' })
  assert.deepEqual(await readFile(path.join(root, result.fileName)), mp3)
  assert.equal(progress.at(-1), 99)
  assert.deepEqual(await readdir(root), [result.fileName])
}))

test('never overwrites an existing song', async () => withDirectory(async (root) => {
  const fileName = 'Singer - Song.mp3'
  await writeFile(path.join(root, fileName), 'original')
  const result = await writeAudio({ root, id: 'two', baseName: 'Singer - Song', fallbackExtension: 'mp3',
    response: response(mp3), onProgress: () => {} })
  assert.equal(result.status, 'skipped')
  assert.equal(await readFile(path.join(root, fileName), 'utf8'), 'original')
}))

test('rejects non-audio bodies and removes partial files', async () => withDirectory(async (root) => {
  await assert.rejects(writeAudio({ root, id: 'three', baseName: 'Bad', fallbackExtension: 'mp3',
    response: response(Buffer.from('<html>error page</html>'), 'application/octet-stream', 3), onProgress: () => {} }),
  /invalid audio data/)
  assert.deepEqual(await readdir(root), [])
}))

test('rejects a lower format when lossless audio was requested', async () => withDirectory(async (root) => {
  await assert.rejects(writeAudio({ root, id: 'four', baseName: 'Song', fallbackExtension: 'flac',
    response: response(mp3, 'audio/mpeg', 2), onProgress: () => {} }), /different audio format/)
  assert.deepEqual(await readdir(root), [])
}))

test('accepts an MP3 frame without an ID3 tag', async () => withDirectory(async (root) => {
  const frame = Buffer.from([0xff, 0xfb, 0x90, 0x64, 0, 0, 0, 0, 0, 0, 0, 0])
  const result = await writeAudio({ root, id: 'five', baseName: 'Frame', fallbackExtension: 'mp3',
    response: response(frame), onProgress: () => {} })
  assert.equal(result.status, 'completed')
}))

test('removes the partial file when the network stream fails', async () => withDirectory(async (root) => {
  const broken = new Response(new ReadableStream({
    start(controller) { controller.enqueue(mp3) },
    pull(controller) { controller.error(new Error('connection dropped')) },
  }), { headers: { 'content-type': 'audio/mpeg' } })
  await assert.rejects(writeAudio({ root, id: 'six', baseName: 'Interrupted', fallbackExtension: 'mp3',
    response: broken, onProgress: () => {} }), /connection dropped/)
  assert.deepEqual(await readdir(root), [])
}))

test('sanitizes path separators and reserved characters', () => {
  assert.equal(safeMusicName('../A:B\\C?'), '.._A_B_C_')
})
