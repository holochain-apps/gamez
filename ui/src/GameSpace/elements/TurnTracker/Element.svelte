<script lang="ts">
  import PlayIcon from '~icons/fa6-solid/play';
  import PauseIcon from '~icons/fa6-solid/pause';
  import RectangleListIcon from '~icons/fa6-solid/rectangle-list';

  import { getGSS } from '~/store';
  import AgentName from '~/shared/AgentName.svelte';

  import type { TurnTrackerElement, TurnStarted } from './type';
  import TurnsLog from './TurnsLog.svelte';
  import { formatTime } from './utils';
  import PlayerIcon from '../../ui/PlayerIcon.svelte';

  export let el: TurnTrackerElement;
  const GSS = getGSS();
  $: GS = GSS.state;
  $: playersSlots = $GS.playersSlots;
  $: filledPlayersSlots = playersSlots.filter((p) => !!p.pubKey);

  $: mode = GSS.mode;
  $: playMode = $mode === 'play';
  $: editMode = $mode === 'edit';

  let currentTurn: TurnStarted | null = null;
  let activePlayer: number = null; //
  // let activePlayer: string | null;
  $: {
    if (!el.turnsLog.length) {
      activePlayer = null;
      currentTurn = null;
    } else {
      currentTurn = el.turnsLog[el.turnsLog.length - 1];
      if (currentTurn.playerSlot !== -1) {
        activePlayer = currentTurn.playerSlot;
      } else {
        // Paused game
        const previousTurn = el.turnsLog[el.turnsLog.length - 2];
        activePlayer = previousTurn.playerSlot;
      }
    }
  }
  $: activePlayerKey = $GS.playersSlots[activePlayer]?.pubKey || null;
  $: visibleActivePlayerIndex =
    activePlayer !== null
      ? el.showEmptyPlayersSlots
        ? activePlayer
        : filledPlayersSlots.findIndex((p) => p.pubKey === activePlayerKey)
      : null;
  $: isPlayerTurn = activePlayerKey === GSS.pubKey;
  $: playerSlotIndex = $GS.playersSlots.findIndex((p) => p.pubKey === GSS.pubKey);
  $: isPaused = currentTurn && currentTurn.playerSlot === -1;
  $: canPauseGame = isPlayerTurn && !isPaused;

  function handleStart() {
    const turn = { playerSlot: playerSlotIndex, time: Date.now() };
    GSS.change([
      { type: 'update-element', element: { uuid: el.uuid, turnsLog: [turn] } },
      {
        type: 'add-log',
        log: {
          type: 'turn',
          message: 'turn started',
        },
      },
    ]);
  }

  function handleNextTurn() {
    let nextPlayer: number = null;
    if (filledPlayersSlots.length === 0 || activePlayer === null) {
      return;
    }
    if (isPaused) {
      // Game is paused
      // Pick previous player for next turn
      nextPlayer = activePlayer;
    } else {
      let i = activePlayer + 1;
      while (nextPlayer === null) {
        if ($GS.playersSlots[i]) {
          if ($GS.playersSlots[i].pubKey) {
            nextPlayer = i;
          } else {
            i++;
          }
        } else {
          i = 0;
        }
      }
      if (nextPlayer === activePlayer) {
        nextPlayer = -1; // Pause game instead
      }
      // $state.playersSlots[activePlayer + 1].pubKey;
      // const index = filledPlayersSlots.findIndex((p) => p.pubKey === pubKey);

      // filledPlayersSlots.find
      // nextPlayer = $state.players[(playerIndex + 1) % $state.players.length];
    }

    const turn = { playerSlot: nextPlayer, time: Date.now() };
    GSS.change([
      {
        type: 'update-element',
        element: { uuid: el.uuid, turnsLog: [...el.turnsLog, turn] },
      },
      {
        type: 'add-log',
        log: {
          type: 'turn',
          message: 'turn started',
          ...(nextPlayer !== -1 ? { pubKey: $GS.playersSlots[nextPlayer].pubKey } : {}),
        },
      },
    ]);
  }

  function handlePauseTurn() {
    if (!canPauseGame) return;
    const turn = { playerSlot: -1, time: Date.now() };
    GSS.change([
      {
        type: 'update-element',
        element: { uuid: el.uuid, turnsLog: [...el.turnsLog, turn] },
      },
      {
        type: 'add-log',
        log: {
          type: 'turn',
          message: 'turns paused',
        },
      },
    ]);
  }

  $: turnMarkerTopPos =
    visibleActivePlayerIndex !== null && visibleActivePlayerIndex !== -1
      ? visibleActivePlayerIndex * 2.5
      : null;
  let turnsTime: number[] = [];
  let timerTick = 1;
  $: {
    timerTick;
    const now = Date.now();
    let nextSecondIn = 0;

    turnsTime = el.turnsLog.reduce<number[]>((acc, current, i) => {
      const next = el.turnsLog[i + 1];
      if (!acc[current.playerSlot]) acc[current.playerSlot] = 0;
      if (next) {
        acc[current.playerSlot] = acc[current.playerSlot] + next.time - current.time;
      } else {
        acc[current.playerSlot] = acc[current.playerSlot] + now - current.time;
        nextSecondIn = 1000 - (acc[current.playerSlot] % 1000);
      }
      return acc;
    }, []);

    if (nextSecondIn > 0 && !isPaused && el.showTimers) {
      setTimeout(() => {
        timerTick++;
      }, nextSecondIn);
    }
  }

  let showLog = false;
  function handleToggleLog(ev: MouseEvent) {
    ev.stopPropagation();
    showLog = !showLog;
  }

  const stop = (ev: MouseEvent) => ev.stopPropagation();
