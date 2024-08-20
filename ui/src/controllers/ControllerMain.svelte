<script lang="ts">
  import { getStoreContext } from '~/lib/context';
  import { type Route, setRouteContext } from '~/lib/routes';
  import LoadingIndicator from '~/shared/LoadingIndicator.svelte';

  import LayoutBar from '../Layout/LayoutBar.svelte';
  import Home from '~/Home';
  import GamezPane from '~/GamezPane';
  import BoardEditor from '~/BoardEditor';

  const store = getStoreContext();
  let route: Route = { id: 'home' };

  setRouteContext({
    nav: (newRoute: Route) => {
      route = newRoute;
    },
    route: () => route,
  });

  $: activeBoard = store.boardList.activeBoard;
  $: activeBoardHash = store.boardList.activeBoardHash;
</script>

<div class="flex flex-col min-h-full">
  {#if store}
    <LayoutBar
      title={route.id === 'home' ? 'Board Gamez' : 'Game Type Editor'}
      activeBoard={$activeBoard}
    />
    {#if $activeBoardHash !== undefined}
      <GamezPane activeBoard={$activeBoard} />
    {:else if route.id === 'home'}
      <Home />
    {:else if route.id === 'newGameDef'}
      <BoardEditor />
    {/if}
  {:else}
    <LoadingIndicator class="mt40" textual={false} />
  {/if}
</div>
