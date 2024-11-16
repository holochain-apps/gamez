<script lang="ts">
  import CaretIcon from '~icons/fa6-solid/caret-down';
  import { get, derived } from 'svelte/store';
  import { cloneDeep, zip } from 'lodash';
  import { getContext, presets, type GameSpace, type GameSpaceSyn } from '~/store';
  import GamesListItem from './GamesListItem.svelte';
  import LibraryListItem from './LibraryListItem.svelte';
  import { nav } from '~/lib/routes';
  import { toPromise } from '@holochain-open-dev/stores';
  import { cx } from '~/lib/util';

  const store = getContext();
  $: gameDocs = store.gameDocs;
  $: gameDocsStates = Object.values($gameDocs).map((gameSpace) => gameSpace.state);
  $: sortedTaggedGameSpaces = derived(gameDocsStates, ($states) => {
    const loadedGameDocs = zip(Object.values($gameDocs), $states);
    return loadedGameDocs
      .filter(([_, $state]) => $state !== null && $state.isLibraryItem)
      .sort(([_1, $stA], [_2, $stB]) => $stB.lastChangeAt - $stA.lastChangeAt);
  });

  $: archivedGameSpaces = derived(gameDocsStates, ($states) => {
    const loadedGameDocs = zip(Object.values($gameDocs), $states);
    return loadedGameDocs
      .filter(([_, $state]) => $state !== null && $state.isLibraryItem && $state.isArchived)
      .sort(([_1, $stA], [_2, $stB]) => $stB.lastChangeAt - $stA.lastChangeAt);
  });

  let presetsItems = Object.values(presets);

  // $: allNames = derived(gameDocsStates, ($states) =>
  //   $states.filter((s) => s).map(($state) => $state?.name),
  // );
  // $: unimportedGlobalLibrary = derived(allNames, ($names) => {
  //   return Object.values(presets).filter((space) => $names.indexOf(space.name) === -1);
  // });

  async function handlePlayFromLibrary(gameSpace: GameSpace) {
    const newGameSpace: GameSpace = {
      ...cloneDeep(gameSpace),
      isLibraryItem: false,
      creator: store.pubKey,
    };
    const hash = await store.createGameSpace(newGameSpace);
    nav({ id: 'gameSpace', gameSpaceHash: hash });
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

  async function handleEdit(gameSpaceHash: string) {
    nav({ id: 'gameSpace', gameSpaceHash });
  }

  async function handleEditCopy(gameSpace: GameSpace) {
    const hash = await handleDuplicate(gameSpace);
    nav({ id: 'gameSpace', gameSpaceHash: hash });
  }

  async function handleArchive(gameSpace: GameSpaceSyn) {
    gameSpace.change({ type: 'set-is-archived', value: true }, true);
  }

  async function handleUnarchive(gameSpace: GameSpaceSyn) {
    gameSpace.change({ type: 'set-is-archived', value: false }, true);
  }

  let showArchive = false;
</script>

<div class="flex flex-col px2 pt2 space-y-2 h-full">
  {#each $sortedTaggedGameSpaces as [gameSpace, $state] (gameSpace.hash)}
    {#if $state}
      <LibraryListItem
        gameSpace={$state}
        isLocked={false}
        onPlay={() => handlePlayFromLibrary($state)}
        onArchive={() => handleArchive(gameSpace)}
        onEdit={() => handleEdit(gameSpace.hash)}
        onDuplicate={() => handleDuplicate($state)}
        onDelete={() => handleDelete(gameSpace.hash)}
      />
    {/if}
  {/each}
  {#each presetsItems as gameSpace (gameSpace.name)}
    <LibraryListItem
      {gameSpace}
      isLocked={true}
      onPlay={() => handlePlayFromLibrary(gameSpace)}
      onDuplicate={() => handleDuplicate(gameSpace)}
      onEditCopy={() => handleEditCopy(gameSpace)}
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
            <LibraryListItem
              gameSpace={$state}
              isLocked={false}
              onUnarchive={() => handleUnarchive(gameSpace)}
              onEdit={() => handleEdit(gameSpace.hash)}
              onDelete={() => handleDelete(gameSpace.hash)}
            />
          {/if}
        {/each}
      </div>
    {/if}
  {/if}
</div>
