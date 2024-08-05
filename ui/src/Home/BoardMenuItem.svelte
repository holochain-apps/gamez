<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import type { GamezStore } from "../store";
  import { decodeHashFromBase64, type EntryHash } from "@holochain/client";
  import "@shoelace-style/shoelace/dist/components/skeleton/skeleton.js";
  import "@shoelace-style/shoelace/dist/components/card/card.js";
  import "@shoelace-style/shoelace/dist/components/relative-time/relative-time.js";
  import Participants from "../Participants.svelte";
  import { BoardType } from "../boardList";
  import { hashEqual } from "../util";
  import Avatar from "../Avatar.svelte";

  const dispatch = createEventDispatcher()
  const { getStore } :any = getContext("gzStore");
  let store: GamezStore = getStore();

  export let boardHash: EntryHash
  export let boardType: BoardType


  $: uiProps = store.uiProps
  $: boardData = store.boardList.boardData2.get(boardHash)
</script>
<sl-card on:click={()=>{
      dispatch("select")
      }}>
    {#if $boardData.status == "complete"}
      {@const latestDate = $boardData.value.tip ? new Date($boardData.value.tip.action.timestamp) : undefined}
      {@const createdDate = new Date($boardData.value.document.action.timestamp)}
      <div slot="header" style="display:flex; justify-content:space-between; align-items:center;">
        <span class="board-name">{$boardData.value.latestState.name}</span>
        {#if $boardData.value.tip && !hashEqual($uiProps.tips.get(boardHash), $boardData.value.tip.entryHash)}
          <span class="unread" title="New Activity"></span>
        {/if}
      </div>
      {#if latestDate}
        <div class="item"><span class="item-title">Last Action:</span>  <sl-relative-time format="short" date={latestDate}></sl-relative-time></div>
      {/if}
      <div class="item"><span class="item-title">Started:</span>  <sl-relative-time format="short" date={createdDate}></sl-relative-time></div>

      {#if boardType == BoardType.active}
        <div class="item"><span class="item-title">Players:</span> <Participants moreAfter={3} showPlayers={true} board={$boardData.value.board}></Participants></div>
      {/if}
      {#if $boardData.value.latestState.creator}
        <div class="item"><span class="item-title">Created by:</span> <Avatar size={18} agentPubKey={decodeHashFromBase64($boardData.value.latestState.creator)} showNickname={true} /></div>
      {/if}
    {:else if $boardData.status == "pending"}
      <sl-skeleton
        effect="pulse"
        style="height: 10px; width: 100%"
        ></sl-skeleton>
    {:else if $boardData.status == "error"}
      {$boardData.error}
    {/if}
    </sl-card>
<style>
  sl-card {
    cursor: pointer;
    margin: 5px;
    transition: all .25s ease;
    transform: scale(1);
  }
  sl-card:hover {
    transition: all .25s ease;
    transform: scale(1.05);
    box-shadow: 0px 5px 5px rgba(63, 57, 130, 0.35);
  }
  .item {
    display: flex;
    align-items: center;
    padding: 2px;
  }
  .item-title {
    width: 100px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content:flex-end;
    margin-right:5px;
  }
  .unread {
    margin-left: 5px;
    justify-self: end;
    background-color: rgb(122, 213, 83);
    border-radius: 50%;
    padding: 2px 5px;
    font-size: 80%;
    height: 20px;
    width: 20px;
  }
  .board-name {
        font-size: 16px;
        font-weight: bold;
    }
</style>