<script lang="ts">
  import { type GameSpaceSyn } from '~/store';

  import type { TurnTrackerElement } from './type';

  export let el: TurnTrackerElement;
  export let gameSpace: GameSpaceSyn;
  export let isLocked: boolean;
  $: state = gameSpace.state;
  $: playersSlots = $state.playersSlots;
</script>

<div class="relative h-full w-full bg-blue-100 b-4 b-b-6 b-black/20 rounded-lg p2 flex flex-col">
  <div class="relative flex-grow flex flex-col">
    {#each playersSlots as playerSlot, i}
      {#if el.showEmptyPlayersSlots || playerSlot.pubKey}
        <div class="flexcs relative h10 space-x-4">
          <div
            class={`relative flexcc rounded-full b-black/10 shadow-md w8 h8 `}
            style={`background-color: ${playerSlot.color};`}
          >
          </div>

          <div class="bg-black/10 h-5/10 flex-grow rounded-lg"></div>
          {#if el.showTimers}
            <div
              class="flex-shrink-0 w12 h6 b b-black/10 bg-white rounded-md font-mono text-xs flexcc"
            >
            </div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
  <div class="w-full h10 flexcc bg-blue-400 rounded-md b b-black/10"> </div>
</div>
