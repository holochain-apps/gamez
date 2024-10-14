<script lang="ts">
  import type { DiceElement } from './type';

  export let el: DiceElement;
  export let gameSpace: any = null;

  // $: diceSize = el.width / 3;
</script>

<div
  class="relative h-full w-full bg-green-7 b-4 b-yellow-8 b-b-8 shadow-[inset_0_3px_8px_3px_#0003] rounded-lg"
>
  <div class="absolute z-10 inset-0 rounded-md bg-[url('/noise20.png')] opacity-25"></div>
  <div class="relative z-20 flexcc content-center h-full flex-wrap">
    {#each el.dice as die}
      <div class="bg-white w12 h12 rounded-md flexcc text-xl font-black m2">
        {die.faces}
      </div>
    {/each}
  </div>
</div>
