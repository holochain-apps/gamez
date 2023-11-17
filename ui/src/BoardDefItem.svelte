<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import type { GamezStore } from "./store";
  import type { EntryHash } from "@holochain/client";
  import "@shoelace-style/shoelace/dist/components/skeleton/skeleton.js";
  import Fa from "svelte-fa";
  import { faCog } from "@fortawesome/free-solid-svg-icons";

  const dispatch = createEventDispatcher()
  const { getStore } :any = getContext("gzStore");
  let store: GamezStore = getStore();

  export let boardHash: EntryHash

  $: def = store.defs.get(boardHash)

</script>
<div class="wrapper">
    {#if $def.status == "complete"}
      {@const boardData = $def.value}
      <div class="board-name">{boardData.board.name}</div>
      <sl-button
        style="max-width:100px;margin-right:10px"
        on:click={()=>{dispatch("create", boardData)}}
      >
        Create Game
      </sl-button>
      <sl-button
        style="max-width:100px;margin-right:10px"
        on:click={dispatch("settings", boardData)}
      >
        <Fa icon={faCog} />
      </sl-button>

    {:else if $def.status == "pending"}
      <sl-skeleton
        effect="pulse"
        style="height: 10px; width: 100%"
        ></sl-skeleton>
    {:else if $def.status == "error"}
      {$def.error}
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