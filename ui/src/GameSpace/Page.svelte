<script lang="ts">
  import { getContext } from '~/store';
  import GameSpace from './GameSpace.svelte';

  const { readyGameSpace } = getContext();

  export let hash: string;
  export let asAsset: boolean = false;

  // Ensure it's fully loaded
  let gameSpaceStore = readyGameSpace(hash);
</script>

{#if $gameSpaceStore}
  <GameSpace GSS={$gameSpaceStore} {asAsset} />
{/if}
