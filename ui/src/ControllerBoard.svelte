<script lang="ts">
  import GamezPane from "./GamezPane.svelte";
  import { GamezStore } from "./store";
  import { setContext } from "svelte";
  import type { AppClient, EntryHash } from "@holochain/client";
  import type { SynStore } from "@holochain-syn/store";
  import type { ProfilesStore } from "@holochain-open-dev/profiles";
  import type { WeClient } from "@lightningrodlabs/we-applet";


  export let roleName = "";
  export let client: AppClient;
  export let profilesStore: ProfilesStore;
  export let weaveClient : WeClient
  export let board : EntryHash

  let store: GamezStore = new GamezStore(
    weaveClient,
    profilesStore,
    client,
    roleName,
  );
  let synStore: SynStore = store.synStore

  store.boardList.setActiveBoard(board)
  $: activeBoardHash = store.boardList.activeBoardHash

  setContext("synStore", {
    getStore: () => synStore,
  });

  setContext("gzStore", {
    getStore: () => store,
  });

  $: activeBoard = store.boardList.activeBoard

</script>

<div class="flex-scrollable-parent">
  <div class="flex-scrollable-container">
    <div class="app">
      {#if store}
          {#if $activeBoardHash !== undefined}
            <GamezPane standAlone={true} activeBoard={$activeBoard} />
          {:else}
            <div class="loading"><div class="loader" /></div>
          {/if}
      {:else}
        <div class="loading"><div class="loader" /></div>
      {/if}
    </div>
  </div>
</div>

<style>
  .app {
    margin: 0;
    padding-bottom: 10px;
    background-image: var(--bg-img, url(""));
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

  .loading {
    text-align: center;
    padding-top: 100px;
  }
  .loader {
    border: 8px solid #f3f3f3;
    border-radius: 50%;
    border-top: 8px solid #3498db;
    width: 50px;
    height: 50px;
    -webkit-animation: spin 2s linear infinite; /* Safari */
    animation: spin 2s linear infinite;
    display: inline-block;
  }
  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
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
