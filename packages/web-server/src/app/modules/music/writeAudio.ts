import { createWriteStream } from 'node:fs'
import { access, link, open, unlink } from 'node:fs/promises'
import path from 'node:path'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const MAX_BYTES = 500 * 1024 * 1024
const audioTypes = new Set([
  'audio/aac', 'audio/flac', 'audio/x-flac', 'audio/mp4', 'audio/x-m4a', 'audio/mpeg',
  'audio/x-mpeg', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/wave',
  'application/octet-stream',
])

export const safeMusicName = (value: string) => {
  const name = value.replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, '_').replace(/[. ]+$/g, '').trim().slice(0, 180)
  return name || 'music'
}

const audioExtension = (chunk: Buffer) => {
  if (chunk.subarray(0, 3).toString() === 'ID3') return 'mp3'
  if (chunk.subarray(0, 4).toString() === 'fLaC') return 'flac'
  if (chunk.subarray(0, 4).toString() === 'OggS') return 'ogg'
  if (chunk[0] === 0xff && (chunk[1] & 0xe0) === 0xe0 && (chunk[1] & 0x06) !== 0) return 'mp3'
  if (chunk[0] === 0xff && (chunk[1] & 0xf6) === 0xf0) return 'aac'
  if (chunk.subarray(0, 4).toString() === 'RIFF' && chunk.subarray(8, 12).toString() === 'WAVE') return 'wav'
  if (chunk.subarray(4, 8).toString() === 'ftyp') return 'm4a'
  return null
}

export const writeAudio = async ({
  root, id, baseName, fallbackExtension, response, onProgress,
}: {
  root: string
  id: string
  baseName: string
  fallbackExtension: string
  response: Response
  onProgress: (progress: number) => void
}): Promise<{ status: 'completed' | 'skipped'; fileName: string }> => {
  if (!response.ok || !response.body) throw new Error(`Music source returned HTTP ${response.status}`)
  const contentType = (response.headers.get('content-type') ?? '').toLowerCase().split(';')[0]
  if (!audioTypes.has(contentType)) throw new Error('Music source did not return audio')
  const contentLength = Number(response.headers.get('content-length') ?? 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_BYTES) throw new Error('Audio file exceeds 500 MB limit')
  const fileName = `${safeMusicName(baseName)}.${fallbackExtension}`
  const destination = path.join(root, fileName)
  try {
    await access(destination)
    return { status: 'skipped', fileName }
  } catch { /* file does not exist */ }

  const temp = path.join(root, `.${id}.part`)
  await unlink(temp).catch(() => {})
  const handle = await open(temp, 'wx', 0o600)
  await handle.close()
  try {
    let bytes = 0
    let checked = false
    let prefix = Buffer.alloc(0)
    const limit = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        if (!checked) {
          prefix = Buffer.concat([prefix, chunk])
          if (prefix.length < 12) return callback()
          checked = true
          const extension = audioExtension(prefix)
          if (!extension) return callback(new Error('Music source returned invalid audio data'))
          if (extension !== fallbackExtension) return callback(new Error('Music source returned a different audio format than requested'))
          chunk = prefix
        }
        bytes += chunk.length
        onProgress(contentLength > 0 && Number.isFinite(contentLength)
          ? Math.min(99, Math.floor(bytes / contentLength * 100)) : 0)
        callback(bytes > MAX_BYTES ? new Error('Audio file exceeds 500 MB limit') : null, chunk)
      },
    })
    await pipeline(Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]), limit, createWriteStream(temp, { flags: 'w' }))
    if (!checked) throw new Error('Music source returned an empty or invalid audio file')
    try {
      await link(temp, destination)
      return { status: 'completed', fileName }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
      return { status: 'skipped', fileName }
    }
  } finally {
    await unlink(temp).catch(() => {})
  }
}
