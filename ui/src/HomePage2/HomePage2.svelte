<script lang="ts">
  import { getContext } from '~/store';
  import LayoutBar from '~/Layout/LayoutBar.svelte';
  import GamesList from './GamesList.svelte';
  import TabButton from './TabButton.svelte';
  import { nav } from '~/lib/routes';

  const store = getContext();

  type Tab = 'active' | 'library' | 'globalLibrary' | 'draft' | 'archived';
  let activeTab: Tab = 'active';
  function setActiveTab(tab: Tab) {
    activeTab = tab;
  }

  // let activeTab2: Tab = 'groupLibrary';
  // function setActiveTab2(tab: Tab) {
  //   activeTab2 = tab;
  // }

  async function handleCreateNewSpace() {
    const hash = await store.createGameSpace();
    nav({ id: 'gameSpace', gameSpaceHash: hash });
  }

  async function handleImport() {
    const hash = await store.importFromJson();
    nav({ id: 'gameSpace', gameSpaceHash: hash });
  }
</script>

<LayoutBar title={'Gamez'} />

<div class="h12 flex bg-main-500">
  <div class="h-full flex-grow flexcs space-x-2 pt2 pl2">
    <TabButton active={activeTab} value={'active'} onClick={setActiveTab}>Active</TabButton>
    <TabButton active={activeTab} value={'library'} onClick={setActiveTab}>Library</TabButton>
    <!-- <TabButton active={activeTab} value={'globalLibrary'} onClick={setActiveTab}
      >Global Library</TabButton
    > -->
    <!-- <TabButton active={activeTab} value={'draft'} onClick={setActiveTab}>Draft</TabButton> -->
    <TabButton active={activeTab} value={'archived'} onClick={setActiveTab}>Archived</TabButton>
  </div>
  <button
    on:click={handleImport}
    class="bg-white/10 my2 mr2 rounded-md b b-white/10 text-white/80 text-sm uppercase px2 hover:bg-white/20"
    >Import</button
  >
  <button
    on:click={handleCreateNewSpace}
    class="bg-white/10 my2 mr2 rounded-md b b-white/10 text-white/80 text-sm uppercase px2 hover:bg-white/20"
    >New Draft</button
  >
</div>
<div class="flex-grow bg-main-500 p1 pt0 h-0">
  <div
    class="w-full h-full rounded-md bg-main-700 b b-white/20 b-t-white/30 shadow-[0_0_5px_#0003] h-full overflow-auto"
  >
    <GamesList tag={activeTab} />
  </div>
</div>
