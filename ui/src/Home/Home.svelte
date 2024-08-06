<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { cloneDeep } from "lodash";
  import cx from "classnames";
  import SquarePlusIcon from "~icons/fa6-solid/square-plus";
  import FileImportIcon from "~icons/fa6-solid/file-import";
  import EyeOpen from "~icons/fa6-solid/eye";
  import EyeClosed from "~icons/fa6-solid/eye-slash";

  import { isWeContext } from "@lightningrodlabs/we-applet";

  import type { GamezStore } from "../store";
  import { BoardType } from "../boardList";

  import NewBoardDialog from "./NewBoardDialog.svelte";
  import EditGameTypeDialog from "./EditGameTypeDialog.svelte";
  import BoardCard from "./BoardCard.svelte";
  import BoardDefItem from "./BoardDefItem.svelte";
  import StartGameDialog from "./StartGameDialog.svelte";
  import Welcome from "./Welcome.svelte";

  const DEFAULT_GAMES = ["Chess", "Go", "World"];

  const { getStore }: any = getContext("gzStore");
  const store: GamezStore = getStore();

  $: activeBoards = store.boardList.activeBoardHashes;
  $: archivedBoards = store.boardList.archivedBoardHashes;
  $: myProfile = store.profilesStore.myProfile;
  $: myAgentPubKeyB64 = store.myAgentPubKeyB64;
  $: defHashes = store.defHashes;
  $: defsList = store.defsList;
  $: uiProps = store.uiProps;

  let showArchived = false;
  let amWeaveSteward = false;

  // Binds
  let newBoardDialog;
  let editBoardTypeDialog;
  let startGameDialog;
  let fileinput;

  onMount(async () => {
    if (
      isWeContext() &&
      (await store.weaveClient.myGroupPermissionType()).type === "Steward"
    )
      amWeaveSteward = true;
  });

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

  const handleJoinBoard = async (boardHash: Uint8Array) => {
    await store.boardList.setActiveBoard(boardHash);
    const board = await store.boardList.getBoard(boardHash);
    board.requestChanges([
      {
        type: "add-player",
        player: myAgentPubKeyB64,
      },
    ]);
  };

  const handleViewBoard = (boardHash: Uint8Array) => {
    store.boardList.setActiveBoard(boardHash);
  };
</script>

<NewBoardDialog bind:this={newBoardDialog} />
<EditGameTypeDialog bind:this={editBoardTypeDialog} />
<StartGameDialog
  bind:this={startGameDialog}
  on:start-game={async (e) => {
    const state = cloneDeep(e.detail.boardDef.board);
    state.name = e.detail.name;
    if (state.min_players) {
      state.props.players.push(myAgentPubKeyB64);
    }
    const board = await store.boardList.makeBoard(state);
    await board.join();

    store.boardList.setActiveBoard(board.hash);
  }}
/>

{#if $defsList.status !== "complete" || $defsList.value.length == 0}
  <Welcome suggestCreateGameType={!isWeContext() || amWeaveSteward} />
{/if}
<div class="flex p4">
  <div class="flex-grow">
    <div class="mr4 mb4">
      <div class="games-list-items">
        {#if $activeBoards.status == "complete" && $activeBoards.value.length > 0}
          <h3 class="font-black mb4 text-xl">Active Games</h3>
          <div class="grid grid-cols-2 gap-4">
            {#each $activeBoards.value as hash}
              <BoardCard
                boardHash={hash}
                on:view={() => handleViewBoard(hash)}
                on:join={() => handleJoinBoard(hash)}
              />
            {/each}
          </div>
        {:else}
          <div
            class="bg-main-700 rounded-md text-lg text-white/80 text-center py4"
          >
            No active games
          </div>
        {/if}
      </div>
    </div>
    <div>
      <div>
        <h3 class="font-black mb4 text-xl">
          Archived Games
          <button
            class={cx(
              "text-white! bg-main-600 @dark:bg-main-400 text-base px2 py1 ml2 rounded-md font-normal",
              {
                "saturate-0": !$uiProps.showArchived,
              }
            )}
            on:click={() => ($uiProps.showArchived = !$uiProps.showArchived)}
            >{$uiProps.showArchived ? "Hide" : "Show"}</button
          >
        </h3>
      </div>
      {#if $uiProps.showArchived}
        <div>
          {#if $archivedBoards.status == "complete" && $archivedBoards.value.length > 0}
            <div class="grid grid-cols-2 gap-4">
              {#each $archivedBoards.value as hash}
                <BoardCard
                  boardHash={hash}
                  isArchived={true}
                  on:unarchive={() => store.boardList.unarchiveBoard(hash)}
                />
              {/each}
            </div>
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
        title="New Game">New <SquarePlusIcon /></sl-button
      >
      <sl-button
        on:click={() => {
          fileinput.click();
        }}
        title="Import Game">Import <FileImportIcon /></sl-button
      >
      {#if (!isWeContext() || amWeaveSteward) && $defsList.status == "complete"}
        {@const names = $defsList.value.map((def) => def.board.name)}
        {#each DEFAULT_GAMES as g}
          {#if !names.find((b) => b == g)}
            <sl-button
              on:click={() => {
                store.addDefaultGames(g);
              }}
              title={g}>{g} <SquarePlusIcon /></sl-button
            >
          {/if}
        {/each}
      {/if}
    </div>
  </div>
</div>
