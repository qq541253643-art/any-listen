<script lang="ts">
  import Tab from '@/components/base/Tab.svelte'
  import { i18n } from '@/plugins/i18n'
  import { tabIcons, viewResourceMap, viewTypes, urlParamKeyMap } from './shared.svelte'
  import { resourceList } from '@/modules/extension/reactive.svelte'
  import { pushRoute } from '@/modules/resource/actions'

  let { activeview }: { activeview: (typeof viewTypes)[number] } = $props()
  const typeList = $derived.by(() => {
    const res = Object.keys($resourceList.resources)
    return viewTypes
      .filter((t) => {
        return viewResourceMap[t].some((r) => res.includes(r))
      })
      .map((t) => {
        return { id: t, icon: tabIcons[t], label: i18n.t(`online__type_${t}`) }
      })
  })
</script>

<header class="header">
  <Tab
    list={typeList}
    itemkey="id"
    itemlabel="label"
    itemicon="icon"
    value={activeview}
    min
    onchange={(item) => {
      pushRoute('/online', { [urlParamKeyMap.type]: item.id })
    }}
  />
  <div id="online-header-right"></div>
</header>

<style lang="less">
  .header {
    display: flex;
    flex: none;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    // padding: 8px 0;
    // background-color: var(--color-primary-light-400-alpha-800);
    // border-radius: @radius-border;

    // h2 {
    //   font-size: 18px;
    //   padding: 0 15px;
    // }
  }

  @media (max-width: 700px) {
    .header {
      flex-wrap: wrap;
      gap: 4px;
      padding: 0 12px;
    }
    .header :global(.list) {
      width: 100%;
      min-width: 0;
      gap: 16px;
      overflow-x: auto;
      white-space: nowrap;
      scrollbar-width: none;
    }
    .header :global(.list-item) {
      flex: none;
    }
    #online-header-right {
      width: 100%;
      min-width: 0;
      overflow-x: auto;
    }
  }
</style>
