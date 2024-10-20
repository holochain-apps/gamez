<script lang="ts">
  type Tag = 'active' | 'groupLibrary' | 'globalLibrary' | 'draft' | 'archived';
  export let tag: Tag;

  import { getContext } from '../GameSpace/store/store';
  import GamesListItem from './GamesListItem.svelte';

  const store = getContext();
  $: gameDocs = store.gameDocs;
</script>

<div class="flex flex-col p2 space-y-2">
  {#each Object.entries($gameDocs) as [hash, gameSpace]}
    <GamesListItem {gameSpace} />
  {/each}
</div>
