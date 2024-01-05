<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import type { GamezStore } from "./store";
  import { encodeHashToBase64, type EntryHash } from "@holochain/client";
  import "@shoelace-style/shoelace/dist/components/skeleton/skeleton.js";
  import Participants from "./Participants.svelte";
  import { BoardType } from "./boardList";
  import { asyncDerived, get } from "@holochain-open-dev/stores";

  const dispatch = createEventDispatcher()
  const { getStore } :any = getContext("gzStore");
  let store: GamezStore = getStore();

  export let boardHash: EntryHash
  export let boardType: BoardType


  $: uiProps = store.uiProps
  $: boardData = store.boardList.boardData2.get(boardHash)
 
</script>
<div class="wrapper" on:click={()=>{
      store.updateTip(boardHash)
      dispatch("select")
      }}>
    {#if $boardData.status == "complete"}
      {#if $uiProps.tips.get(boardHash) != $boardData.value.tip}
        <div class="unread"></div>
      {/if}
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
  .unread {
    position: relative;
    top: 0px;
    right: 10px;
    width: 10px;
    height: 10px;
    display: inline;
    background-color: blue;
    border-radius: 50%;
  }
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