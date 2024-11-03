<script lang="ts">
  import { getContext } from '~/store';
  import GameSpace from './GameSpace.svelte';

  const { readyGameSpace } = getContext();

  export let hash: string;
  export let asAsset: boolean = false;

  let gameSpace = readyGameSpace(hash);

  $: console.log('GAME SPACE', gameSpace);
</script>

{#if $gameSpace}
  <GameSpace gameSpace={$gameSpace} {asAsset} />
{/if}