</script>

<div class="relative h-full w-full bg-blue-100 b-4 b-b-6 b-black/20 rounded-lg p2 flex flex-col">
  {#if el.turnsLog.length > 0}
    <button
      class="absolute -top-2 -left-2 text-xs bg-gray-200 hover:bg-gray-100 rounded-full h6 w6 z-30 flexcc b b-black/10"
      on:mousedown={stop}
      on:click={handleToggleLog}><RectangleListIcon /></button
    >
  {/if}
  {#if showLog}
    <TurnsLog
      class="absolute top-3 left-1 z-110 w-50"
      style={`max-height: ${el.height}px;`}
      playersSlots={$GS.playersSlots}
      turnsLog={el.turnsLog}
    />
  {/if}
  {#if isPaused}
    <div
      class="absolute text-xs bg-orange-300 text-white -top-4 uppercase rounded-md p1 left-1/2 transform -translate-x-1/2 shadow-md b-2 b-black/10"
      >Timer paused</div
    >
  {/if}
  <div class="relative flex-grow flex flex-col">
    {#each playersSlots as playerSlot, i}
      {#if el.showEmptyPlayersSlots || playerSlot.pubKey}
        <div class="flexcs relative h10">
          <PlayerIcon
            slot={i}
            size={32}
            class="mr2"
            color={playerSlot.color}
            pubKey={playerSlot.pubKey}
          />
          <!-- <div
            class="h8 w8 relative rounded-full flexcc mr2 b-2 b-black/10"
            style={`background-color: ${playerSlot.color};`}
          >
            {#if playerSlot.pubKey}
              <AgentAvatar class="relative z-20" pubKey={playerSlot.pubKey} size={24} />
            {/if}
            <div
              class="text-lg absolute z-10 inset-0 flexcc mix-blend-difference text-white/50 mt.5"
              >{i + 1}</div
            >
          </div> -->

          {#if playerSlot.pubKey}
            <AgentName pubKey={playerSlot.pubKey} class="flex-grow" />
          {:else}
            <div class="flex-grow">Player {i + 1}</div>
          {/if}

          {#if el.showTimers}
            <div
              class="ml2 flex-shrink-0 w12 h6 b b-black/10 bg-white rounded-md font-mono text-xs flexcc"
            >
              {formatTime(turnsTime[i] || 0)}
            </div>
          {/if}
        </div>
      {/if}
    {/each}
    {#if turnMarkerTopPos !== null}
      <div
        class="absolute z-20 h10 w10 -left-6 top-0 flexcc text-blue-400 text-3xl drop-shadow-md transition-transform"
        style={`transform: translateY(${turnMarkerTopPos}rem)`}
      >
        {#if isPaused}
          <div class="text-lg rounded-full bg-orange-300 w8 h8 flexcc text-white relative right-2">
            <PauseIcon />
          </div>
        {:else}
          <PlayIcon />
        {/if}
      </div>
    {/if}
  </div>
  {#if !currentTurn}
    <button
      on:click={handleStart}
      on:mousedown={stop}
      class="w-full h10 flexcc bg-blue-400 hover:bg-blue-300 rounded-md disabled:(saturate-0 hover:bg-blue-400) text-white uppercase tracking-wider b b-black/10"
      disabled={!playMode}
    >
      {playMode ? 'Start' : '...'}
    </button>
  {:else}
    <div class="flex space-x-2">
      <button
        on:click={handleNextTurn}
        on:mousedown={stop}
        disabled={(!isPlayerTurn && !isPaused) || !playMode}
        class="flex-grow w-full h10 flexcc bg-blue-400 hover:bg-blue-300 rounded-md disabled:(saturate-0 hover:bg-blue-400) text-white uppercase tracking-wider b b-black/10"
      >
        {isPaused ? 'Continue' : isPlayerTurn ? 'End turn' : '...'}
      </button>
      {#if el.showTimers}
        <button
          on:click={handlePauseTurn}
          on:mousedown={stop}
          disabled={!canPauseGame || !playMode}
          class="h10 w10 flex-shrink-0 flexcc bg-blue-400 hover:bg-blue-300 disabled:(saturate-0 hover:bg-blue-400) text-white rounded-md b b-black/10"
        >
          <PauseIcon />
        </button>
      {/if}
    </div>
  {/if}
</div>
