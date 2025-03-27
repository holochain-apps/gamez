<script lang="ts">
  import type { DiceElement } from './type';
  import Die from './Die.svelte';

  export let el: DiceElement;
</script>

<div class="relative h-full w-full bg-green-6 b-3 b-white/30 rounded-lg">
  <div class="relative z-20 flexcc content-center h-full flex-wrap">
    {#each el.dice as die}
      <Die faces={die.faces} />
    {/each}
  </div>
</div>
