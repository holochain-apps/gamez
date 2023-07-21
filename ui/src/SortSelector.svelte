<script lang="ts">
  import EmojiIcon from './icons/EmojiIcon.svelte'
  import { getContext } from "svelte";
  import type { GamezStore } from "./store";

  export let setSortOption
  export let sortOption

  const handleClick = option => () => {
    if (option === sortOption) {
      setSortOption(null)
    } else {
      setSortOption(option)
    }
  }
  const { getStore } :any = getContext("gzStore");
  let gzStore: GamezStore = getStore();

  $: activeHash = gzStore.boardList.activeBoardHash;
  $: state = gzStore.boardList.getReadableBoardState($activeHash);

</script>

<style>
  .sort-options {
    display: flex;
  }
  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
  }
  .selected {
    background-color: #eee;
  }
</style>

<div class='sort-options'>
  {#each $state.pieceDefs as {type, toolTip, emoji}}
  <div on:click={handleClick(type)} class='wrapper' class:selected={sortOption === type} title="Sort by '{emoji}'">
    <EmojiIcon emoji="{emoji}" on:click={handleClick(type)}/>
  </div>
  {/each}
</div>
