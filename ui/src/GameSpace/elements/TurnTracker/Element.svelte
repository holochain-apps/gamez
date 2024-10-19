<script lang="ts">
  import PlayIcon from '~icons/fa6-solid/play';
  import PauseIcon from '~icons/fa6-solid/pause';
  import AgentAvatar from '~/shared/AgentAvatar.svelte';
  import { type GameSpaceSyn } from '../../store/GameSpaceSyn';
  import type { TurnTrackerElement, TurnStarted } from './type';
  import PlayerName from '~/shared/PlayerName.svelte';

  export let el: TurnTrackerElement;
  export let gameSpace: GameSpaceSyn;
  $: state = gameSpace.state;
  $: players = $state.players;

  let currentTurn: TurnStarted | null = null;
  let activePlayer: string | null;
  $: {
    if (!el.turnsLog.length) {
      activePlayer = null;
      currentTurn = null;
    } else {
      currentTurn = el.turnsLog[el.turnsLog.length - 1];
      if (currentTurn.player) {
        activePlayer = currentTurn.player;
      } else {
        // Paused game
        const previousTurn = el.turnsLog[el.turnsLog.length - 2];
        activePlayer = previousTurn.player;
      }
    }
  }
  $: isPlayerTurn = activePlayer === gameSpace.pubKeyB64;
  $: isPlaying = $state.players.indexOf(gameSpace.pubKeyB64) !== -1;
  $: isPaused = currentTurn && !currentTurn.player;
  $: canPauseGame = isPlayerTurn && !isPaused;

  function handleStart() {
    const turn = { player: gameSpace.pubKeyB64, time: Date.now() };
    gameSpace.change({ type: 'update-element', element: { uuid: el.uuid, turnsLog: [turn] } });
  }

  function handleNextTurn() {
    let nextPlayer: string;
    if (isPaused) {
      // Game is paused
      // Pick previous player for next turn
      nextPlayer = activePlayer;
    } else {
      const playerIndex = $state.players.indexOf(activePlayer);
      nextPlayer = $state.players[(playerIndex + 1) % $state.players.length];
    }

    const turn = { player: nextPlayer, time: Date.now() };
    gameSpace.change({
      type: 'update-element',
      element: { uuid: el.uuid, turnsLog: [...el.turnsLog, turn] },
    });
  }

  function handlePauseTurn() {
    if (!canPauseGame) return;
    const turn = { player: null, time: Date.now() };
    gameSpace.change({
      type: 'update-element',
      element: { uuid: el.uuid, turnsLog: [...el.turnsLog, turn] },
    });
  }

  $: turnMarkerTopPos = activePlayer ? players.indexOf(activePlayer) * 2.5 : null;
  let turnsTime: { [key: string]: number } = {};
  let timerTick = 1;
  $: {
    timerTick;
    const now = Date.now();
    let nextSecondIn = 0;

    turnsTime = el.turnsLog.reduce<{ [key: string]: number }>((acc, current, i) => {
      const next = el.turnsLog[i + 1];
      if (!acc[current.player]) acc[current.player] = 0;
      if (next) {
        acc[current.player] = acc[current.player] + next.time - current.time;
      } else {
        acc[current.player] = acc[current.player] + now - current.time;
        nextSecondIn = 1000 - (acc[current.player] % 1000);
      }
      return acc;
    }, {});

    if (nextSecondIn > 0 && !isPaused) {
      setTimeout(() => {
        timerTick++;
      }, nextSecondIn);
    }
  }

  function formatTime(time: number) {
    const minutes = Math.floor(time / 1000 / 60);
    const seconds = Math.floor((time / 1000) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
</script>

<div class="relative h-full w-full bg-blue-100 b-4 b-b-6 b-black/20 rounded-lg p2 flex flex-col">
  {#if isPaused}
    <div
      class="absolute text-xs bg-orange-300 text-white -top-4 uppercase rounded-md p1 left-1/2 transform -translate-x-1/2 shadow-md b-2 b-black/10"
      >Timer paused</div
    >
  {/if}
  <div class="relative flex-grow flex flex-col">
    {#each players as player}
      <div class="flexcs relative h10">
        <AgentAvatar pubKey={player} size={28} class="mr2" />
        <PlayerName agentPubKey={player} class="flex-grow" />
        <div
          class="ml2 flex-shrink-0 w12 h6 b b-black/10 bg-white rounded-md font-mono text-xs flexcc"
        >
          {formatTime(turnsTime[player] || 0)}
        </div>
      </div>
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
      class="w-full h10 flexcc bg-blue-400 hover:bg-blue-300 rounded-md disabled:(saturate-0 hover:bg-blue-400) text-white uppercase tracking-wider b b-black/10"
      disabled={!isPlaying}
    >
      {isPlaying ? 'Start' : '...'}
    </button>
  {:else}
    <div class="flex space-x-2">
      <button
        on:click={handleNextTurn}
        disabled={!isPlayerTurn && !isPaused}
        class="flex-grow w-full h10 flexcc bg-blue-400 hover:bg-blue-300 rounded-md disabled:(saturate-0 hover:bg-blue-400) text-white uppercase tracking-wider b b-black/10"
      >
        {isPaused ? 'Continue' : isPlayerTurn ? 'End turn' : '...'}
      </button>
      <button
        on:click={handlePauseTurn}
        disabled={!canPauseGame}
        class="h10 w10 flex-shrink-0 flexcc bg-blue-400 hover:bg-blue-300 disabled:(saturate-0 hover:bg-blue-400) text-white rounded-md b b-black/10"
      >
        <PauseIcon />
      </button>
    </div>
  {/if}
</div>
