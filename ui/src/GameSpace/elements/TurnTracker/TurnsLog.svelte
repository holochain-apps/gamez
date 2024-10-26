<script lang="ts">
  import PlayerName from '~/shared/PlayerName.svelte';
  import { type TurnStarted } from './type';
  import { formatTime } from './utils';
  import { tooltip } from '~/shared/tooltip';

  export let style = '';
  let klass = '';
  export { klass as class };
  export let turnsLog: TurnStarted[];

  let timeTick = 1;
  $: turnsLogWithRelativeTime = turnsLog.map((turn, i) => {
    timeTick;
    const nextTurn = turnsLog[i + 1];
    if (nextTurn) {
      return { ...turn, elapsed: nextTurn.time - turn.time };
    } else {
      const elapsed = Date.now() - turn.time;
      const nextSecondIn = 1000 - (elapsed % 1000);
      setTimeout(() => {
        timeTick++;
      }, nextSecondIn || 1000);
      return { ...turn, elapsed };
    }
  });

  function formatDateInt(time: number): string {
    const date = new Date(time);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }
</script>

<div
  class={`${klass} bg-gray-200 rounded-md p1 text-[8px] b b-black/10 shadow-md text-right font-mono overflow-auto whitespace-nowrap`}
  on:wheel={(ev) => ev.stopPropagation()}
  {style}
>
  {#each turnsLogWithRelativeTime.toReversed() as turn}
    <div use:tooltip={formatDateInt(turn.time)}>
      {#if turn.player}
        <PlayerName class="font-bold" agentPubKey={turn.player} />: {formatTime(turn.elapsed)}
      {:else}
        <strong class="opacity-50">[PAUSED]</strong>: {formatTime(turn.elapsed)}
      {/if}
    </div>
  {/each}
</div>
