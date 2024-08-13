<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import cx from 'classnames';
  import UserIcon from '~icons/fa6-solid/user';
  import ShrinkIcon from '~icons/fa6-solid/down-left-and-up-right-to-center';

  import { type EntryHash, decodeHashFromBase64 } from '@holochain/client';
  import { pipe } from '@holochain-open-dev/stores';

  import { GamezStore } from '~/shared/store';
  import Avatar from '~/shared/Avatar.svelte';
  import { hashEqual, isComplete } from '~/shared/util';
  import { Board } from '~/shared/board';
  import { tooltip } from '~/shared/tooltip';

  const dispatch = createEventDispatcher();

  export let boardHash: EntryHash;
  export let isArchived: boolean = false;

  const { getStore }: any = getContext('gzStore');
  let store: GamezStore = getStore();

  $: uiProps = store.uiProps;
  $: boardData = store.boardList.boardData2.get(boardHash);
  $: latestSnapshot = pipe(
    boardData,
    async (boardData) => boardData.board.workspace.latestSnapshot,
    (latestSnapshot) => latestSnapshot,
  );

  type State = {
    board: Board;
    name: string;
    creator: string;
    createdDate: Date;
    latestDate: Date;
    minPlayers: number;
    maxPlayers: number;
    players: string[];
    hasNewActivity: boolean;
    turnPlayerIndex: number | undefined;
  };

  let state: State | null;

  $: {
    if (isComplete($boardData)) {
      const v = $boardData.value;
      state = {
        board: v.board,
        name: v.latestState.name,
        creator: v.latestState.creator,
        createdDate: new Date(v.document.action.timestamp),
        latestDate: v.tip ? new Date(v.tip.action.timestamp) : undefined,
        minPlayers: v.latestState.min_players,
        maxPlayers: v.latestState.max_players,
        players: v.latestState.props.players,
        hasNewActivity:
          $boardData.value.tip &&
          !hashEqual($uiProps.tips.get(boardHash), $boardData.value.tip.entryHash),
        turnPlayerIndex: v.latestState.turns ? v.latestState.props.turn | 0 : undefined,
      };
      // I am not getting what's the difference between latestSnapshot
      // and latestState; but seemed important on the previous implementation
      if (isComplete($latestSnapshot)) {
        const lsv = $latestSnapshot.value;
        state = {
          ...state,
          minPlayers: lsv.min_players,
          maxPlayers: lsv.max_players,
          players: lsv.props.players,
        };
      }
    } else {
      state = null;
    }
  }

  let showAllPlayers = false;
  let playersContainer: HTMLDivElement;
  let windowResized: number = 1;
  let maxPlayersSlotCount: number;
  $: {
    if (playersContainer && windowResized) {
      const { width } = playersContainer.getBoundingClientRect();

      const SLOT_WIDTH = 55; // Magic number
      maxPlayersSlotCount = Math.floor(width / SLOT_WIDTH);
    } else {
      maxPlayersSlotCount = 7;
    }
  }

  function recalculateMaxPlayersThatFitOnContainer() {
    windowResized++;
  }

  $: playersThatCanJoinLeft = state ? state.maxPlayers - state.players.length : 0;
  $: slotsAvailableInfo = state
    ? playersThatCanJoinLeft === 0
      ? 'No slots available'
      : `${playersThatCanJoinLeft} slots available.`
    : '';
  $: playersMinMaxInfo = state
    ? state.minPlayers === state.maxPlayers
      ? `Requires ${state.maxPlayers} players. ${slotsAvailableInfo}`
      : `Requires ${state.minPlayers}-${state.maxPlayers} players. ${slotsAvailableInfo}`
    : '';

  $: canJoin = playersThatCanJoinLeft > 0 && !state.players.includes(store.myAgentPubKeyB64);

  // $: extraPlayers = state ? Math.max(state.players.length - maxPlayersSlotCount, 0) : 0;
  // $: extraSlots = state ? maxPlayersSlotCount - state.players.length : 0;
</script>

<svelte:window on:resize={recalculateMaxPlayersThatFitOnContainer} />

<div
  class="flex flex-col bg-main-900 @dark:bg-main-400 b b-main-600 overflow-hidden rounded-md shadow-md"
