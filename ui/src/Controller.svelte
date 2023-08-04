<script lang="ts">
    import Toolbar from './Toolbar.svelte'
    import GamezPane from './GamezPane.svelte'
    import { GamezStore } from './store'
    import { setContext } from 'svelte';
    import type { AppAgentClient } from '@holochain/client';
    import type { SynStore } from '@holochain-syn/store';
    import type { ProfilesStore } from "@holochain-open-dev/profiles";
    import Fa from 'svelte-fa';
    import { faCog, faFileImport, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
    import { cloneDeep } from "lodash";
    import NewBoardDialog from './NewBoardDialog.svelte';
    import EditGameTypeDialog from './EditGameTypeDialog.svelte';

    export let roleName = ""
  
    let synStore: SynStore;
    let gzStore: GamezStore;
    
    export let client : AppAgentClient
    export let profilesStore : ProfilesStore|undefined = undefined

    $: activeBoardHash = gzStore && gzStore.boardList ? gzStore.boardList.activeBoardHash : undefined

    initialize()

    setContext('synStore', {
      getStore: () => synStore,
    });
  
    setContext('gzStore', {
      getStore: () => gzStore,
    });
    const DEFAULT_KD_BG_IMG = "https://images.unsplash.com/photo-1557682250-33bd709cbe85"
    //const DEFAULT_KD_BG_IMG = "https://img.freepik.com/free-photo/studio-background-concept-abstract-empty-light-gradient-purple-studio-room-background-product-plain-studio-background_1258-54461.jpg"
    const NO_BOARD_IMG = "https://holochain.org/img/big_logo.png"
    $: boardList = gzStore? gzStore.boardList.stateStore() : undefined
    $: archivedBoards = boardList ? $boardList.boards.filter((board)=>board.status === "archived") : []
    $: activeBoards = boardList ? $boardList.boards.filter((board)=>board.status !== "archived") : []
    $: boardState = gzStore ? gzStore.boardList.getReadableBoardState($activeBoardHash) :  undefined
    $: myAgentPubKey = gzStore ? gzStore.myAgentPubKey() : undefined

    async function initialize() : Promise<void> {
      const store = createStore()
      synStore = store.synStore;
      try {
        await store.loadBoards()
        gzStore = store
      } catch (e) {
        console.log("Error loading boards:", e)
      }
    }
    function createStore() : GamezStore {
      const store = new GamezStore(
        client,
        roleName
      );
      return store
    }
    let fileinput;
	const onFileSelected = (e)=>{
        let file = e.target.files[0];
        let reader = new FileReader();

        reader.addEventListener("load", async () => {
            const b = JSON.parse(reader.result as string)
            await gzStore.makeGameType(b)
        }, false);
        reader.readAsText(file);
    };
    let newBoardDialog
    let editBoardDialog

  </script>
  
  <svelte:head>
    <script src='https://kit.fontawesome.com/80d72fa568.js' crossorigin='anonymous'></script>
  </svelte:head>
  <div class="flex-scrollable-parent">
    <div class="flex-scrollable-container">
    <div class='app' >

    {#if gzStore}
    <NewBoardDialog bind:this={newBoardDialog}></NewBoardDialog>
    <EditGameTypeDialog bind:this={editBoardDialog}></EditGameTypeDialog>
    <Toolbar profilesStore={profilesStore}/>
      {#if ($boardList.avatars[myAgentPubKey] && $boardList.avatars[myAgentPubKey].name) || profilesStore}
        {#if $activeBoardHash !== undefined}
          <GamezPane on:requestChange={(event) => {gzStore.boardList.requestBoardChanges($activeBoardHash,event.detail)}}/>
        {:else}
        <div class="welcome-text">
          <p style="margin-bottom:20px;">Active Games: {activeBoards.length}, Archived Games: {archivedBoards.length}</p>

          <div style="display:flex">
          <div style="margin-right:100px">
            <h3>Games:</h3>
              {#each $boardList && $boardList.boardTypes as boardType}
                <div style="display:flex; align-items:center;margin-bottom:5px;">
                  <h3 style="margin-right:5px;">{boardType.name}:</h3> 
                  <sl-button
                    style="max-width:100px;margin-right:10px"
                    on:click={async ()=>{
                      const state = cloneDeep(boardType.board)
                      if (state.min_players) {
                        state.props.players.push(myAgentPubKey)
                      }
                      const board = await gzStore.boardList.makeBoard(state)
                      gzStore.boardList.setActiveBoard(board.hashB64())                  
                    }}
                  >
                    Play!
                  </sl-button>
                  <sl-button
                    style="max-width:100px;margin-right:10px"
                    on:click={async ()=>{     
                      const board = cloneDeep(boardType)
                      editBoardDialog.open(board)           
                    }}
                  >
                    <Fa icon={faCog}></Fa>
                  </sl-button>
                </div>
              {/each}
          </div>
          <div class="new-type">
            <h3>New Game Type:</h3>
            <input style="display:none" type="file" accept=".json" on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >
            {#if $boardList && $boardList.boardTypes.length ==0}
              <sl-button on:click={()=>{gzStore.addDefaultGames()}} title="Default Games">Default <Fa icon={faFileImport} size=1x/></sl-button>                      
            {/if}
              <sl-button on:click={()=>newBoardDialog.open()} style="" title="New Game">New <Fa icon={faSquarePlus} size=1x /></sl-button>
            <sl-button on:click={()=>{fileinput.click();}} title="Import Game">Import <Fa icon={faFileImport} size=1x/></sl-button>                      
            </div>
          </div>
        </div> 
        {/if}
      {/if}
    {:else}
      <div class="loading"><div class="loader"></div></div>
    {/if}
  </div>

</div></div>
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
    border-radius: 5px;
    border: 1px solid #222;
    margin: auto;
    margin-top: 50px;
    max-width: 650px;
    padding: 26px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
    background-color: white;
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
