<script lang="ts">
  import AgentName from '~/center/static/AgentName.svelte';
  import { type PlayerSlot } from '~/store';
  import { type TurnStarted } from './type';
  import { formatTime } from './utils';
  import { tooltip } from '~/center/lib/tooltip';

  export let style = '';
  let klass = '';
  export { klass as class };
  export let turnsLog: TurnStarted[];
  export let playersSlots: PlayerSlot[];

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
    {@const slot = playersSlots[turn.playerSlot]}
    <div use:tooltip={formatDateInt(turn.time)}>
      {#if turn.playerSlot === -1}
        <strong class="opacity-50">[PAUSED]</strong>: {formatTime(turn.elapsed)}
      {:else if slot && slot.pubKey}
        <AgentName class="font-bold" pubKey={slot.pubKey} />: {formatTime(turn.elapsed)}
      {:else}
        Player {turn.playerSlot + 1}
      {/if}
    </div>
  {/each}
</div>
