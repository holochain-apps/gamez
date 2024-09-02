<script lang="ts">
  import type { EntryHash } from '@holochain/client';
  import type { AppletView } from '@lightningrodlabs/we-applet';

  import LoadingIndicator from '~/shared/LoadingIndicator.svelte';
  import { getStoreContext } from '~/lib/context';
  import BoardPage from '~/BoardPage';

  export let view: Extract<AppletView, { type: 'asset' }>;
  $: board = view.wal.hrl[1] as EntryHash;

  const store = getStoreContext();

  store.boardList.setActiveBoard(board);

  $: activeBoardHash = store.boardList.activeBoardHash;
  $: activeBoard = store.boardList.activeBoard;
</script>

<div class="flex flex-1 relative">
  <div class="absolute inset-0">
    <div class="app">
      {#if store}
        {#if $activeBoardHash !== undefined}
          <BoardPage standAlone={true} activeBoard={$activeBoard} boardHash={$activeBoardHash} />
        {:else}
          <LoadingIndicator textual={false} class="mt40" />
        {/if}
      {:else}
        <LoadingIndicator textual={false} class="mt40" />
      {/if}
    </div>
  </div>
</div>

<style>
  .app {
    margin: 0;
    padding-bottom: 10px;
    background-image: var(--bg-img, url(''));
    background-size: cover;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100vh;
  }
  :global(:root) {
    --resizeable-height: 200px;
    --tab-width: 60px;
  }

  @media (min-width: 640px) {
    .app {
      max-width: none;
    }
  }
</style>
