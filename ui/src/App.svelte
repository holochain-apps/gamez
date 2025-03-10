<script lang="ts">
  import 'svooltip/styles.css';

  // import ControllerMain from './controllers/ControllerMain.svelte';
  // import ControllerBoardAsset from './controllers/ControllerBoardAsset.svelte';
  import ModalPromptContextWrapper from './shared/ModalPromptContextWrapper.svelte';
  import clients from './clients';
  import { createStoreContext, getContext, type GameSpace } from './store';
  import { initialState } from './store/grammar';
  import R from '~/lib/routes.svelte';
  import NewGameSpace from './NewGameSpace.svelte';
  import { cx } from './lib/util';
  import HomePage from './HomePage/HomePage.svelte';

  createStoreContext();
  const S = getContext();
</script>

<svelte:head></svelte:head>

<ModalPromptContextWrapper>
  {#if R.route.id === 'home'}
    <HomePage />
    <!-- {#each Object.entries(S.docs) as [hash, doc]}
      <div
        class={cx({
          'bg-red-500': !doc,
        })}
      >
        <button onclick={() => R.nav({ id: 'gameSpace', gameSpaceHash: hash })}>{hash}</button>
      </div>
    {/each} -->
    <!-- <button onclick={() => S.cmd('create-document', initialState())}>Create document</button> -->
  {:else if R.route.id === 'gameSpace'}
    <NewGameSpace hash={R.route.gameSpaceHash} />
  {/if}
  <!-- <ControllerCreatable view={state.view} /> -->
</ModalPromptContextWrapper>
