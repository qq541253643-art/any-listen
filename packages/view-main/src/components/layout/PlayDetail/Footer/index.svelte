<script lang="ts">
  import RightControlBtns from './RightControlBtns.svelte'
  import LeftControlBtns from './LeftControlBtns.svelte'
  import MiddlePlayProgress from './MiddlePlayProgress.svelte'
  import PlayBtns from './PlayBtns.svelte'
  import PlayStatusText from './PlayStatusText.svelte'
  import { fade } from 'svelte/transition'

  let { introend }: { introend: boolean } = $props()
</script>

<div class="footer">
  {#if introend}
    <div in:fade={{ delay: 5 }} class="footer-content">
      <div class="control">
        <div class="side">
          <LeftControlBtns />
        </div>
        <PlayBtns />
        <div class="side right">
          <RightControlBtns />
        </div>
      </div>
      <MiddlePlayProgress />
      <PlayStatusText />
    </div>
  {/if}
</div>

<style lang="less">
  .footer {
    flex: none;
    height: 100px;
    contain: strict;
  }
  .footer-content {
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    height: 100%;
    padding: 0 30px 16px;
    > :global(.middle-play-progress) {
      flex: none;
      width: 100%;
    }
  }
  .control {
    display: flex;
    flex: auto;
    flex-flow: row nowrap;
  }

  .side {
    position: relative;
    display: flex;
    flex: 1;
    flex-flow: row nowrap;
    align-items: center;
    height: 100%;
    padding-top: 15px;
  }

  .right {
    justify-content: flex-end;
    padding-left: 16px;
    margin-left: -10px;
  }

  @media (max-width: 700px) {
    .footer {
      height: 154px;
    }
    .footer-content {
      padding: 0 12px 12px;
    }
    .control {
      flex-wrap: wrap;
      justify-content: center;
    }
    .control > :global(.container) {
      order: -1;
      justify-content: center;
      width: 100%;
      height: 56px;
      padding: 0;
    }
    .side {
      flex: 0 0 50%;
      height: 36px;
      padding: 0;
    }
    .right {
      padding: 0;
      margin: 0;
    }
  }
</style>
