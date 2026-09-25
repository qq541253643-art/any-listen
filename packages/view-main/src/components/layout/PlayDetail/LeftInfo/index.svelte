<script lang="ts">
  import Cover from './Cover.svelte'
  import Info from './Info.svelte'
  // let { introend }: { introend: boolean } = $props()
</script>

<div class="left-info">
  <Cover />
  <Info />
</div>

<style lang="less">
  .left-info {
    display: flex;
    flex: none;
    flex-flow: column nowrap;
    align-items: center;
    width: 50%;
    padding: 14px 15px 14px 20px;
    contain: strict;
    // transition: flex-basis @transition-normal;

    --content-width: 72%;
  }

  @media (max-width: 700px) {
    .left-info {
      flex-direction: row;
      gap: 14px;
      width: 100%;
      height: 104px;
      padding: 10px 16px;

      --content-width: 72px;
    }

    .left-info :global(.info) {
      width: auto;
      min-width: 0;
      max-height: 100%;
      margin-top: 0;
    }
  }
</style>
