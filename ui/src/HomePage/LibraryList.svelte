<script lang="ts">
  import CaretIcon from '~icons/fa6-solid/caret-down';
  import { getContext, type GameSpace } from '~/store';
  import LibraryListItem from './LibraryListItem.svelte';
  import R from '~/lib/routes.svelte';
  import { cx } from '~/lib/util';
  import { getModalPromptContext } from '~/shared/ModalPromptContextWrapper.svelte';
  import clients from '~/clients';

  const S = getContext();

  async function handlePlayFromLibrary(gameSpace: GameSpace, newName: string) {
    const newGameSpace: GameSpace = {
      ...gameSpace,
      name: newName,
      isLibraryItem: false,
      creator: clients.agentKeyB64,
    };
    const hash = await S.cmd('create-gamespace', newGameSpace);
    R.nav({ id: 'gameSpace', gameSpaceHash: hash });
  }

  async function handleDuplicate(sourceHash: string, name: string) {
    const gameSpace = S.libraryItems[sourceHash]!;
    const newGameSpace: GameSpace = {
      ...gameSpace.doc,
      name,
      creator: clients.agentKeyB64,
    };
    return await S.cmd('create-gamespace', newGameSpace);
  }

  async function handleDelete(gameSpaceHash: string) {
    // await store.deleteGameSpace(gameSpaceHash);
    await S.cmd('delete-gamespace', gameSpaceHash);
  }

  async function handleEdit(gameSpaceHash: string) {
    R.nav({ id: 'gameSpace', gameSpaceHash });
  }

  async function handleEditCopy(sourceHash: string) {
    const gameSpace = S.libraryItems[sourceHash]!;
    const hash = await handleDuplicate(sourceHash, gameSpace.doc.name);
    R.nav({ id: 'gameSpace', gameSpaceHash: hash });
  }

  async function handleArchive(hash: string) {
    await S.cmd('archive', hash);
  }

  async function handleUnarchive(hash: string) {
    await S.cmd('unarchive', hash);
  }

  async function handleExport(hash: string) {
    await S.cmd('export-as-json', hash);
  }

  let showArchive = false;

  const { open: openModalPrompt } = getModalPromptContext();
</script>

<div class="flex flex-col px2 pt2 space-y-2 h-full">
  {#each Object.entries(S.libraryItems) as [hash, gameSpace] (hash)}
    <LibraryListItem
      gameSpaceDoc={gameSpace}
      isLocked={false}
      onPlay={() =>
        openModalPrompt({
          title: 'Create new game space',
          onConfirm: (name) => handlePlayFromLibrary(gameSpace.doc, name),
          placeholder: 'Name',
          defaultValue: gameSpace.doc.name,
        })}
      onArchive={() => handleArchive(hash)}
      onEdit={() => handleEdit(hash)}
      onDuplicate={() => handleDuplicate(hash, `Copy of ${gameSpace.doc.name}`)}
      onDelete={() => handleDelete(hash)}
      onExport={() => handleExport(hash)}
    />
  {/each}
  <div class="flex-grow"></div>
  {#if Object.keys(S.archivedGameSpaces).length !== 0}
    <button
      class="bg-main-200 -mx-2 p2 pr3 text-white flexcc text-left"
      on:click={() => (showArchive = !showArchive)}
    >
      <div class="flex-grow">Archive</div>
      <CaretIcon class={cx('transition-transform', { 'rotate-180': !showArchive })} />
    </button>
    {#if showArchive}
      <div class="flex flex-col pb2 space-y-2">
        {#each Object.entries(S.archivedGameSpaces) as [hash, gameSpace] (hash)}
          <LibraryListItem
            gameSpaceDoc={gameSpace}
            isLocked={false}
            onUnarchive={() => handleUnarchive(hash)}
            onEdit={() => handleEdit(hash)}
            onDelete={() => handleDelete(hash)}
          />
        {/each}
      </div>
    {/if}
  {/if}
</div>
