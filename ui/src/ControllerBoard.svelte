<script lang="ts">
  import { setContext } from 'svelte';

  import type { AppClient, EntryHash } from '@holochain/client';
  import type { SynStore } from '@holochain-syn/store';
  import type { ProfilesStore } from '@holochain-open-dev/profiles';
  import type { WeaveClient } from '@lightningrodlabs/we-applet';

  import { GamezStore } from '~/shared/store';
  import LoadingIndicator from '~/shared/LoadingIndicator.svelte';

  import GamezPane from './GamezPane';

  export let roleName = '';
  export let client: AppClient;
  export let profilesStore: ProfilesStore;
  export let weaveClient: WeaveClient;
  export let board: EntryHash;

  let store: GamezStore = new GamezStore(weaveClient, profilesStore, client, roleName);
  let synStore: SynStore = store.synStore;

  store.boardList.setActiveBoard(board);
  $: activeBoardHash = store.boardList.activeBoardHash;

  setContext('synStore', {
    getStore: () => synStore,
  });

  setContext('gzStore', {
    getStore: () => store,
  });

  $: activeBoard = store.boardList.activeBoard;
</script>

<div class="flex-scrollable-parent">
  <div class="flex-scrollable-container">
    <div class="app">
      {#if store}
        {#if $activeBoardHash !== undefined}
          <GamezPane standAlone={true} activeBoard={$activeBoard} />
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

  .flex-scrollable-parent {
    position: relative;
    display: flex;
    flex: 1;
  }
  .flex-scrollable-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
