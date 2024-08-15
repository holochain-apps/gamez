<script lang="ts">
  import { getStoreContext } from '~/lib/context';
  import LoadingIndicator from '~/shared/LoadingIndicator.svelte';

  import Toolbar from '../Layout/LayoutBar.svelte';
  import Home from '~/Home';
  import GamezPane from '~/GamezPane';
  import BoardEditor from '~/BoardEditor';
  import { setContext } from 'svelte';

  type Route = 'editGameType' | 'editBoard' | 'newBoard' | 'newGame' | 'new' | 'home' | 'game';
  const store = getStoreContext();
  let route: Route = 'home';

  function handleNav(ev: { detail: Route }) {
    route = ev.detail;
  }

  setContext('nav', {
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
    <Toolbar activeBoard={$activeBoard} {route} on:nav={handleNav} />
    {#if $activeBoardHash !== undefined}
      <GamezPane activeBoard={$activeBoard} />
    {:else if route === 'home'}
      <Home on:nav={handleNav} />
    {:else if route === 'newBoard'}
      <BoardEditor />
    {/if}
  {:else}
    <LoadingIndicator class="mt40" textual={false} />
  {/if}
</div>
