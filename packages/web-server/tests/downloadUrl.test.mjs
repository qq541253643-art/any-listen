import assert from 'node:assert/strict'
import test from 'node:test'

import { toDownloadUrl } from '../src/app/modules/music/downloadUrl.ts'

const convert = (url) => toDownloadUrl(url, 9500, 'al-ps-host:', '/api/p_static')

test('uses the local proxy for source URLs with playback headers', () => {
  assert.equal(convert('al-ps-host:./api/p_static/abc123.mp3'), 'http://127.0.0.1:9500/api/p_static/abc123.mp3')
  assert.equal(convert('./api/p_static/abc123.flac'), 'http://127.0.0.1:9500/api/p_static/abc123.flac')
})

test('keeps ordinary music URLs and rejects other internal routes', () => {
  assert.equal(convert('https://music.example/song.mp3'), 'https://music.example/song.mp3')
  assert.throws(() => convert('al-ps-host:./api/settings'), /invalid URL/)
  assert.throws(() => convert('al-ps-host:./api/p_static/../settings'), /invalid URL/)
  assert.throws(() => convert('file:///etc/passwd'), /invalid URL/)
})
