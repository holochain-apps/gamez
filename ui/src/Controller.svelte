<script lang="ts">
  import Toolbar from "./Toolbar.svelte";
  import GamezPane from "./GamezPane.svelte";
  import { GamezStore } from "./store";
  import { setContext } from "svelte";
  import type { AppAgentClient, EntryHash } from "@holochain/client";
  import type { SynStore } from "@holochain-syn/store";
  import type { ProfilesStore } from "@holochain-open-dev/profiles";
  import Fa from "svelte-fa";
  import {
    faCog,
    faFileImport,
    faSquarePlus,
  } from "@fortawesome/free-solid-svg-icons";
  import { cloneDeep } from "lodash";
  import NewBoardDialog from "./NewBoardDialog.svelte";
  import EditGameTypeDialog from "./EditGameTypeDialog.svelte";
  import { BoardType } from "./boardList";
  import { CHESS, GO } from './defaultGames';
  import { v1 as uuidv1 } from "uuid";
  import BoardMenuItem from "./BoardMenuItem.svelte";
  import BoardDefItem from "./BoardDefItem.svelte";
  import type { WeClient } from "@lightningrodlabs/we-applet";

  let defaultGames = [
    {
      id: uuidv1(),
      name: "Chess",
      board:CHESS
    },
    {
      id: uuidv1(),
      name: "Go",
      board:GO
    }
  ]

  export let roleName = "";
  export let client: AppAgentClient;
  export let profilesStore: ProfilesStore;
  export let weClient : WeClient

  let DEFAULT_GAMES = ["Chess", "Go", "World"];
  let store: GamezStore = new GamezStore(
    weClient,
    profilesStore,
    client,
    roleName,
  );
  let synStore: SynStore = store.synStore

  $: activeBoardHash = store.boardList.activeBoardHash

  setContext("synStore", {
    getStore: () => synStore,
  });

  setContext("gzStore", {
    getStore: () => store,
  });

  $: activeBoards = store.boardList.activeBoardHashes
  $: archivedBoards = store.boardList.archivedBoardHashes
  $: activeBoard = store.boardList.activeBoard
  $: myAgentPubKeyB64 = store.myAgentPubKeyB64
  $: myProfile = store.profilesStore.myProfile
  $: defHashes = store.defHashes
  $: defsList = store.defsList

  let fileinput;
  const onFileSelected = (e) => {
    let file = e.target.files[0];
    let reader = new FileReader();

    reader.addEventListener(
      "load",
      async () => {
        const b = JSON.parse(reader.result as string);
        await store.makeGameType(b);
      },
      false
    );
    reader.readAsText(file);
  };
  let newBoardDialog;
  let editBoarTypeDialog;
</script>

<svelte:head>
  <script
    src="https://kit.fontawesome.com/80d72fa568.js"
    crossorigin="anonymous"
  ></script>
</svelte:head>
<div class="flex-scrollable-parent">
  <div class="flex-scrollable-container">
    <div class="app">
      {#if store}
        <NewBoardDialog bind:this={newBoardDialog} />
        <EditGameTypeDialog bind:this={editBoarTypeDialog} />
        <Toolbar />
          {#if $activeBoardHash !== undefined}
            <GamezPane activeBoard={$activeBoard} />
          {:else}
            <div class="welcome-text">
              <div class="games-list">
                {#if $activeBoards.status == "complete" && $activeBoards.value.length > 0}
                  <h3>Active Games</h3>
                  {#each $activeBoards.value as hash}
                    <div
                        on:click={()=>store.boardList.setActiveBoard(hash)}
                        class="game" >
                        <BoardMenuItem boardType={BoardType.active} boardHash={hash}></BoardMenuItem>
                    </div>
                  {/each}
                {/if}
                {#if $archivedBoards.status == "complete" && $archivedBoards.value.length > 0}
                  <h3>Archived Games</h3>
                  {#each $archivedBoards.value as hash}
                    <div class="game"
                      on:click={() => {
                        store.boardList.unarchiveBoard(hash);
                      }}
                    >
                      <BoardMenuItem boardType={BoardType.archived} boardHash={hash}></BoardMenuItem>
                    </div>
                  {/each}
                {/if}
              </div>
              <div style="display:flex; flex-direction:column">
                {#if $myProfile.status == "complete"}
                  {@const myName = $myProfile.value.entry.nickname}
                <div style="margin-bottom:10px">
                  <h3>Game Library:</h3>
                  {#if $defHashes.status == "complete"}
                    {#each $defHashes.value as hash}
                      <BoardDefItem 
                        on:create={ 
                          async (e) => {
                            const state = cloneDeep(e.detail.board);
                            state.name = `${state.name}: ${
                              myName
                            }- ${new Date().toLocaleDateString("en-US")}`;
                            if (state.min_players) {
                              state.props.players.push(myAgentPubKeyB64);
                            }
                            const board = await store.boardList.makeBoard(
                              state
                            );
                            store.boardList.setActiveBoard(board.hash)
                          }
                        }
                        on:settings={
                          (e) => {
                            editBoarTypeDialog.open(e.detail);
                          }
                        }
                        boardHash={hash}>
                      </BoardDefItem>
        
                    {/each}
                  {:else if $defHashes.status == "error"}
                    Error!: {$defHashes.error}
                  {/if}
      
                </div>
                {/if}
                <div class="new-type">
                  <h3>Add Game to Library:</h3>
                  <input
                    style="display:none"
                    type="file"
                    accept=".json"
                    on:change={(e) => onFileSelected(e)}
                    bind:this={fileinput}
                  />
                  <sl-button
                    on:click={() => newBoardDialog.open()}
                    style=""
                    title="New Game"
                    >New <Fa icon={faSquarePlus} size="1x" /></sl-button
                  >
                  <sl-button
                    on:click={() => {
                      fileinput.click();
                    }}
                    title="Import Game"
                    >Import <Fa icon={faFileImport} size="1x" /></sl-button
                  >
                  {#if $defsList.status == "complete"}
                    {@const names = $defsList.value.map(def => def.board.name)}
                    {#each DEFAULT_GAMES as g}
                      {#if !names.find((b) => b == g)}
                        <sl-button
                          on:click={() => {
                            store.addDefaultGames(g);
                          }}
                          title={g}
                          >{g} <Fa icon={faSquarePlus} size="1x" /></sl-button
                        >
                      {/if}
                    {/each}
                  {/if}
                </div>
              </div>
            </div>
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
  .welcome-text {
    display: flex;
    border-radius: 5px;
    border: 1px solid #222;
    margin: auto;
    margin-top: 50px;
    max-width: 650px;
    padding: 26px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
    background-color: white;
  }
  .games-list {
    margin-right: 30px;
    border-right: solid 1px lightgray;
    padding-right: 40px;
  }
  .game {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-left: 10px;
    border: solid 1px lightgray;
    padding: 5px;
    border-radius: 5px;
    margin-bottom: 5px;
    cursor: pointer;
  }
  .game:hover {
    background-color: rgb(240, 249, 2244);
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
  .flex-scrollable-x {
    max-width: 100%;
    overflow-x: auto;
  }
  .flex-scrollable-y {
    max-height: 100%;
    overflow-y: auto;
  }
  /* .my-boards {
    display: flex;
  }
  .my-board {
    border-radius: 5px;
    border: 1px solid #222;
    background-color: lightcyan;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    width: 100px;
    margin: 5px;
  } */
</style>
