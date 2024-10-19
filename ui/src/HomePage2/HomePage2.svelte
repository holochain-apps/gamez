<script lang="ts">
  import LayoutBar from '../Layout/LayoutBar.svelte';
  import TabButton from './TabButton.svelte';

  type Tab = 'active' | 'groupLibrary' | 'globalLibrary' | 'draft' | 'archived';
  let activeTab = 'active';
  function setActiveTab(tab: Tab) {
    activeTab = tab;
  }
</script>

<LayoutBar title={'P2P Play Space'} />

<div class="h12 flex bg-main-500">
  <div class="h-full flex-grow flexcs space-x-2 pt2 pl2">
    <TabButton active={activeTab} value={'active'} onClick={setActiveTab}>Active</TabButton>
    <TabButton active={activeTab} value={'groupLibrary'} onClick={setActiveTab}
      >Group Library</TabButton
    >
    <TabButton active={activeTab} value={'globalLibrary'} onClick={setActiveTab}
      >Global Library</TabButton
    >
    <TabButton active={activeTab} value={'draft'} onClick={setActiveTab}>Draft</TabButton>
    <TabButton active={activeTab} value={'archived'} onClick={setActiveTab}>Archived</TabButton>
  </div>
  <button
    class="bg-white/10 my1 mr2 rounded-md b b-white/10 text-white/80 text-sm uppercase px2 hover:bg-white/20"
    >New Space</button
  >
</div>
<div class="flex-grow bg-main-500 p1 pt0">
  <div class="w-full h-full rounded-md bg-main-700 b b-white/20 shadow-md"></div>
</div>
