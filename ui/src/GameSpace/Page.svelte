<script lang="ts">
  import { getContext, type GameSpaceSyn } from '~/store';

  import GameSpaceComp from './GameSpace.svelte';

  const store = getContext();

  export let hash: string;

  let gameSpace: GameSpaceSyn;
  $: state = gameSpace?.state;
  $: gameSpaces = store.gameDocs;

  $: {
    if ($gameSpaces[hash] && gameSpace !== $gameSpaces[hash]) {
      gameSpace = $gameSpaces[hash];
    }
  }
</script>

{#if gameSpace}
  <GameSpaceComp {gameSpace} />
{/if}
