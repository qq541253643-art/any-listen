<script lang="ts">
  import { fade } from 'svelte/transition'
  import LyricPlayer from './LyricPlayer.svelte'
  let { introend }: { introend: boolean } = $props()
</script>

<div class="right-lyric">
  {#if introend}
    <div in:fade={{ delay: 5 }} class="right-lyric-content">
      <LyricPlayer />
    </div>
  {/if}
</div>

<style lang="less">
  .right-lyric {
    position: relative;
    flex: auto;
    min-height: 0;
    contain: strict;
  }
  .right-lyric-content {
    position: absolute;
    inset: 0;
    // margin-right: 20px;
  }
  @media (max-width: 700px) {
    .right-lyric-content {
      inset: 0 16px;
    }
  }
</style>
