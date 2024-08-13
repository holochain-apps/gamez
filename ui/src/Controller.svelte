<script lang="ts">
  import { setContext } from 'svelte';
  import type { AppClient } from '@holochain/client';
  import type { SynStore } from '@holochain-syn/store';
  import type { ProfilesStore } from '@holochain-open-dev/profiles';
  import { type WeaveClient } from '@lightningrodlabs/we-applet';

  import { GamezStore } from '~/shared/store';
  import LoadingIndicator from '~/shared/LoadingIndicator.svelte';

  import Toolbar from './Layout/LayoutBar.svelte';
  import Home from './Home';
  import GamezPane from './GamezPane';

  export let roleName = '';
  export let client: AppClient;
  export let profilesStore: ProfilesStore;
  export let weaveClient: WeaveClient;

  let store: GamezStore = new GamezStore(weaveClient, profilesStore, client, roleName);

  let synStore: SynStore = store.synStore;

  $: activeBoardHash = store.boardList.activeBoardHash;

  setContext('synStore', {
    getStore: () => synStore,
  });

  setContext('gzStore', {
    getStore: () => store,
  });

  $: activeBoard = store.boardList.activeBoard;
</script>

<div class="flex flex-col min-h-full">
  {#if store}
    <Toolbar activeBoard={$activeBoard} />
    {#if $activeBoardHash !== undefined}
      <GamezPane activeBoard={$activeBoard} />
    {:else}
      <Home />
    {/if}
  {:else}
    <LoadingIndicator class="mt40" textual={false} />
  {/if}
</div>
