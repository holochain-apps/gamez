<script lang="ts">
  import type { GameSpace } from '~/store';
  import MiniView from '~/Surface/MiniView.svelte';

  export let gameSpace: GameSpace;
  export let onClick: () => void;
</script>

<div
  on:click={onClick}
  role="button"
  tabindex="0"
  class="w-1/5 inline-block p1 cursor-pointer hocus:scale-105 transition-transform group outline-none"
>
  <div
    class="bg-white/50 rounded-md overflow-hidden b-1.5 b-black/10 group-focus:shadow-md shadow-sm"
  >
    <div class="w-full pb-[100%] relative">
      <div class="absolute inset-0 group-hover:brightness-120">
        <MiniView {gameSpace} />
      </div>
    </div>
    <div class="text-center text-xs py1 text-ellipsis w-full overflow-hidden px1">
      {gameSpace.name}
    </div>
  </div>
</div>
