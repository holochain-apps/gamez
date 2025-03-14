<script lang="ts">
  import { get, derived } from 'svelte/store';
  import { cloneDeep, zip } from 'lodash';

  import { getContext, presets, type GameSpace, type GameSpaceSyn } from '~/store';
  import { nav } from '~/lib/routes';
  import { cx } from '~/lib/util';
  import { getModalPromptContext } from '~/shared/ModalPromptContextWrapper.svelte';

  import Item from './Item.svelte';
  import Archive from '../Archive.svelte';

  const store = getContext();
  $: gameDocs = store.gameDocs;
  $: gameDocsStates = Object.values($gameDocs).map((gameSpace) => gameSpace.state);
  $: sortedTaggedGameSpaces = derived(gameDocsStates, ($states) => {
    const loadedGameDocs = zip(Object.values($gameDocs), $states);
    return loadedGameDocs
      .filter(([_, $state]) => $state !== null && $state.isLibraryItem && !$state.isArchived)
      .sort(([_1, $stA], [_2, $stB]) => $stB.lastChangeAt - $stA.lastChangeAt);
  });

  $: archivedGameSpaces = derived(gameDocsStates, ($states) => {
    const loadedGameDocs = zip(Object.values($gameDocs), $states);
    return loadedGameDocs
      .filter(([_, $state]) => $state !== null && $state.isLibraryItem && $state.isArchived)
      .sort(([_1, $stA], [_2, $stB]) => $stB.lastChangeAt - $stA.lastChangeAt)
      .map(([gameSpaceSyn, gameSpace]) => gameSpaceSyn);
  });

  $: gameSpacesNames = derived(gameDocsStates, ($states) =>
    $states
      .filter((state) => state && state.isLibraryItem)
      .map((state) => state.name.toLocaleLowerCase()),
  );

  let presetsItems = Object.values(presets);
  $: filteredPresetItems = presetsItems.filter(
    (gameSpace) => $gameSpacesNames.indexOf(gameSpace.name.toLocaleLowerCase()) === -1,
  );

  async function handlePlayFromLibrary(gameSpace: GameSpace, newName: string) {
    const newGameSpace: GameSpace = {
      ...cloneDeep(gameSpace),
      name: newName,
      isLibraryItem: false,
      creator: store.pubKey,
    };
    const hash = await store.createGameSpace(newGameSpace);
    nav({ id: 'gameSpace', gameSpaceHash: hash });
  }

  async function handleDuplicate(gameSpace: GameSpace, name: string) {
    const newGameSpace: GameSpace = {
      ...cloneDeep(gameSpace),
      name,
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
    const hash = await handleDuplicate(gameSpace, gameSpace.name);
    nav({ id: 'gameSpace', gameSpaceHash: hash });
  }

  async function handleArchive(gameSpace: GameSpaceSyn) {
    gameSpace.change({ type: 'set-is-archived', value: true }, true);
  }

  function handleExport(gameSpace: GameSpaceSyn) {
    gameSpace.exportAsJson();
  }

  const { open: openModalPrompt } = getModalPromptContext();
</script>

<div class="flex flex-col h-full">
  <div class="flex flex-wrap p1">
    {#each $sortedTaggedGameSpaces as [gameSpace, $state] (gameSpace.hash)}
      {#if $state}
        <Item
          gameSpace={$state}
          isLocked={false}
          onPlay={() =>
            openModalPrompt({
              title: 'Create new game space',
              onConfirm: (name) => handlePlayFromLibrary($state, name),
              placeholder: 'Name',
              defaultValue: $state.name,
            })}
          onArchive={() => handleArchive(gameSpace)}
          onEdit={() => handleEdit(gameSpace.hash)}
          onDuplicate={() => handleDuplicate($state, `Copy of ${$state.name}`)}
          onDelete={() => handleDelete(gameSpace.hash)}
          onExport={() => handleExport(gameSpace)}
        />
      {/if}
    {/each}
    {#each filteredPresetItems as gameSpace (gameSpace.name)}
      <Item
        {gameSpace}
        isLocked={true}
        onPlay={() =>
          openModalPrompt({
            title: 'Create new game space',
            onConfirm: (name) => handlePlayFromLibrary(gameSpace, name),
            placeholder: 'Name',
            defaultValue: gameSpace.name,
          })}
        onDuplicate={() => handleDuplicate(gameSpace, `Copy of ${gameSpace.name}`)}
        onEditCopy={() => handleEditCopy(gameSpace)}
      />
    {/each}
  </div>
  <div class="flex-grow"></div>
  <Archive gameSpacesStores={$archivedGameSpaces} />
</div>
