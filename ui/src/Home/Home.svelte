<script lang="ts">
  // External
  import { onMount } from 'svelte';
  import { cloneDeep } from 'lodash';
  import cx from 'classnames';
  import PlusIcon from '~icons/fa6-solid/plus';
  import FileImportIcon from '~icons/fa6-solid/file-import';

  // Organizational
  import { isWeContext } from '@lightningrodlabs/we-applet';

  // Local
  import { getStoreContext } from '~/lib/context';
  import { nav } from '~/lib/routes';
  import LoadingIndicator from '~/shared/LoadingIndicator.svelte';

  import BoardCard from './BoardCard.svelte';
  import BoardDefItem from './BoardDefItem.svelte';
  import StartGameDialog from './StartGameDialog.svelte';
  import Welcome from './Welcome.svelte';
  import SidebarButton from './SidebarButton.svelte';

  const DEFAULT_GAMES = ['Chess', 'Go', 'World'];

  const store = getStoreContext();

  $: activeBoards = store.boardList.activeBoardHashes;
  $: archivedBoards = store.boardList.archivedBoardHashes;
  $: myProfile = store.profilesStore.myProfile;
  $: myAgentPubKeyB64 = store.myAgentPubKeyB64;
  $: defHashes = store.defHashes;
  $: defsList = store.defsList;
  $: uiProps = store.uiProps;
  $: agentIsSteward = store.agentIsSteward;

  let amWeaveSteward = false;

  // Binds
  let startGameDialog;
  let fileinput;

  onMount(async () => {
    if (isWeContext() && (await store.weaveClient.myGroupPermissionType()).type === 'Steward')
      amWeaveSteward = true;
  });

  const onFileSelected = (e) => {
    let file = e.target.files[0];
    let reader = new FileReader();

    reader.addEventListener(
      'load',
      async () => {
        const b = JSON.parse(reader.result as string);
        await store.makeGameType(b);
      },
      false,
    );
    reader.readAsText(file);
  };

  const handleJoinBoard = async (boardHash: Uint8Array) => {
    nav({ id: 'board', boardHash });
    const board = await store.boardList.getBoard(boardHash);
    board.requestChanges([
      {
        type: 'add-player',
        player: myAgentPubKeyB64,
      },
    ]);
  };

  const handleViewBoard = (boardHash: Uint8Array) => {
    nav({ id: 'board', boardHash });
  };

  $: availablePresets = ((): string[] | null => {
    let games: string[] | null;
    if (
      $agentIsSteward.status === 'complete' &&
      $agentIsSteward.value &&
      $defsList.status === 'complete'
    ) {
      games = [];
      const names = $defsList.value.map((def) => def.board.name);
      DEFAULT_GAMES.forEach((g) => {
        if (!names.find((b) => b == g)) games.push(g);
      });
    }
    return games;
  })();
</script>

<!-- DIALOGS -->

<StartGameDialog
  bind:this={startGameDialog}
  on:start-game={async (e) => {
    const state = cloneDeep(e.detail.boardDef.board);
    state.name = e.detail.name;
    if (state.min_players) {
      state.props.players.push(myAgentPubKeyB64);
    }
    const board = await store.boardList.makeBoard(state);
    await board.join();
    nav({ id: 'board', boardHash: board.hash });
  }}
/>

