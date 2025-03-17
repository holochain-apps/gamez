<script lang="ts">
  import { derived } from 'svelte/store';
  import { cloneDeep, zip } from 'lodash';
  import { getContext, type GameSpace, type GameSpaceSyn } from '~/store';
  import Item from './Item.svelte';
  import { nav } from '~/lib/routes';
  import { cx, exportAsJson } from '~/lib/util';
  import Archive from '../Archive.svelte';
  import clients from '~/clients';

  const store = getContext();
  $: gameDocs = store.gameDocs;
  $: gameDocsStates = Object.values($gameDocs).map((gameSpace) => gameSpace.state);
  $: gameSpaces = derived(gameDocsStates, ($states) => {
    const loadedGameDocs = zip(Object.values($gameDocs), $states);
    return loadedGameDocs
      .filter(([_, $state]) => $state !== null && !$state.isLibraryItem && !$state.isArchived)
      .sort(([_1, $stA], [_2, $stB]) => $stB.lastChangeAt - $stA.lastChangeAt);
  });

  $: archivedGameSpaces = derived(gameDocsStates, ($states) => {
    const loadedGameDocs = zip(Object.values($gameDocs), $states);
    return loadedGameDocs
      .filter(([_, $state]) => $state !== null && !$state.isLibraryItem && $state.isArchived)
      .sort(([_1, $stA], [_2, $stB]) => $stB.lastChangeAt - $stA.lastChangeAt)
      .map(([gameSpaceStore, _]) => gameSpaceStore);
  });

  async function handlePlay(gameSpaceHash: string) {
    nav({ id: 'gameSpace', gameSpaceHash });
  }

  async function handleDuplicate(gameSpace: GameSpace) {
    const newGameSpace: GameSpace = {
      ...cloneDeep(gameSpace),
      name: `Copy of ${gameSpace.name}`,
      creator: clients.agentKeyB64,
    };
    return await store.createGameSpace(newGameSpace);
  }

  async function handleDelete(gameSpaceHash: string) {
    await store.deleteGameSpace(gameSpaceHash);
  }

  async function handleArchive(gameSpace: GameSpaceSyn) {
    gameSpace.change({ type: 'set-is-archived', value: true }, true);
  }

  function handleExport(gameSpace: GameSpace) {
    exportAsJson(gameSpace);
  }
</script>

<div class="flex flex-col h-full">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 p2">
    {#each $gameSpaces as [gameSpace, $state] (gameSpace.hash)}
      <Item
        gameSpace={$state}
        onPlay={() => handlePlay(gameSpace.hash)}
        onDuplicate={() => handleDuplicate($state)}
        onArchive={() => handleArchive(gameSpace)}
        onDelete={() => handleDelete(gameSpace.hash)}
        onExport={() => handleExport($state)}
      />
    {/each}
  </div>

  <div class="flex-grow"></div>
  <Archive gameSpacesStores={$archivedGameSpaces} cols={true} />
</div>
