<script lang="ts">
  import CaretIcon from '~icons/fa6-solid/caret-down';
  import { cx } from '~/lib/util';
  import { getContext, type GameSpaceSyn } from '~/store';
  import ArchiveItem from './ArchiveItem.svelte';
  import { nav } from '~/lib/routes';
  import { get } from 'svelte/store';

  const S = getContext();

  export let gameSpacesStores: GameSpaceSyn[];
  export let cols: boolean = false;
  let showArchive = false;

  function handleUnarchive(store: GameSpaceSyn) {
    store.change({ type: 'set-is-archived', value: false }, true);
  }

  function handleInspect(store: GameSpaceSyn) {
    nav({ id: 'gameSpace', gameSpaceHash: store.hash });
  }

  async function handleDelete(store: GameSpaceSyn) {
    const state = get(store.state);
    if (state.fromPreset && state.isLibraryItem) {
      store.change({ type: 'set-deleted', isDeleted: true }, true);
    } else {
      await S.deleteGameSpace(store.hash);
    }
  }
</script>

{#if gameSpacesStores.length !== 0}
  <div class="bg-main-600">
    <button
      class="bg-main-300 p2 pr3 w-full text-white flexcc text-left"
      on:click={() => (showArchive = !showArchive)}
    >
      <div class="flex-grow">Archive</div>
      <CaretIcon class={cx('transition-transform', { 'rotate-180': !showArchive })} />
    </button>
    {#if showArchive}
      <div class="flex flex-wrap">
        {#each gameSpacesStores as gameSpaceStore (gameSpaceStore.hash)}
          <div class={cx({ 'w-full md:w1/2 lg:w1/3': cols, 'w-full': !cols })}>
            <ArchiveItem
              {gameSpaceStore}
              onUnarchive={() => handleUnarchive(gameSpaceStore)}
              onInspect={() => handleInspect(gameSpaceStore)}
              onDelete={() => handleDelete(gameSpaceStore)}
            />
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}
