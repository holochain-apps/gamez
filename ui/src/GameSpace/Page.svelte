<script lang="ts">
  import { onMount } from 'svelte';

  import { getContext } from './store/store';
  import { type GameSpaceSyn } from './store/GameSpaceSyn';

  import GameSpaceComp from './GameSpace.svelte';
  import { toPromise } from '@holochain-open-dev/stores';

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