<div class="flex flex-grow">
  <!-- BOARDS LIST -->

  <div class="flex-grow p4">
    {#if $defsList.status !== 'complete' || $defsList.value.length == 0 || true}
      <Welcome
        suggestCreateGameType={$agentIsSteward.status === 'complete' && $agentIsSteward.value}
      />
    {/if}
    <div class="mb4">
      <!-- ACTIVE BOARDS -->

      <h3 class="font-black mb4 text-xl">Active Games</h3>
      {#if $activeBoards.status == 'complete'}
        {#if $activeBoards.value.length > 0}
          <div class="grid grid-cols-2 gap-4">
            {#each $activeBoards.value as hash}
              <BoardCard
                boardHash={hash}
                on:view={() => handleViewBoard(hash)}
                on:join={() => handleJoinBoard(hash)}
              />
            {/each}
          </div>
        {:else}
          <div
            class="text-center opacity-70 bg-main-700 b b-black/10 @dark:(bg-main-300 b-white/10) rounded-md px4 py8 text-xl"
          >
            No active games
          </div>
        {/if}
      {:else if $activeBoards.status == 'pending'}
        <div class="mt16"><LoadingIndicator /></div>
      {:else if $activeBoards.status == 'error'}
        Error!: {$activeBoards.error}
      {/if}
    </div>

    <!-- ARCHIVED BOARDS -->

    {#if $archivedBoards.status == 'complete' && $archivedBoards.value.length > 0}
      <div>
        <div>
          <h3 class="font-black mb4 text-xl">
            Archived Games ({$archivedBoards.value.length})
            <button
              class={cx(
                'text-white! bg-main-600 @dark:bg-main-400 text-base px2 py1 ml2 rounded-md font-normal',
                {
                  'saturate-0': !$uiProps.showArchived,
                },
              )}
              on:click={() => ($uiProps.showArchived = !$uiProps.showArchived)}
              >{$uiProps.showArchived ? 'Hide' : 'Show'}</button
            >
          </h3>
        </div>
        {#if $uiProps.showArchived}
          <div>
            <div class="grid grid-cols-2 gap-4">
              {#each $archivedBoards.value as hash}
                <BoardCard
                  boardHash={hash}
                  isArchived={true}
                  on:unarchive={() => store.boardList.unarchiveBoard(hash)}
                />
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- SIDEBAR -->

  <div class="bg-main-900 @dark:bg-main-400 p4 w-70 flex-shrink-0">
    <!-- AVAILABLE GAMES -->

    {#if $myProfile.status == 'complete'}
      <div class="mb4">
        <h3 class="font-black mb4 text-xl">Game Types</h3>
        <div class="flex flex-col space-y-2">
          {#if $defHashes.status == 'complete'}
            {#if $defHashes.value.length > 0}
              {#each $defHashes.value as hash}
                <BoardDefItem
                  onNewGame={(boardDef) => startGameDialog.open(boardDef)}
                  onEdit={() => nav({ id: 'editGameDef', defHash: hash })}
                  boardHash={hash}
                ></BoardDefItem>
              {/each}
            {:else}
              <div
                class="text-center opacity-70 bg-main-800 b b-black/10 @dark:(bg-white/20 b-white/10) rounded-md px4 py2"
              >
                <strong class="block">No game types found</strong>
                Add a one below
              </div>
            {/if}
          {:else if $defHashes.status == 'pending'}
            <div class="flexcc"><LoadingIndicator /></div>
          {:else if $defHashes.status == 'error'}
            Error!: {$defHashes.error}
          {/if}
        </div>
      </div>
    {/if}

    <!-- ADD GAME TYPES -->

    <div>
      <h3 class="font-black mb4 text-xl">Add Games Types</h3>
      <input
        class="hidden"
        type="file"
        accept=".json"
        on:change={(e) => onFileSelected(e)}
        bind:this={fileinput}
      />
      <div class="flex space-x-2">
        <SidebarButton mode={'lg'} on:click={() => nav({ id: 'newGameDef' })}>
          <PlusIcon class="text-sm mr2" />
          <div class="flex-grow">New</div>
        </SidebarButton>
        <SidebarButton mode={'lg'} on:click={() => fileinput.click()}>
          <FileImportIcon class="text-sm mr2" />
          <div class="flex-grow">Import</div>
        </SidebarButton>
      </div>
      {#if availablePresets && availablePresets.length > 0}
        <h4 class="font-black mb4 text-lg mt4">Presets</h4>
        <div class="flex flex-col space-y-2">
          {#each availablePresets as g}
            <SidebarButton mode={'lg'} class="w-full" on:click={() => store.addDefaultGames(g)}>
              <PlusIcon class="text-sm" />
              <div class="flex-grow">{g}</div>
            </SidebarButton>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
