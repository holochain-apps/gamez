<script lang="ts">
  import { getStoreContext } from '~/lib/context';
  import LoadingIndicator from '~/shared/LoadingIndicator.svelte';

  import Toolbar from '../Layout/LayoutBar.svelte';
  import Home from '~/Home';
  import GamezPane from '~/GamezPane';
  import BoardEditor from '~/BoardEditor';

  type Route = 'editGameType' | 'editBoard' | 'newBoard' | 'newGame' | 'new' | 'home' | 'game';
  const store = getStoreContext();

  $: activeBoard = store.boardList.activeBoard;
  $: activeBoardHash = store.boardList.activeBoardHash;
</script>

<div class="flex flex-col min-h-full">
  {#if store}
    <Toolbar activeBoard={$activeBoard} />
    {#if $activeBoardHash !== undefined}
      <GamezPane activeBoard={$activeBoard} />
    {:else}
      <Home />
    {/if}
  {:else}
    <LoadingIndicator class="mt40" textual={false} />
  {/if}
</div>
