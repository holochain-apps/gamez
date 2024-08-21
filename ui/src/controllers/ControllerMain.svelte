<script lang="ts">
  import { getStoreContext } from '~/lib/context';
  import { route } from '~/lib/routes';
  import LoadingIndicator from '~/shared/LoadingIndicator.svelte';

  import LayoutBar from '../Layout/LayoutBar.svelte';
  import Home from '~/Home';
  import GamezPane from '~/GamezPane';
  import BoardEditor from '~/BoardEditor';

  const store = getStoreContext();

  $: title = (() => {
    switch ($route.id) {
      case 'home':
        return 'Board Gamez';
      case 'newGameDef':
        return 'Create Game Type';
      case 'editGameDef':
        return 'Edit Game Type';
      default:
        return 'Board Gamez';
    }
  })();

  $: {
    if ($route.id === 'board') {
      store.boardList.setActiveBoard($route.boardHash);
    } else {
      store.boardList.setActiveBoard(undefined);
    }
  }

  $: activeBoard = store.boardList.activeBoard;
</script>

<div class="flex flex-col min-h-full">
  {#if (store && $route.id === 'board' && $activeBoard) || $route.id !== 'board'}
    <LayoutBar {title} activeBoard={$activeBoard} />
    {#if $route.id === 'board'}
      <GamezPane boardHash={$route.boardHash} activeBoard={$activeBoard} />
    {:else if $route.id === 'home'}
      <Home />
    {:else if $route.id === 'newGameDef'}
      <BoardEditor />
    {:else if $route.id === 'editGameDef'}
      <BoardEditor defHash={$route.defHash} />
    {:else if $route.id === 'editBoard'}
      <BoardEditor boardHash={$route.boardHash} />
    {/if}
  {:else}
    <LoadingIndicator class="mt40" textual={false} />
  {/if}
</div>
