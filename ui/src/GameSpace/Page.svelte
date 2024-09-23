<script lang="ts">
  import { onMount } from 'svelte';

  import { getContext } from './store/store';
  import { type GameSpaceSyn } from './store/GameSpaceSyn';

  import GameSpaceComp from './GameSpace.svelte';

  const store = getContext();

  let gameSpace: GameSpaceSyn;
  $: state = gameSpace?.state;

  onMount(async () => {
    // If there is no game space, create one
    const gameSpaces = await store.getAllGameSpaces();
    if (gameSpaces.size === 0) {
      gameSpace = await store.createGameSpace();
    } else {
      gameSpace = gameSpaces.values().next().value;
    }
  });
</script>

{#if gameSpace && $state}
  <GameSpaceComp {gameSpace} />
{/if}
