<script lang="ts">
  import { getContext, type GameSpaceSyn } from '~/store';

  import GameSpaceComp from './GameSpace.svelte';

  const { readyGameSpace } = getContext();

  export let hash: string;

  let gameSpace = readyGameSpace(hash);
</script>

{#if $gameSpace}
  <GameSpaceComp gameSpace={$gameSpace} />
{/if}
