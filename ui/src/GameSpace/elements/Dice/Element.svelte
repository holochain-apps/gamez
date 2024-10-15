<script lang="ts">
  import RectangleListIcon from '~icons/fa6-solid/rectangle-list';
  import { type GameSpaceSyn } from '../../store/GameSpaceSyn';
  import type { DiceElement } from './type';
  import Die from './Die.svelte';
  import { roleNameForCellId } from '@holochain-open-dev/utils';

  export let el: DiceElement;
  export let gameSpace: GameSpaceSyn;

  function handleContainerClick() {
    const roll = el.dice.map((d) => ({
      faces: d.faces,
      result: Math.floor(Math.random() * d.faces + 1),
    }));
    const rolls = el.rolls.concat([roll]);
    // Optimization for snappier interface
    lastRoll = roll;
    setTimeout(() => {
      gameSpace.change({ type: 'update-element', element: { uuid: el.uuid, rolls } });
    }, 50);
  }

  let lastRoll: { faces: number; result?: number }[];
  $: {
    lastRoll = el.rolls[el.rolls.length - 1] || el.dice;
  }

  let showLog = true;
  function handleToggleLog(ev: MouseEvent) {
    ev.stopPropagation();
    showLog = !showLog;
  }
</script>

<div
  class="relative h-full w-full bg-green-7 b-4 b-yellow-8 b-b-8 shadow-[inset_0_3px_8px_3px_#0003] rounded-lg"
  on:click={handleContainerClick}
>
  <div class="absolute z-10 inset-0 rounded-md bg-[url('/noise20.png')] opacity-25"></div>
  <div class="relative z-20 flexcc content-center h-full flex-wrap">
    {#each lastRoll as roll}
      <Die faces={roll.faces} result={roll.result} />
    {/each}
  </div>
  <button
    class="absolute -top-2 -right-2 bg-gray-200 hover:bg-gray-100 rounded-md h8 w8 z-30 flexcc"
    on:click={handleToggleLog}><RectangleListIcon /></button
  >
  {#if showLog}
    <div
      class="absolute -top-2 right-8 z-30 bg-gray-200 rounded-md p1 text-[8px] text-right font-mono overflow-auto whitespace-nowrap"
      style={`max-height: ${el.height}px;`}
    >
      {#each el.rolls.toReversed() as roll}
        <div>
          {roll.map((r) => `${r.result}/${r.faces}`).join(', ')}
        </div>
      {/each}
    </div>
  {/if}
</div>
