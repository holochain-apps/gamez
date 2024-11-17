<script lang="ts">
  import CaretIcon from '~icons/fa6-solid/caret-down';
  import { get, derived } from 'svelte/store';
  import { cloneDeep, zip } from 'lodash';
  import { getContext, type GameSpace, type GameSpaceSyn } from '~/store';
  import GamesListItem from './GamesListItem.svelte';
  import { nav } from '~/lib/routes';
  import { cx } from '~/lib/util';

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
      .sort(([_1, $stA], [_2, $stB]) => $stB.lastChangeAt - $stA.lastChangeAt);
  });

  async function handlePlay(gameSpaceHash: string) {
    nav({ id: 'gameSpace', gameSpaceHash });
  }

  async function handleDuplicate(gameSpace: GameSpace) {
    const newGameSpace: GameSpace = {
      ...cloneDeep(gameSpace),
      name: `Copy of ${gameSpace.name}`,
      creator: store.pubKey,
    };
    return await store.createGameSpace(newGameSpace);
  }

  async function handleDelete(gameSpaceHash: string) {
    await store.deleteGameSpace(gameSpaceHash);
  }

  async function handleArchive(gameSpace: GameSpaceSyn) {
    gameSpace.change({ type: 'set-is-archived', value: true }, true);
  }

  async function handleUnarchive(gameSpace: GameSpaceSyn) {
    gameSpace.change({ type: 'set-is-archived', value: false }, true);
  }

  function handleExport(gameSpace: GameSpaceSyn) {
    gameSpace.exportAsJson();
  }

  let showArchive = false;
</script>

<div class="flex flex-col px2 pt2 space-y-2 h-full">
  {#each $gameSpaces as [gameSpace, $state] (gameSpace.hash)}
    <GamesListItem
      gameSpace={$state}
      onPlay={() => handlePlay(gameSpace.hash)}
      onDuplicate={() => handleDuplicate($state)}
      onArchive={() => handleArchive(gameSpace)}
      onDelete={() => handleDelete(gameSpace.hash)}
      onExport={() => handleExport(gameSpace)}
    />
  {/each}

  <div class="flex-grow"></div>
  {#if $archivedGameSpaces.length !== 0}
    <button
      class="bg-main-200 -mx-2 p2 pr3 text-white flexcc text-left"
      on:click={() => (showArchive = !showArchive)}
    >
      <div class="flex-grow">Archive</div>
      <CaretIcon class={cx('transition-transform', { 'rotate-180': !showArchive })} />
    </button>
    {#if showArchive}
      <div class="flex flex-col pb2 space-y-2">
        {#each $archivedGameSpaces as [gameSpace, $state] (gameSpace.hash)}
          {#if $state}
            <GamesListItem
              gameSpace={$state}
              onEdit={() => handlePlay(gameSpace.hash)}
              onUnarchive={() => handleUnarchive(gameSpace)}
              onDelete={() => handleDelete(gameSpace.hash)}
            />
          {/if}
        {/each}
      </div>
    {/if}
  {/if}
</div>
