<script lang="ts">
  import { setContext } from "svelte";
  import type { AppClient } from "@holochain/client";
  import type { SynStore } from "@holochain-syn/store";
  import type { ProfilesStore } from "@holochain-open-dev/profiles";
  import { type WeaveClient } from "@lightningrodlabs/we-applet";

  import { GamezStore } from "./store";

  import Toolbar from "./Toolbar.svelte";
  import Home from './Home';
  import GamezPane from "./GamezPane";

  import Loader from './Loader.svelte';

  export let roleName = "";
  export let client: AppClient;
  export let profilesStore: ProfilesStore;
  export let weaveClient: WeaveClient;

  let store: GamezStore = new GamezStore(
    weaveClient,
    profilesStore,
    client,
    roleName
  );
  let synStore: SynStore = store.synStore;

  $: activeBoardHash = store.boardList.activeBoardHash;

  setContext("synStore", {
    getStore: () => synStore,
  });

  setContext("gzStore", {
    getStore: () => store,
  });

  $: activeBoard = store.boardList.activeBoard;
</script>

<div class="flex-scrollable-parent">
  <div class="flex-scrollable-container">
    <div class="app">
      {#if store}
        <Toolbar />
        {#if $activeBoardHash !== undefined}
          <GamezPane activeBoard={$activeBoard} />
        {:else}
          <Home/>
        {/if}
      {:else}
        <Loader/>
      {/if}
    </div>
  </div>
</div>