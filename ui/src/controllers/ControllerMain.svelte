<script lang="ts">
  import { route } from '~/center/lib/routes';
  import { Page as GameSpacePage } from '~/GameSpace';
  import HomePage from '../HomePage';
</script>

<div class="flex flex-col h-100vh">
  {#if $route.id === 'home'}
    <HomePage />
  {:else if $route.id === 'gameSpace'}
    <GameSpacePage hash={$route.gameSpaceHash} />
  {/if}
</div>
