<script lang="ts">
  import PlusIcon from '~icons/fa6-solid/plus';

  import { getContext } from '~/store';
  import LayoutBar from '~/center/hud/LayoutBar.svelte';
  import { nav } from '~/center/lib/routes';
  import { getModalPromptContext } from '~/center/input/ModalPromptContextWrapper.svelte';

  import GamesList from './ActiveGames/List.svelte';
  import LibraryList from './Library/List.svelte';

  const store = getContext();

  async function handleImport() {
    const hash = await store.importFromJson();
    nav({ id: 'gameSpace', gameSpaceHash: hash });
  }

  async function handleNewLibraryItem(name: string) {
    const hash = await store.createGameSpace({ isLibraryItem: true, name });
    nav({ id: 'gameSpace', gameSpaceHash: hash });
  }

  const { open: openModalPrompt } = getModalPromptContext();
</script>

<LayoutBar title={'Gamez'} />

<div class="flex-grow h-0 flex">
  <div class="flex-grow overflow-auto bg-main-750">
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
        on:click={() =>
          openModalPrompt({
            title: 'Create new library item',
            onConfirm: handleNewLibraryItem,
            placeholder: 'Name',
            defaultValue: 'New library item',
          })}><PlusIcon /></button
      >
    </div>
    <div class="flex-grow overflow-auto h-0">
      <LibraryList />
    </div>
  </div>
</div>
