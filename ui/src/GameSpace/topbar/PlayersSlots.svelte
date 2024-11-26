<script lang="ts">
  import cx from 'classnames';
  import FillDripIcon from '~icons/fa6-solid/fill-drip';
  import PlayerIcon from '../ui/PlayerIcon.svelte';
  import type { PlayerSlot } from '~/store/types';
  import AgentName from '~/shared/AgentName.svelte';
  import { cloneDeep } from 'lodash';
  import SimpleColorPicker from '../ui/SimpleColorPicker.svelte';

  export let playersSlots: PlayerSlot[];
  export let onChange: (playersSlots: PlayerSlot[]) => void;

  function handleMove() {}

  function handleSetSlotColor(slot: number, color: string) {
    const n = cloneDeep(playersSlots);
    n[slot].color = color;
    onChange(n);
  }
</script>

{#each playersSlots as playerSlot, slot}
  <div class="group relative">
    <PlayerIcon
      size={34}
      {slot}
      class="cursor-grab"
      color={playerSlot.color}
      pubKey={playerSlot.pubKey}
    />
    <div class="hidden group-hover:block absolute z-30 top-full left-1/2 -translate-x-1/2">
      <div class="h4 w4 b-8 b-transparent b-b-gray-100 relative left-1/2 -translate-x-1/2 -mt1.8"
      ></div>
      <div class="bg-gray-100 rounded-md p1 shadow-md">
        <SimpleColorPicker value={playerSlot.color} onChange={(v) => handleSetSlotColor(slot, v)} />
        <div class="text-center">
          {#if playerSlot.pubKey}
            <AgentName pubKey={playerSlot.pubKey} />
          {:else}
            Player {slot + 1}
          {/if}
        </div>
        {#if playerSlot.pubKey}
          <button
            class="text-xs bg-main-400 w-full rounded-md line-height-tight py1 text-white b b-black/10 hover:bg-main-500"
            >Remove<br />Player</button
          >
        {:else}
          <button
            class="text-xs bg-main-400 w-full rounded-md line-height-tight py1 text-white b b-black/10 hover:bg-main-500"
            >Join Here</button
          >
        {/if}
      </div>
    </div>
  </div>
{/each}
<div class="w-16 h-8 flex-shrink-0 flex">
  <button
    class="flexcc text-xs font-bold h-full w-1/2 bg-main-400 w-full rounded-l-md text-white b b-black/10 hover:bg-main-500"
    on:click={() => onChange(playersSlots)}>-</button
  >
  <button
    class="flexcc text-xs font-bold h-full w-1/2 bg-main-400 w-full rounded-r-md text-white b b-black/10 hover:bg-main-500"
    on:click={() => onChange(playersSlots)}>+</button
  >
</div>
