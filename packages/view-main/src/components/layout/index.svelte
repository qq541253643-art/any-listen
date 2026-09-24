<script lang="ts">
  import Aside from '@/components/layout/Aside/index.svelte'
  import Header from '@/components/layout/Header/index.svelte'
  import Main from '@/components/layout/Main.svelte'
  import PlayBar from '@/components/layout/PlayBar/index.svelte'
  import PlayDetail from '@/components/layout/PlayDetail/index.svelte'
  import DownloadPanel from '@/components/layout/DownloadPanel.svelte'
  import { openDownloadPanel } from '@/modules/download/panel.svelte'
  let mobileNavOpen = $state(false)
</script>

<div id="app-main" class:mobile-nav-open={mobileNavOpen}>
  {#if import.meta.env.VITE_IS_WEB}
    <button
      class="mobile-nav-backdrop"
      aria-label="关闭菜单"
      onclick={() => (mobileNavOpen = false)}
    ></button>
  {/if}
  <div class="aside-wrapper" onclickcapture={(event) => {
    if ((event.target as HTMLElement).closest('a, [role="button"]')) mobileNavOpen = false
  }} role="presentation">
    <Aside />
  </div>
  <div id="app-right">
    {#if import.meta.env.VITE_IS_WEB}
      <div class="mobile-topbar">
        <button aria-label="打开菜单" aria-expanded={mobileNavOpen} onclick={() => (mobileNavOpen = true)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" /></svg>
        </button>
        <span>Any Listen</span>
        <button class="download-button" aria-label="查看下载任务" onclick={() => openDownloadPanel()}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3h2v10l3.5-3.5 1.4 1.4L12 17l-5.9-6.1 1.4-1.4L11 13zM4 19h16v2H4z" /></svg>
        </button>
      </div>
    {/if}
    <Header />
    <Main />
  </div>
</div>
<PlayBar />
<PlayDetail />
{#if import.meta.env.VITE_IS_WEB}
  <DownloadPanel />
{/if}

<style lang="less">
  #app-main {
    position: relative;
    z-index: 1;
    display: flex;
    flex: auto;
    flex-flow: row nowrap;
  }
  .aside-wrapper {
    display: flex;
    flex: none;
    width: 20%;
    max-width: 320px;
    > :global(.aside) {
      width: 100%;
    }
  }
  .mobile-topbar,
  .mobile-nav-backdrop {
    display: none;
  }
  #app-right {
    position: relative;
    display: flex;
    // border-left: 2px solid var(--color-border);

    flex: auto;
    flex-flow: column nowrap;

    // border-top-left-radius: @radius-border;
    // border-bottom-left-radius: @radius-border;
    overflow: hidden;
    // box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);

    // &:before {
    //   .mixin-after();
    //   left: 0;
    //   top: 0;
    //   width: 100%;
    //   height: 100%;
    //   transition: background-color @transition-normal;
    //   background-color: var(--color-main-background);
    //   opacity: .9;
    //   // z-index: -1;
    // }
  }
  @media (max-width: 700px) {
    :global(html.web) {
      #app-main {
        min-width: 0;
        min-height: 0;
      }
    }
    #app-main {
      min-width: 0;
      min-height: 0;
    }
    .aside-wrapper {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 30;
      width: min(82vw, 320px);
      max-width: none;
      overflow: auto;
      background: var(--color-content-background);
      box-shadow: 0 10px 32px rgb(0 0 0 / 22%);
      transform: translateX(-105%);
      transition: transform 180ms ease;
    }
    .mobile-nav-open .aside-wrapper {
      transform: translateX(0);
    }
    .mobile-nav-backdrop {
      position: absolute;
      inset: 0;
      z-index: 29;
      width: 100%;
      background: rgb(0 0 0 / 40%);
      border: 0;
    }
    .mobile-nav-open .mobile-nav-backdrop {
      display: block;
    }
    #app-right {
      width: 100%;
      min-width: 0;
    }
    .mobile-topbar {
      display: flex;
      flex: none;
      gap: 12px;
      align-items: center;
      height: 52px;
      padding: 0 12px;
      font-size: 18px;
      font-weight: 600;
      background: var(--color-app-background);
    }
    .mobile-topbar button {
      display: grid;
      width: 44px;
      height: 44px;
      place-items: center;
      color: var(--color-primary-font);
      background: transparent;
      border: 0;
    }
    .mobile-topbar svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
    .mobile-topbar .download-button {
      margin-left: auto;
    }
  }
</style>
