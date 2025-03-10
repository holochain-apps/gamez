<script lang="ts">
  import R from '~/lib/routes.svelte';
  // import { Page as GameSpacePage } from '~/GameSpace';
  // import HomePage from '../HomePage';
</script>

<div class="flex flex-col h-100vh">
  {#if R.route.id === 'home'}
    <!-- <HomePage /> -->
    HEY!
  {:else if R.route.id === 'gameSpace'}
    <!-- <GameSpacePage hash={R.route.gameSpaceHash} /> -->
  {/if}
</div>
