<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { cloneDeep } from "lodash";
  import SquarePlusIcon from "~icons/fa6-solid/square-plus";
  import FileImportIcon from "~icons/fa6-solid/file-import";
  import DiamondIcon from "~icons/fa6-solid/diamond";

  import { isWeContext } from '@lightningrodlabs/we-applet';

  import type { GamezStore } from "../store";
  import { BoardType } from "../boardList";

  import NewBoardDialog from "./NewBoardDialog.svelte";
  import EditGameTypeDialog from "./EditGameTypeDialog.svelte";
  import BoardMenuItem from "./BoardMenuItem.svelte";
  import BoardDefItem from "./BoardDefItem.svelte";
  import StartGameDialog from "./StartGameDialog.svelte";

  const DEFAULT_GAMES = ["Chess", "Go", "World"];

  const { getStore }: any = getContext("gzStore");
  const store: GamezStore = getStore();

  $: activeBoards = store.boardList.activeBoardHashes;
  $: archivedBoards = store.boardList.archivedBoardHashes;
  $: myProfile = store.profilesStore.myProfile;
  $: myAgentPubKeyB64 = store.myAgentPubKeyB64;
  $: defHashes = store.defHashes;
  $: defsList = store.defsList;
  $: uiProps = store.uiProps

  let showArchived = false;
  let amWeaveSteward = false

  // Binds
  let newBoardDialog;
  let editBoardTypeDialog;
  let startGameDialog;
  let fileinput;

  onMount(async () => {
    if (isWeContext() && (await store.weaveClient.myGroupPermissionType()).type === "Steward")
      amWeaveSteward = true
  })

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


</script>

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

{#if $defsList.status !== "complete" || $defsList.value.length == 0}
  <div class="bg-main-400 text-white/80 p4">
    <h3 class="mb4 font-black">Welcome to Board Gamez!</h3>
    <p class="mb2">
      <DiamondIcon class="float-left mr2 text-main-700 mt.5"/>
      If you have just joined and you don't see any game types, or games, please
      be patient and allow the network to sync with your peers.
    </p>
    {#if !isWeContext() || amWeaveSteward}
      <p>
        <DiamondIcon class="float-left mr2 text-main-700 mt.5"/>
        If you created this instance you may want to click on Chess, Go and
        World in "Create Game Types" or add your own game types.
      </p>
    {/if}
  </div>
{/if}
<div class="flex p4">
  <div class="flex-grow">
    <div class="games-list">
      <h3 class="font-black">Active Games</h3>
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
      <div style="display:flex; align-items:center;">
        <h3>Archived Games</h3>
        <sl-checkbox
          style="margin-left:10px;"
          checked={$uiProps.showArchived}
          on:sl-input={(e) =>
            store.setUIprops({ showArchived: e.target.checked })}
        >
          Show
        </sl-checkbox>
      </div>
      {#if $uiProps.showArchived}
        <div class="games-list-items">
          {#if $archivedBoards.status == "complete" && $archivedBoards.value.length > 0}
            {#each $archivedBoards.value as hash}
              <div
                class="game"
                on:click={() => {
                  store.boardList.unarchiveBoard(hash);
                }}
              >
                <BoardMenuItem boardType={BoardType.archived} boardHash={hash}
                ></BoardMenuItem>
              </div>
            {/each}
          {:else}
            (no archived games)
          {/if}
        </div>
      {/if}
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
                on:create={(e) => startGameDialog.open(e.detail)}
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
        >New <SquarePlusIcon/></sl-button
      >
      <sl-button
        on:click={() => {
          fileinput.click();
        }}
        title="Import Game"
        >Import <FileImportIcon/></sl-button
      >
      {#if (!isWeContext() || amWeaveSteward) && $defsList.status == "complete"}
        {@const names = $defsList.value.map((def) => def.board.name)}
        {#each DEFAULT_GAMES as g}
          {#if !names.find((b) => b == g)}
            <sl-button
              on:click={() => {
                store.addDefaultGames(g);
              }}
              title={g}>{g} <SquarePlusIcon/></sl-button
            >
          {/if}
        {/each}
      {/if}
    </div>
  </div>
</div>
