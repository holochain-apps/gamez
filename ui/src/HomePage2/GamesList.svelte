<script lang="ts">
  import { get, derived } from 'svelte/store';
  import { zip } from 'lodash';
  import { getContext, presets } from '~/store';
  import GamesListItem from './GamesListItem.svelte';
  import DefaultGameItem from './DefaultGameItem.svelte';

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
  $: ownedDrafts = derived(gameDocsStates, ($states) => {
    if (tag !== 'active') return [];
    const loadedGameDocs = zip(Object.values($gameDocs), $states);
    return loadedGameDocs
      .filter(
        ([_, $state]) =>
          $state !== null && $state.status === 'draft' && $state.creator === store.pubKey,
      )
      .sort(([_1, $stA], [_2, $stB]) => $stB.lastChangeAt - $stA.lastChangeAt)
      .map(([gameSpace, _]) => gameSpace);
  });

  $: allNames = derived(gameDocsStates, ($states) =>
    $states.filter((s) => s).map(($state) => $state?.name),
  );
  $: unimportedGlobalLibrary = derived(allNames, ($names) => {
    return Object.values(presets).filter((space) => $names.indexOf(space.name) === -1);
  });
</script>

<div class="flex flex-col p2 space-y-2">
  {#each $ownedDrafts as gameSpace (gameSpace.hash)}
    <GamesListItem {gameSpace} />
  {/each}
  {#each $sortedTaggedGameSpaces as gameSpace (gameSpace.hash)}
    <GamesListItem {gameSpace} />
  {/each}
  {#if tag === 'library' && $unimportedGlobalLibrary.length > 0}
    <h2 class="text-center py4 text-lg">Global library</h2>
    {#each $unimportedGlobalLibrary as gameSpace (gameSpace.name)}
      <DefaultGameItem
        {gameSpace}
        onImport={() => store.createGameSpace({ ...gameSpace, creator: store.pubKey })}
      />
    {/each}
  {/if}
</div>
