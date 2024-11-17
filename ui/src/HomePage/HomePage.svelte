<script lang="ts">
  import PlusIcon from '~icons/fa6-solid/plus';
  import { getContext } from '~/store';
  import LayoutBar from '~/Layout/LayoutBar.svelte';
  import GamesList from './GamesList.svelte';
  import { nav } from '~/lib/routes';
  import LibraryList from './LibraryList.svelte';

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

  async function handleNewLibraryItem() {
    const hash = await store.createGameSpace({ isLibraryItem: true, name: 'New Library Space' });
    nav({ id: 'gameSpace', gameSpaceHash: hash });
  }
</script>

<LayoutBar title={'Gamez'} />

<!-- <div class="h12 flex bg-main-500">
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
</div> -->
<div class="flex-grow h-0 flex">
  <div class="flex-grow overflow-auto">
    <GamesList />
  </div>
  <div class="w-100 bg-main-700 flex flex-col">
    <div class="flexcc px2 h12 bg-main-500 text-white">
      <h2 class="text-2xl tracking-wider flex-grow ml2">Library</h2>
      <button
        on:click={handleImport}
        class="bg-white/20 my2 h8 mr2 rounded-md b b-white/10 text-white/80 text-sm uppercase px2 hover:bg-white/30"
        >Import</button
      >
      <button
        class="w8 h8 flexcc bg-white/20 rounded-md b b-white/10 hover:bg-white/30"
        on:click={handleNewLibraryItem}><PlusIcon /></button
      >
    </div>
    <div class="flex-grow overflow-auto h-0">
      <LibraryList />
    </div>
  </div>
</div>
