<script lang="ts">
  import { get } from 'svelte/store';

  type Tag = 'active' | 'groupLibrary' | 'globalLibrary' | 'draft' | 'archived';
  export let tag: Tag;

  import { getContext } from '../GameSpace/store/store';
  import GamesListItem from './GamesListItem.svelte';

  const store = getContext();
  // let stateChangeTick
  $: gameDocs = store.gameDocs;
  // $: {

  //   loadedGameDocs = Object.fromEntries(
  //   Object.entries($gameDocs).filter(([, gameSpace]) => get(gameSpace.state) !== null),
  // );
  // }
  // $: sortedGameDocs = Object.fromEntries(
  //   Object.entries(loadedGameDocs).sort(
  //     (a, b) => get(b[1].state).lastChangeAt - get(a[1].state).lastChangeAt,
  //   ),
  // );
</script>

<div class="flex flex-col p2 space-y-2">
  {#each Object.entries($gameDocs) as [hash, gameSpace] (hash)}
    <GamesListItem {gameSpace} />
  {/each}
</div>
