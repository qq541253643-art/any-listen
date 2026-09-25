import { access, constants, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

import { buildMusicName, getFileType, VIRTUAL_PROTOCOL } from '@any-listen/common/tools'
import { API_PREFIX, PROXY_SERVER_PATH } from '@any-listen/common/constants'
import { buildFileMetadata } from '@any-listen/nodejs/music'

import getStore from '@/app/shared/store'
import { nodeProcess } from '@/shared/utils'
import { getMusicUrl } from './index'
import { writeAudio } from './writeAudio'
import { toDownloadUrl } from './downloadUrl'

const MAX_BATCH = 500
const QUALITIES: AnyListen.Music.Quality[] = ['128k', '192k', '320k', 'flac', 'flac24bit', 'wav', 'dolby', 'master']
const FALLBACK_QUALITIES: AnyListen.IPCMusic.DownloadQuality[] = ['flac24bit', 'flac', '320k', '192k', '128k']
let tasks: AnyListen.IPCMusic.DownloadTask[] | null = null
let busy = false

const store = () => getStore('music-downloads')
const save = () => store().set('tasks', tasks)
const snapshot = () => tasks!.map((task) => ({ ...task }))

const getDirectory = async () => {
  const configured = nodeProcess.env.MUSIC_DOWNLOAD_DIR
  if (!configured || !path.isAbsolute(configured)) throw new Error('Music download directory is not configured')
  const root = await realpath(configured)
  if (!(await stat(root)).isDirectory()) throw new Error('Music download directory is unavailable')
  await access(root, constants.W_OK)
  return root
}

const download = async (task: AnyListen.IPCMusic.DownloadTask) => {
  const root = await getDirectory()
  let lastError: unknown
  const start = FALLBACK_QUALITIES.indexOf(task.quality)
  const qualities = start < 0 ? [task.quality] : FALLBACK_QUALITIES.slice(start)
  for (const quality of qualities) {
    try {
      const resolved = await getMusicUrl({ musicInfo: task.musicInfo, quality, isRefresh: true })
      const actualQuality = resolved.quality as AnyListen.IPCMusic.DownloadQuality
      if (!QUALITIES.includes(actualQuality) ||
        (start >= 0 && FALLBACK_QUALITIES.indexOf(actualQuality) < start)) {
        throw new Error('Music source returned an unsupported audio quality')
      }
      const port = Number(nodeProcess.env.PORT ?? 9500)
      const source = toDownloadUrl(resolved.url, port, VIRTUAL_PROTOCOL, `${API_PREFIX}${PROXY_SERVER_PATH}`)
      const response = await fetch(source, { signal: AbortSignal.timeout(10 * 60_000) })
      const result = await writeAudio({
        root,
        id: task.id,
        baseName: `${buildMusicName('%singer% - %name%', task.musicInfo.name, task.musicInfo.singer)} (请求${task.quality})`,
        fallbackExtension: getFileType(actualQuality),
        response,
        onProgress: (progress) => (task.progress = progress),
      })
      task.status = result.status
      task.fileName = result.fileName
      task.savedQuality = actualQuality
      task.fileBitrateLabel = (await buildFileMetadata(path.join(root, result.fileName)).catch(() => null))?.bitrateLabel || undefined
      task.progress = 100
      return
    } catch (error) {
      lastError = error
      task.progress = 0
    }
  }
  throw lastError
}

const pump = async () => {
  if (busy || !tasks) return
  busy = true
  try {
    for (const task of tasks) {
      if (task.status !== 'queued') continue
      task.status = 'running'
      task.error = undefined
      save()
      try {
        await download(task)
      } catch (error) {
        task.status = 'failed'
        task.error = error instanceof Error ? error.message : 'Download failed'
      }
      save()
    }
  } finally {
    busy = false
  }
}

export const initDownloadQueue = () => {
  if (tasks) return
  tasks = store().get<AnyListen.IPCMusic.DownloadTask[]>('tasks') ?? []
  for (const task of tasks) if (task.status === 'running') task.status = 'queued'
  save()
  void pump()
}

export const getMusicDownloads = () => {
  initDownloadQueue()
  return snapshot()
}

export const queueMusicDownloads = (musics: AnyListen.Music.MusicInfo[], quality: AnyListen.IPCMusic.DownloadQuality) => {
  initDownloadQueue()
  if (!QUALITIES.includes(quality) || !Array.isArray(musics) || musics.length < 1 || musics.length > MAX_BATCH) {
    throw new Error('Invalid download request')
  }
  for (const music of musics) {
    if (!music || music.isLocal || typeof music.id !== 'string' || typeof music.name !== 'string' ||
      typeof music.singer !== 'string' || !music.meta || typeof music.meta.source !== 'string') {
      throw new Error('Invalid online music')
    }
  }
  const existing = new Set(tasks!.filter((task) => task.status === 'queued' || task.status === 'running')
    .map((task) => `${task.musicInfo.id}:${task.quality}`))
  for (const music of musics as AnyListen.Music.MusicInfoOnline[]) {
    const key = `${music.id}:${quality}`
    if (existing.has(key)) continue
    existing.add(key)
    tasks!.push({ id: randomUUID(), musicInfo: music, quality, status: 'queued', progress: 0 })
  }
  if (tasks!.length > 2000) tasks = tasks!.filter((task) => task.status === 'queued' || task.status === 'running').concat(tasks!.filter((task) => task.status !== 'queued' && task.status !== 'running').slice(-1000))
  save()
  void pump()
  return snapshot()
}

export const retryMusicDownload = (id: string) => {
  initDownloadQueue()
  const task = tasks!.find((item) => item.id === id)
  if (!task || task.status !== 'failed') throw new Error('Download task cannot be retried')
  task.status = 'queued'
  task.progress = 0
  task.error = undefined
  save()
  void pump()
  return snapshot()
}
