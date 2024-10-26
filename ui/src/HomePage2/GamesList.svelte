<script lang="ts">
  import { get, derived } from 'svelte/store';
  import { zip } from 'lodash';
  import { getContext } from '~/store';
  import GamesListItem from './GamesListItem.svelte';

  type Tag = 'active' | 'library' | 'globalLibrary' | 'draft' | 'archived';
  export let tag: Tag;

  const store = getContext();
  $: gameDocs = store.gameDocs;
  $: gameDocsStates = Object.values($gameDocs).map((gameSpace) => gameSpace.state);
  $: sortedTaggedGameSpaces = derived(gameDocsStates, ($states) => {
    const loadedGameDocs = zip(Object.values($gameDocs), $states);
    return loadedGameDocs
      .filter(([_, $state]) => $state !== null && $state.status === tag)
      .sort(([_1, $stA], [_2, $stB]) => $stB.lastChangeAt - $stA.lastChangeAt)
      .map(([gameSpace, _]) => gameSpace);
  });
</script>

<div class="flex flex-col p2 space-y-2">
  {#each $sortedTaggedGameSpaces as gameSpace (gameSpace.hash)}
    <GamesListItem {gameSpace} />
  {/each}
</div>