>
  {#if state}
    <!-- HEADER -->
    <div class="flex bg-main-700 @dark:bg-main-500 text-white/80 overflow-hidden">
      <div
        class="flex-grow flexcs text-left px2 py2 text-lg"
        style="text-shadow: 0 1px 0 rgba(0,0,0,.25);"
      >
        {#if state.hasNewActivity}
          <div
            use:tooltip={'There is new activity'}
            class="h5 w5 mr2 rounded-full bg-green-500 b b-green-600"
          ></div>
        {/if}
        {state.name}
      </div>
      <div
        class="bg-gradient-to-b from-white/0 to-white/10 bg-main-500 @dark:bg-main-400 px2 h-8 rounded-bl-md"
        title="Creator"
        style="text-shadow: 0 -1px 0 rgba(0,0,0,.10);"
        use:tooltip={'Spaceholder'}
      >
        <Avatar size={20} agentPubKey={decodeHashFromBase64(state.creator)} showNickname={true} />
      </div>
    </div>

    <!-- BODY -->
    <div class="flex-grow">
      <!-- PLAYERS -->
      {#if !isArchived}
        <div
          class="p2 flex justify-center overflow-hidden w-full"
          class:flex-wrap={showAllPlayers}
          bind:this={playersContainer}
        >
          {#each { length: Math.min(state.maxPlayers, showAllPlayers ? state.maxPlayers : maxPlayersSlotCount) } as _, i}
            <div class="relative flex-shrink-0 mr2 mb2 last:mr0">
              <div
                class:opacity-50={i >= state.minPlayers}
                class="
              flexcc h10 w10 overflow-hidden
              bg-black/10 rounded-full shadow-inner b b-black/10
              text-black/30 font-bold"
              >
                {#if state.players[i]}
                  <Avatar
                    size={35}
                    agentPubKey={decodeHashFromBase64(state.players[i])}
                    showNickname={false}
                    tooltipName={true}
                  />
                {:else}
                  <UserIcon />
                {/if}
              </div>
              {#if i === state.turnPlayerIndex && state.players[i]}
                <div
                  use:tooltip={"It's this player turn"}
                  class="absolute -left-.5 -top-.5 bg-green-400 bg-green-500 w4 h4 rounded-full"
                ></div>
              {/if}
            </div>
          {/each}
          {#if state.maxPlayers > maxPlayersSlotCount && !showAllPlayers}
            <button
              on:click={() => {
                if (state.players.length > maxPlayersSlotCount) showAllPlayers = true;
              }}
              disabled={state.players.length < maxPlayersSlotCount}
              class={cx(
                `
                flexcc flex-shrink-0 h10 w10 mr2 mb2 last:mr0 overflow-hidden
                bg-black/10 rounded-full shadow-inner b b-black/10
                text-black/30 font-bold`,
                {
                  'opacity-50': maxPlayersSlotCount >= state.players.length,
                  'cursor-default': state.players.length < maxPlayersSlotCount,
                },
              )}
            >
              +{state.maxPlayers - maxPlayersSlotCount}
            </button>
          {/if}
          {#if showAllPlayers}
            <button
              on:click={() => (showAllPlayers = false)}
              class="
          flexcc flex-shrink-0 h10 w10 mr2 mb2 last:mr0 overflow-hidden
          bg-black/10 rounded-full shadow-inner b b-black/10
          text-black/30 font-bold"
            >
              <ShrinkIcon class="rotate-45" />
            </button>
          {/if}
        </div>
        <div class="text-sm text-center -mt2">{playersMinMaxInfo}</div>
      {/if}

      <!-- TIME INFO -->
      <div class="flexcc pl2 pt2 flex-wrap">
        <div
          class="bg-main-700 b-main-600 text-white/80! @dark:(bg-main-500 b-main-400) px2 py1 rounded-md b mr2 mb2"
        >
          Started <sl-relative-time format="short" date={state.createdDate}></sl-relative-time>
        </div>
        {#if state.latestDate}
          <div
            class="bg-main-700 b-main-600 text-white/80! @dark:(bg-main-500 b-main-400) px2 py1 rounded-md b mr2 mb2"
          >
            Last move <sl-relative-time format="short" date={state.latestDate}></sl-relative-time>
          </div>
        {/if}
      </div>
    </div>

    <!-- FOOTER -->
    <div class="bg-black/10 flex b-t b-main-600">
      {#if !isArchived}
        <button
          style="text-shadow: 0 1px 0 rgba(0,0,0,.25);"
          class="px2 py1 bg-main-700 @dark:bg-main-600 w-full text-white b-r b-main-600 hover:brightness-105"
          on:click={() => dispatch('view')}
        >
          View
        </button>
        <button
          disabled={!canJoin}
          style="text-shadow: 0 1px 0 rgba(0,0,0,.25);"
          class={cx('px2 py1 bg-main-700 @dark:bg-main-600 w-full text-white', {
            'saturate-50 opacity-50': !canJoin,
            'hover:brightness-105': canJoin,
          })}
          on:click={() => (canJoin ? dispatch('join') : null)}>Join</button
        >
      {:else}
        <button
          style="text-shadow: 0 1px 0 rgba(0,0,0,.25);"
          class={cx('px2 py1 bg-main-700 @dark:bg-main-600 w-full text-white hover:brightness-105')}
          on:click={() => dispatch('unarchive')}>Unarchive</button
        >
      {/if}
    </div>
  {:else if $boardData.status === 'pending'}
    <div class="p4">
      <sl-skeleton effect="pulse" class="h-8 w-full mb2"></sl-skeleton>
      <sl-skeleton effect="pulse" class="h-24 w-full mb2"></sl-skeleton>
      <sl-skeleton effect="pulse" class="h-8 w-full"></sl-skeleton>
    </div>
  {:else if $boardData.status === 'error'}
    <div class="p4">{$boardData.error || 'Unknown error loading board'}</div>
  {/if}
</div>
