<script lang="ts">
  import { setContext } from 'svelte';
  import { cloneDeep } from "lodash";
  import '@shoelace-style/shoelace/dist/components/select/select.js';
  import '@shoelace-style/shoelace/dist/components/option/option.js';

  import { encodeHashToBase64, type AppClient } from '@holochain/client';
  import type { SynStore } from '@holochain-syn/store';
  import type { ProfilesStore } from "@holochain-open-dev/profiles";
  import type { WeaveClient } from '@lightningrodlabs/we-applet';
  
  import { GamezStore } from '~/shared/store'
  import { getMyDna } from '~/shared/util';

  export let roleName = ""
  export let client : AppClient
  export let weaveClient : WeaveClient
  export let profilesStore : ProfilesStore
  export let view

  let store: GamezStore = new GamezStore (
    weaveClient,
    profilesStore,
    client,
    roleName,
  );
  let synStore: SynStore = store.synStore

  setContext('synStore', {
    getStore: () => synStore,
  });

  setContext('store', {
    getStore: () => store,
  });
  let inputElement
  let gameTypeElement
  let disabled = true
  $: defsList = store.defsList

</script>
  <div class="flex-scrollable-parent">
    <div class="flex-scrollable-container">
      <div class='app'>

      <div class="wrapper" >

      <div class="workspace" style=" display:flex; flex-direction:column;padding:20px;">
        <sl-select
          hoist
          placeholder="Game Type"
          bind:this={gameTypeElement}
          on:sl-input={(e)=>disabled = !e.target.value || !inputElement.value}
          >
          {#if $defsList.status == "complete"}
            {#each $defsList.value as def}
            <sl-option 
              value={encodeHashToBase64(def.originalHash)}
            >
              {def.board.name}
            </sl-option>
            {/each}
          {:else}
          loading
          {/if}
        </sl-select>
        <sl-input bind:this={inputElement}
          on:sl-input={(e)=>disabled = !e.target.value || !gameTypeElement.value}
          placeholder="Game Name"
          style="margin-top:5px;"
          ></sl-input>
          <div style="margin-top:10px;display:flex;justify-content:flex-end">
            <sl-button on:click={()=>{
              view.cancel()
            }}>Cancel</sl-button>
            <sl-button 
              style="margin-left:10px;"
              variant="primary"
              disabled={disabled}
              on:click={async ()=>{
              if ($defsList.status == "complete") {
                try {
                  const defHashB64 = gameTypeElement.value
                  const defBoard = Array.from($defsList.value).find(def=>encodeHashToBase64(def.originalHash)==defHashB64)
                  const state = cloneDeep(defBoard.board);
                  state.name = inputElement.value
                  const board = await store.boardList.makeBoard(state);
                  const dnaHash = await getMyDna(roleName, client)
                  view.resolve({hrl:[dnaHash, board.hash]})
                } catch(e) {
                  console.log("ERR",e)
                  view.reject(e)
                }
              } else {
                console.log("click before defs loaded")
              }
            }}>Create</sl-button>
          </div>
        </div>
        </div>
    </div>
  </div>
</div>
<style>
  .app {
    margin: 0;
    padding-bottom: 10px;
    background-size: cover;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background-color: #fff;
    height: 100vh;
    position: relative;
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
  @-webkit-keyframes spin {
    0% { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

  .wrapper {
    position: relative;
    z-index: 10;
  }

</style>
