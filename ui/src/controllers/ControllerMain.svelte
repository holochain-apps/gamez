<script lang="ts">
  import { route } from '~/lib/routes';
  import { Page as GameSpacePage } from '~/GameSpace';
  import HomePage2 from '../HomePage2';


</script>

<div class="flex flex-col h-100vh">

  {#if $route.id === 'home'}
    <HomePage2 />
  {:else if $route.id === 'gameSpace'}
    <GameSpacePage hash={$route.gameSpaceHash} />
  {/if}
</div>
