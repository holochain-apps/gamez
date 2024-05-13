<script lang="ts">
  import Toolbar from "./Toolbar.svelte";
  import GamezPane from "./GamezPane.svelte";
  import { GamezStore } from "./store";
  import { setContext } from "svelte";
  import type { AppAgentClient } from "@holochain/client";
  import type { SynStore } from "@holochain-syn/store";
  import type { ProfilesStore } from "@holochain-open-dev/profiles";
  import SvgIcon from "./SvgIcon.svelte";
  import { cloneDeep } from "lodash";
  import NewBoardDialog from "./NewBoardDialog.svelte";
  import EditGameTypeDialog from "./EditGameTypeDialog.svelte";
  import { BoardType } from "./boardList";
  import { CHESS, GO } from "./defaultGames";
  import { v1 as uuidv1 } from "uuid";
  import BoardMenuItem from "./BoardMenuItem.svelte";
  import BoardDefItem from "./BoardDefItem.svelte";
  import type { WeClient } from "@lightningrodlabs/we-applet";
  import StartGameDialog from "./StartGameDialog.svelte";

  let defaultGames = [
    {
      id: uuidv1(),
      name: "Chess",
      board: CHESS,
    },
    {
      id: uuidv1(),
      name: "Go",
      board: GO,
    },
  ];

  export let roleName = "";
  export let client: AppAgentClient;
  export let profilesStore: ProfilesStore;
  export let weClient: WeClient;

  let DEFAULT_GAMES = ["Chess", "Go", "World"];
  let store: GamezStore = new GamezStore(
    weClient,
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

  $: activeBoards = store.boardList.activeBoardHashes;
  $: archivedBoards = store.boardList.archivedBoardHashes;
  $: activeBoard = store.boardList.activeBoard;
  $: myAgentPubKeyB64 = store.myAgentPubKeyB64;
  $: myProfile = store.profilesStore.myProfile;
  $: defHashes = store.defHashes;
  $: defsList = store.defsList;

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
  let editBoardTypeDialog;
  let startGameDialog;
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
        <EditGameTypeDialog bind:this={editBoardTypeDialog} />
        <StartGameDialog bind:this={startGameDialog} 
          on:start-game={async (e) => {
            const state = cloneDeep(e.detail.boardDef.board);
            state.name = e.detail.name;
            if (state.min_players) {
              state.props.players.push(myAgentPubKeyB64);
            }
            const board = await store.boardList.makeBoard(state);
            await board.join();

            store.boardList.setActiveBoard(board.hash);
          }}/>
        <Toolbar />
        {#if $activeBoardHash !== undefined}
          <GamezPane activeBoard={$activeBoard} />
        {:else}
          {#if $defsList.status !== "complete" || $defsList.value.length == 0}
            <div class="welcome-text">
              <h3>Welcome to Board Gamez!</h3>
              <p>If you have just joined and you don't see any game types, or games, please be patient and allow the network to sync with your peers. </p>
              <p style="font-size:80%;">If you created this instance you may want to click on Chess, Go and World in "Create Game Types" or add your own game types.</p>
            </div>
          {/if}
          <div style="display:flex">
              <div class="games">
                <div class="games-list">
                  <h3>Active Games</h3>
                  <div class="games-list-items">
                    {#if $activeBoards.status == "complete" && $activeBoards.value.length > 0}
                      {#each $activeBoards.value as hash}
                        <BoardMenuItem
                          on:select={() => store.boardList.setActiveBoard(hash)}
                          boardType={BoardType.active}
                          boardHash={hash}
                        ></BoardMenuItem>
                      {/each}
                    {:else}
                      (no active games)
                    {/if}
                  </div>
                </div>
                <div class="games-list">
                  <h3>Archived Games</h3>
                  <div class="games-list-items">
                    {#if $archivedBoards.status == "complete" && $archivedBoards.value.length > 0}
                      {#each $archivedBoards.value as hash}
                        <div
                          class="game"
                          on:click={() => {
                            store.boardList.unarchiveBoard(hash);
                          }}
                        >
                          <BoardMenuItem
                            boardType={BoardType.archived}
                            boardHash={hash}
                          ></BoardMenuItem>
                        </div>
                      {/each}
                    {:else}
                      (no archived games)
                    {/if}
                  </div>
                </div>
              </div>
            <div class="game-types">
              {#if $myProfile.status == "complete"}
                {@const myName = $myProfile.value.entry.nickname}
                <div style="margin-bottom:10px">
                  <h3>Game Types:</h3>
                  {#if $defHashes.status == "complete"}
                    {#each $defHashes.value as hash}
                      <div class="game-type">
                        <BoardDefItem
                          on:create={(e)=> startGameDialog.open(e.detail)}
                          on:settings={(e) => {
                            editBoardTypeDialog.open(e.detail);
                          }}
                          boardHash={hash}
                        ></BoardDefItem>
                      </div>
                    {/each}
                  {:else if $defHashes.status == "error"}
                    Error!: {$defHashes.error}
                  {/if}
                </div>
              {/if}
              <div class="new-type">
                <h3>Create Game Type:</h3>
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
                  >New <SvgIcon icon="faSquarePlus" size="16" /></sl-button
                >
                <sl-button
                  on:click={() => {
                    fileinput.click();
                  }}
                  title="Import Game"
                  >Import <SvgIcon icon="faFileImport" size="16" /></sl-button
                >
                {#if $defsList.status == "complete"}
                  {@const names = $defsList.value.map((def) => def.board.name)}
                  {#each DEFAULT_GAMES as g}
                    {#if !names.find((b) => b == g)}
                      <sl-button
                        on:click={() => {
                          store.addDefaultGames(g);
                        }}
                        title={g}
                        >{g} <SvgIcon icon="faSquarePlus" size="16" /></sl-button
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
    flex-direction: column;
    border-radius: 5px;
    border: 1px solid #222;
    margin-left: auto;
    margin-right: auto;
    margin-top: 50px;
    max-width: 550px;
    padding: 26px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
    background-color: white;
    text-align: center;
  }
  .welcome-text p {
    margin-top: 10px;
  }
  .games {
    display: flex;
    flex-direction: column;
    flex: 3 ;
  }
  .games-list {
    display: flex;
    flex-direction: column;
    margin: 20px 20px 0px 20px;
    overflow-y: auto;
  }
  .games-list-items {
    display: flex;
    flex-wrap: wrap;
  }
  .game-types {
    margin-top: 20px;
    padding-left: 10px;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    flex: 1;
    border-left: solid 1px #ccc;
  }
  .game-type {
    display: flex;
    margin-left: 5px;
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
