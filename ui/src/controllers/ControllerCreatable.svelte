<script lang="ts">
  import type { AppletView } from '@theweave/api';
  import { derived, get } from 'svelte/store';
  import { getContext, presets, type GameSpace } from '~/store';
  import CreatableItem from './CreatableItem.svelte';
  import { cloneDeep } from 'lodash';
  import clients from '~/clients';
  import { hashToWAL } from '~/lib/util';

  export let view: Extract<AppletView, { type: 'creatable' }>;

  const store = getContext();

  $: gameSpaceStores = store.loadedGameSpaceStores;
  $: gameSpaces = store.statesMap;
  $: libraryGameSpaceStores = store.filterSortedStores(
    (GS) => GS.isLibraryItem && !GS.isArchived && !GS.isDeleted,
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

  async function handleCreateNewGame(gs: GameSpace) {
    const newGameSpace: GameSpace = {
      ...cloneDeep(gs),
      name: gs.name,
      isLibraryItem: false,
      creator: clients.agentKeyB64,
    };
    try {
      const hash = await store.createGameSpace(newGameSpace);
      const wal = hashToWAL(hash);
      view.resolve(wal);
    } catch (e) {
      view.reject('Error creating game');
    }
  }
</script>

<div class="flexcc bg-[rgb(240_243_250)] h-full">
  <div
    class="w-full overflow-x-auto whitespace-nowrap"
    on:wheel={(ev) => {
      if (ev.deltaY) {
        ev.preventDefault();
        ev.currentTarget.scrollLeft += ev.deltaY;
      }
    }}
  >
    {#each $libraryGameSpaceStores as GSS}
      {@const GS = get(GSS.state)}
      <CreatableItem gameSpace={GS} onClick={() => handleCreateNewGame(GS)} />
    {/each}

    {#each filteredPresetItems as GS}
      <CreatableItem gameSpace={GS} onClick={() => handleCreateNewGame(GS)} />
    {/each}
  </div>
</div>
