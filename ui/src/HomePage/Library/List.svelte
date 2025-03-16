<script lang="ts">
  import { get, derived } from 'svelte/store';
  import _, { cloneDeep } from 'lodash';

  import { getContext, presets, type GameSpace, type GameSpaceSyn } from '~/store';
  import { nav } from '~/lib/routes';
  import { getModalPromptContext } from '~/shared/ModalPromptContextWrapper.svelte';

  import Item from './Item.svelte';
  import Archive from '../Archive.svelte';
  import { exportAsJson } from '~/lib/util';
  import clients from '~/clients';

  const store = getContext();
  $: gameSpaceStores = store.loadedGameSpaceStores;
  $: gameSpaces = store.statesMap;

  function filterSortedStores(
    $gameSpaceStores: { [key: string]: GameSpaceSyn },
    $states: { [key: string]: GameSpace },
    filterFun: (gameSpace: GameSpace) => boolean,
  ): GameSpaceSyn[] {
    return Object.values($gameSpaceStores)
      .filter(($store) => $store && $states[$store.hash])
      .filter(($store) => filterFun($states[$store.hash]))
      .sort(
        ($storeA, $storeB) =>
          $states[$storeB.hash].lastChangeAt - $states[$storeA.hash].lastChangeAt,
      );
  }

  $: libraryGameSpaceStores = derived(gameSpaceStores, ($gameSpaceStores) =>
    filterSortedStores(
      $gameSpaceStores,
      $gameSpaces,
      ($state) => $state.isLibraryItem && !$state.isArchived && !$state.isDeleted,
    ),
  );

  $: archivedGameSpaces = derived(gameSpaceStores, ($gameSpaceStores) =>
    filterSortedStores(
      $gameSpaceStores,
      $gameSpaces,
      ($state) => $state.isLibraryItem && $state.isArchived && !$state.isDeleted,
    ),
  );

  $: presetsNamesCreatedAlready = derived(gameSpaceStores, ($gameSpaceStores) =>
    Object.values($gameSpaceStores)
      .map(($store) => $gameSpaces[$store.hash])
      .filter(($gameSpace) => $gameSpace)
      .filter(($gameSpace) => $gameSpace.fromPreset)
      .map(($gameSpace) => $gameSpace.fromPreset),
  );

  let presetsItems = Object.values(presets);
  $: filteredPresetItems = presetsItems.filter(
    (gameSpace) => $presetsNamesCreatedAlready.indexOf(gameSpace.name) === -1,
  );

  async function handlePlayFromLibrary(gameSpace: GameSpace, newName: string) {
    const newGameSpace: GameSpace = {
      ...cloneDeep(gameSpace),
      name: newName,
      isLibraryItem: false,
      creator: clients.agentKeyB64,
    };
    const hash = await store.createGameSpace(newGameSpace);
    nav({ id: 'gameSpace', gameSpaceHash: hash });
  }

  async function handleDuplicate(gameSpace: GameSpace, name: string) {
    const newGameSpace: GameSpace = {
      ...cloneDeep(gameSpace),
      name,
      creator: clients.agentKeyB64,
    };
    return await store.createGameSpace(newGameSpace);
  }

  async function handleDelete(hash: string) {
    if ($gameSpaces[hash].fromPreset) {
      $gameSpaceStores[hash].change({ type: 'set-deleted', isDeleted: true }, true);
    } else {
      await store.deleteGameSpace(hash);
    }
  }

  async function handleEdit(hash: string) {
    nav({ id: 'gameSpace', gameSpaceHash: hash });
  }

  async function handleArchive(gameSpace: GameSpaceSyn) {
    gameSpace.change({ type: 'set-is-archived', value: true }, true);
  }

  function handleExport(gameSpace: GameSpace) {
    exportAsJson(gameSpace);
  }

  // From presets

  function createFromPreset(preset: GameSpace, extend: Partial<GameSpace> = {}): GameSpace {
    return {
      ...cloneDeep(preset),
      creator: clients.agentKeyB64,
      fromPreset: preset.name,
      ...extend,
    };
  }

  async function handleEditFromPreset(preset: GameSpace) {
    const newGameSpace = createFromPreset(preset);
    const hash = await store.createGameSpace(newGameSpace);
    await handleEdit(hash);
  }

  async function handleDeleteFromPreset(preset: GameSpace) {
    const newGameSpace = createFromPreset(preset, { isDeleted: true });
    await store.createGameSpace(newGameSpace);
  }

  async function handleArchiveFromPreset(preset: GameSpace) {
    const newGameSpace = createFromPreset(preset, { isArchived: true });
    await store.createGameSpace(newGameSpace);
  }

  const { open: openModalPrompt } = getModalPromptContext();
</script>

<div class="flex flex-col h-full">
  <div class="flex flex-wrap p1">
    {#each $libraryGameSpaceStores as gameSpaceStore (gameSpaceStore.hash)}
      {@const gameSpace = get(gameSpaceStore.state)}
      <Item
        {gameSpace}
        onPlay={() =>
          openModalPrompt({
            title: 'Create new game space',
            onConfirm: (name) => handlePlayFromLibrary(gameSpace, name),
            placeholder: 'Name',
            defaultValue: gameSpace.name,
          })}
        onArchive={() => handleArchive(gameSpaceStore)}
        onEdit={() => handleEdit(gameSpaceStore.hash)}
        onDuplicate={() => handleDuplicate(gameSpace, `Copy of ${gameSpace.name}`)}
        onDelete={() => handleDelete(gameSpaceStore.hash)}
        onExport={() => handleExport(gameSpace)}
      />
    {/each}
    {#each filteredPresetItems as gameSpace (gameSpace.name)}
      <Item
        {gameSpace}
        onArchive={() => handleArchiveFromPreset(gameSpace)}
        onEdit={() => handleEditFromPreset(gameSpace)}
        onDuplicate={() => handleDuplicate(gameSpace, `Copy of ${gameSpace.name}`)}
        onDelete={() => handleDeleteFromPreset(gameSpace)}
        onExport={() => handleExport(gameSpace)}
        onPlay={() =>
          openModalPrompt({
            title: 'Create new game space',
            onConfirm: (name) => handlePlayFromLibrary(gameSpace, name),
            placeholder: 'Name',
            defaultValue: gameSpace.name,
          })}
      />
    {/each}
  </div>
  <div class="flex-grow"></div>
  <Archive gameSpacesStores={$archivedGameSpaces} />
</div>
