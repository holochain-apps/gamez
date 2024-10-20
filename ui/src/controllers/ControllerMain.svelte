<script lang="ts">
  import { getStoreContext } from '~/lib/context';
  import { route } from '~/lib/routes';
  import LoadingIndicator from '~/shared/LoadingIndicator.svelte';

  // import LayoutBar from '../Layout/LayoutBar.svelte';
  // import HomePage from '~/HomePage';
  // import BoardPage from '~/BoardPage';
  // import BoardEditorPage from '~/BoardEditorPage';
  import { Page as GameSpacePage } from '~/GameSpace';
  import HomePage2 from '../HomePage2';

  // const store = getStoreContext();

  $: title = (() => {
    switch ($route.id) {
      case 'home':
        return 'Board Gamez';
      case 'newGameDef':
        return 'Create Game Type';
      case 'editGameDef':
        return 'Edit Game Type';
      case 'gameSpace':
        return 'Game Space';
      default:
        return 'Board Gamez';
    }
  })();

  // $: {
  //   if ($route.id === 'board') {
  //     store.boardList.setActiveBoard($route.boardHash);
  //   } else {
  //     store.boardList.setActiveBoard(undefined);
  //   }
  // }

  // $: activeBoard = store.boardList.activeBoard;
</script>

<div class="flex flex-col h-100vh">
  <!-- {#if (store && $route.id === 'board' && $activeBoard) || $route.id !== 'board'} -->
  <!-- {#if $route.id !== 'gameSpace'}<LayoutBar {title} activeBoard={$activeBoard} />{/if} -->
  <!-- {#if $route.id === 'board'} -->
  <!-- <BoardPage boardHash={$route.boardHash} activeBoard={$activeBoard} /> -->
  {#if $route.id === 'home'}
    <HomePage2 />
  {:else if $route.id === 'gameSpace'}
    <GameSpacePage hash={$route.gameSpaceHash} />
    <!-- {:else if $route.id === 'newGameDef'}
      <BoardEditorPage />
    {:else if $route.id === 'editGameDef'}
      <BoardEditorPage defHash={$route.defHash} />
    {:else if $route.id === 'editBoard'}
      <BoardEditorPage boardHash={$route.boardHash} /> -->
  {/if}
  <!-- {:else}
    <LoadingIndicator class="mt40" textual={false} />
  {/if} -->
</div>
