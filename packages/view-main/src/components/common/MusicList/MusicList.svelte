<script lang="ts">
  import { settingState } from '@/modules/setting/store/state'
  import Header from './Header.svelte'
  import { playMusic } from './List/action'
  import List from './List/index.svelte'
  import type { ListInfo } from './type'
  import { updateSetting } from '@/modules/setting/store/action'
  import { getRandom } from '@/shared'
  import type { ComponentExports } from 'svelte'
  import MiniHeader from './MiniHeader.svelte'
  import Loading from '@/components/base/Loading.svelte'
  import { getListMetaInfo } from './shared'
  import { openDownloadPanel } from '@/modules/download/panel.svelte'
  let {
    loading = false,
    error = false,
    source = 'local',
    showheader = true,
    miniheader = false,
    list,
    listinfo,
    onscroll,
    onsave,
    onreload,
  }: {
    loading?: boolean
    error?: boolean
    source?: AnyListen.Player.SourceType
    showheader?: boolean
    miniheader?: boolean
    list: AnyListen.Music.MusicInfo[]
    listinfo: ListInfo
    onscroll?: (pos: number) => void
    onsave?: () => Promise<void>
    onreload?: () => void
  } = $props()
  let multimode = $state(false)
  let finding = $state(false)
  let duplicate = $state(false)
  let listsort = $state(false)
  let musicList = $state<ComponentExports<typeof List> | null>(null)

  export const setScrollPosition = (number: number, animate?: boolean) => {
    musicList?.setScrollPosition(number, animate)
  }
  export const setScrollIndex = (number: number, animate?: boolean) => {
    musicList?.setScrollIndex(number, animate)
  }
  export const getScrollPosition = () => {
    return musicList?.getScrollPosition() ?? 0
  }
</script>

<div class="view-container container" class:loading>
  {#if showheader}
    {#if miniheader}
      <MiniHeader
        disabled={loading || error}
        musiccount={list.length}
        {source}
        saveable={listinfo.saveable}
        {multimode}
        {finding}
        onfind={() => {
          finding = !finding
        }}
        onduplicate={() => {
          duplicate = true
        }}
        onmulti={() => {
          multimode = !multimode
        }}
        onplay={() => {
          void playMusic(listinfo.id, list, list[0], source, getListMetaInfo(listinfo), true)
        }}
        onplayrandom={async () => {
          if (settingState.setting['player.togglePlayMethod'] != 'random') {
            await updateSetting({ 'player.togglePlayMethod': 'random' })
          }
          void playMusic(listinfo.id, list, list[getRandom(0, list.length)], source, getListMetaInfo(listinfo), true)
        }}
        onsort={() => {
          listsort = true
        }}
        onsave={async () => {
          await onsave?.()
        }}
      />
    {:else}
      <Header
        disabled={loading || error}
        {listinfo}
        musiccount={list.length}
        {source}
        saveable={listinfo.saveable}
        {multimode}
        {finding}
        onfind={() => {
          finding = !finding
        }}
        onduplicate={() => {
          duplicate = true
        }}
        onmulti={() => {
          multimode = !multimode
        }}
        onplay={() => {
          void playMusic(listinfo.id, list, list[0], source, getListMetaInfo(listinfo), true)
        }}
        onplayrandom={async () => {
          if (settingState.setting['player.togglePlayMethod'] != 'random') {
            await updateSetting({ 'player.togglePlayMethod': 'random' })
          }
          void playMusic(listinfo.id, list, list[getRandom(0, list.length)], source, getListMetaInfo(listinfo), true)
        }}
        onsort={() => {
          listsort = true
        }}
        onsave={async () => {
          await onsave?.()
        }}
      />
    {/if}
  {/if}
  <List
    bind:this={musicList}
    {listinfo}
    {list}
    {source}
    {onscroll}
    bind:finding
    bind:multimode
    bind:duplicate
    bind:listsort
    loaded={!loading && !error}
  />
  {#if import.meta.env.VITE_IS_WEB && list.some((music) => !music.isLocal)}
    <div class="download-actions">
      <button onclick={() => openDownloadPanel(list)}>下载列表歌曲</button>
      <button onclick={() => openDownloadPanel()}>查看任务</button>
    </div>
  {/if}
  <Loading {loading} {error} {onreload} />
</div>

<style lang="less">
  .container {
    position: relative;
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
  }
  .download-actions {
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    background: var(--color-app-background);
  }
  .download-actions button {
    min-height: 44px;
    padding: 0 12px;
    color: var(--color-button-font);
    background: var(--color-button-background);
    border: 0;
    border-radius: 8px;
  }
</style>
