<script lang="ts">
  import PlayIcon from '~icons/fa6-solid/play';
  import AgentAvatar from '~/shared/AgentAvatar.svelte';
  import { type GameSpaceSyn } from '../../store/GameSpaceSyn';
  import type { TurnTrackerElement, TurnStarted } from './type';
  import PlayerName from '~/shared/PlayerName.svelte';

  export let el: TurnTrackerElement;
  export let gameSpace: GameSpaceSyn;
  $: state = gameSpace.state;
  $: players = $state.players;

  $: currentTurn = el.turnsLog[el.turnsLog.length - 1];
  $: isPlayerTurn = currentTurn ? currentTurn.player === gameSpace.pubKeyB64 : false;

  function handleStart() {
    const turn = { player: gameSpace.pubKeyB64, time: Date.now() };
    gameSpace.change({ type: 'update-element', element: { uuid: el.uuid, turnsLog: [turn] } });
  }

  function handleNextTurn() {
    const playerIndex = $state.players.indexOf(currentTurn.player);
    const nextPlayer = $state.players[(playerIndex + 1) % $state.players.length];

    const turn = { player: nextPlayer, time: Date.now() };
    gameSpace.change({
      type: 'update-element',
      element: { uuid: el.uuid, turnsLog: [...el.turnsLog, turn] },
    });
  }

  $: turnMarkerTopPos = currentTurn ? players.indexOf(currentTurn.player) * 2.5 : null;
  let turnsTime: { [key: string]: number } = {};
  $: {
    const now = Date.now();
    turnsTime = el.turnsLog.reduce<{ [key: string]: number }>((acc, current, i) => {
      const next = el.turnsLog[i + 1];
      if (next) {
        acc[current.player] = next.time - current.time;
      } else {
        acc[current.player] = now - current.time;
      }
      return acc;
    }, {});
  }

  function formatTime(time: number) {
    const minutes = Math.floor(time / 1000 / 60);
    const seconds = Math.floor((time / 1000) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
</script>

<div class="h-full w-full bg-blue-100 b-4 b-b-6 b-black/20 rounded-lg p2 flex flex-col">
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
        <PlayIcon />
      </div>
    {/if}
  </div>
  {#if !currentTurn}
    <button
      on:click={handleStart}
      class="w-full h10 flexcc bg-blue-400 hover:bg-blue-300 rounded-md text-white uppercase tracking-wider b b-black/10"
    >
      Start
    </button>
  {:else}
    <button
      on:click={handleNextTurn}
      disabled={!isPlayerTurn}
      class="w-full h10 flexcc bg-blue-400 hover:bg-blue-300 rounded-md disabled:(saturate-0 hover:bg-blue-400) text-white uppercase tracking-wider b b-black/10"
    >
      {isPlayerTurn ? 'End turn' : '...'}
    </button>
  {/if}
</div>
