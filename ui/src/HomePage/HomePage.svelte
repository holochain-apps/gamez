<script lang="ts">
  import PlusIcon from '~icons/fa6-solid/plus';
  import { getContext } from '~/store';
  import LayoutBar from '~/Layout/LayoutBar.svelte';
  import GamesList from './GamesList.svelte';
  import R from '~/lib/routes.svelte';
  import LibraryList from './LibraryList.svelte';
  // import ModalPrompt from '~/shared/ModalPrompt.svelte';
  import { getModalPromptContext } from '~/shared/ModalPromptContextWrapper.svelte';

  const S = getContext();

  async function handleCreateNewSpace() {
    const hash = await S.cmd('create-gamespace', {});
    R.nav({ id: 'gameSpace', gameSpaceHash: hash });
  }

  async function handleImport() {
    const hash = await S.cmd('import-from-json');
    R.nav({ id: 'gameSpace', gameSpaceHash: hash });
  }

  async function handleNewLibraryItem(name: string) {
    const hash = await S.cmd('create-gamespace', { isLibraryItem: true, name });
    R.nav({ id: 'gameSpace', gameSpaceHash: hash });
  }

  const { open: openModalPrompt } = getModalPromptContext();
</script>

<LayoutBar title={'Gamez'} />

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
