<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import type { GamezStore } from "./store";
  import type { EntryHash } from "@holochain/client";
  import "@shoelace-style/shoelace/dist/components/skeleton/skeleton.js";
  import Participants from "./Participants.svelte";
  import { BoardType } from "./boardList";

  const dispatch = createEventDispatcher()
  const { getStore } :any = getContext("gzStore");
  let store: GamezStore = getStore();

  export let boardHash: EntryHash
  export let boardType: BoardType

  $: boardData = store.boardList.boardData2.get(boardHash)

</script>
<div class="wrapper" on:click={()=>{dispatch("select")}}>
    {#if $boardData.status == "complete"}
      <div class="board-name">{$boardData.value.latestState.name}</div>
      {#if boardType == BoardType.active}
        <Participants board={$boardData.value.board}></Participants>
      {/if}
    {:else if $boardData.status == "pending"}
      <sl-skeleton
        effect="pulse"
        style="height: 10px; width: 100%"
        ></sl-skeleton>
    {:else if $boardData.status == "error"}
      {$boardData.error}
    {/if}
</div>
<style>
  .wrapper {
    width: 100%;
    border-radius: 50%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .board-name {
        font-size: 16px;
        font-weight: bold;
        margin-right: 10px;
    }
</style>