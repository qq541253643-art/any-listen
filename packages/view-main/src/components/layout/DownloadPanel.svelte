<script lang="ts">
  import { onMount } from 'svelte'
  import { downloadPanelState } from '@/modules/download/panel.svelte'
  import { getMusicDownloads, queueMusicDownloads, retryMusicDownload } from '@/shared/ipc/music'
  import { settingState } from '@/modules/setting/store/state'

  const qualities: AnyListen.IPCMusic.DownloadQuality[] = ['128k', '192k', '320k', 'flac', 'flac24bit']
  let quality = $state<AnyListen.IPCMusic.DownloadQuality>(
    qualities.includes(settingState.setting['player.playQuality']) ? settingState.setting['player.playQuality'] : '128k',
  )
  let tasks = $state<AnyListen.IPCMusic.DownloadTask[]>([])
  let error = $state('')
  let submitting = $state(false)

  const refresh = async () => {
    try {
      tasks = await getMusicDownloads()
    } catch (cause) {
      error = cause instanceof Error ? cause.message : '无法读取下载任务'
    }
  }
  $effect(() => {
    if (downloadPanelState.visible) void refresh()
  })
  onMount(() => {
    const timer = setInterval(() => {
      if (downloadPanelState.visible) void refresh()
    }, 3000)
    return () => clearInterval(timer)
  })
  const submit = async () => {
    if (!downloadPanelState.musics.length || submitting) return
    error = ''
    submitting = true
    try {
      tasks = await queueMusicDownloads(downloadPanelState.musics, quality)
      downloadPanelState.musics = []
    } catch (cause) {
      error = cause instanceof Error ? cause.message : '加入下载任务失败'
    } finally {
      submitting = false
    }
  }
  const retry = async (id: string) => {
    error = ''
    try {
      tasks = await retryMusicDownload(id)
    } catch (cause) {
      error = cause instanceof Error ? cause.message : '重试失败'
    }
  }
</script>

{#if downloadPanelState.visible}
  <div class="backdrop" role="presentation" onclick={() => (downloadPanelState.visible = false)}></div>
  <dialog open class="panel" aria-modal="true" aria-label="下载到极空间">
    <header>
      <h2>下载到极空间</h2>
      <button aria-label="关闭" onclick={() => (downloadPanelState.visible = false)}>×</button>
    </header>
    {#if downloadPanelState.musics.length}
      <div class="submit">
        <p>将 {downloadPanelState.musics.length} 首歌曲保存到团队音乐文件夹</p>
        <label for="download-quality">音质</label>
        <select id="download-quality" bind:value={quality}>
          {#each qualities as option}
            <option value={option}>{option.toUpperCase()}</option>
          {/each}
        </select>
        <button class="primary" disabled={submitting} onclick={submit}>
          {submitting ? '正在提交…' : '加入下载队列'}
        </button>
      </div>
    {/if}
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    <h3>下载任务</h3>
    <div class="tasks">
      {#each [...tasks].reverse() as task (task.id)}
        <div class="task">
          <div class="task-info">
            <strong>{task.musicInfo.name}</strong>
            <span>{task.musicInfo.singer} · {task.quality.toUpperCase()}</span>
            <small>{task.error ?? {
              queued: '等待中', running: `下载中 ${task.progress}%`, completed: '已完成',
              skipped: '文件已存在，已跳过', failed: '失败',
            }[task.status]}{task.savedQuality && task.savedQuality !== task.quality ? ` · 来源标注 ${task.savedQuality.toUpperCase()}` : ''}{task.fileBitrateLabel ? ` · 文件检测 ${task.fileBitrateLabel.toUpperCase()}` : ''}{task.fileName ? ` · ${task.fileName}` : ''}</small>
          </div>
          {#if task.status === 'failed'}
            <button onclick={() => retry(task.id)}>重试</button>
          {/if}
        </div>
      {:else}
        <p class="empty">还没有下载任务</p>
      {/each}
    </div>
  </dialog>
{/if}

<style lang="less">
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 49;
    background: rgb(0 0 0 / 45%);
  }
  .panel {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 50;
    width: min(560px, calc(100vw - 24px));
    max-height: min(80dvh, 720px);
    padding: 20px;
    overflow: auto;
    color: var(--color-font);
    background: var(--color-content-background);
    border: 0;
    border-radius: 12px;
    box-shadow: 0 16px 48px rgb(0 0 0 / 25%);
    margin: 0;
    transform: translate(-50%, -50%);
  }
  header, .submit, .task {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  header {
    justify-content: space-between;
  }
  h2, h3, p { margin: 0; }
  h2 { font-size: 18px; }
  h3 { margin: 20px 0 10px; font-size: 15px; }
  .submit { flex-wrap: wrap; margin-top: 18px; }
  .submit p { flex-basis: 100%; }
  button, select {
    min-height: 44px;
    padding: 0 12px;
    color: var(--color-font);
    background: var(--color-app-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
  }
  button { cursor: pointer; }
  .primary { color: var(--color-button-font); background: var(--color-button-background); }
  .tasks { display: flex; flex-direction: column; gap: 8px; }
  .task { justify-content: space-between; padding: 10px; background: var(--color-app-background); border-radius: 8px; }
  .task-info { display: flex; flex: 1; flex-direction: column; gap: 3px; min-width: 0; }
  .task-info strong, .task-info span, .task-info small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .task-info span, .task-info small { color: var(--color-font-label); }
  .error { margin-top: 12px; color: var(--color-font-error); }
  .empty { color: var(--color-font-label); }
  @media (max-width: 700px) {
    .panel { top: auto; bottom: 0; left: 0; width: 100%; max-height: 86dvh; border-radius: 16px 16px 0 0; transform: none; }
  }
</style>
