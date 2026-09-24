<script>
  import MiniBar from './MiniBar.svelte'
  import MiddleBar from './MiddleBar.svelte'
  import FullBar from './FullBar.svelte'
  import CenterBar from './CenterBar.svelte'
  import CenterMiddleBar from './CenterMiddleBar.svelte'
  import CenterFullBar from './CenterFullBar.svelte'
  import MobileBar from './MobileBar.svelte'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { onMount } from 'svelte'

  const playBarProgressStyle = useSettingValue('common.playBarProgressStyle')
  let isMobile = $state(false)
  onMount(() => {
    if (!import.meta.env.VITE_IS_WEB) return
    const media = window.matchMedia('(max-width: 700px)')
    const update = () => (isMobile = media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  })
</script>

{#if isMobile}
  <MobileBar />
{:else if playBarProgressStyle.val == 'mini'}
  <MiniBar />
{:else if playBarProgressStyle.val == 'middle'}
  <MiddleBar />
{:else if playBarProgressStyle.val == 'full'}
  <FullBar />
{:else if playBarProgressStyle.val == 'centerControlMiddle'}
  <CenterMiddleBar />
{:else if playBarProgressStyle.val == 'centerControlFull'}
  <CenterFullBar />
{:else}
  <CenterBar />
{/if}
