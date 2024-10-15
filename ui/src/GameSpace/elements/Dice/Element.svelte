<script lang="ts">
  import { type GameSpaceSyn } from '../../store/GameSpaceSyn';
  import type { DiceElement } from './type';
  import Die from './Die.svelte';

  export let el: DiceElement;
  export let gameSpace: GameSpaceSyn;

  // $: diceSize = el.width / 3;
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
</div>
