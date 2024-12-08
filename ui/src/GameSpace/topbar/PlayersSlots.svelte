<script lang="ts">
  import PlayerIcon from '../ui/PlayerIcon.svelte';
  import type { PlayerSlot } from '~/store/types';
  import AgentName from '~/shared/AgentName.svelte';
  import { cloneDeep } from 'lodash';
  import SimpleColorPicker from '../ui/SimpleColorPicker.svelte';
  import { addWindowEventListener, COLORS, EMPTY_IMAGE, wrapFns } from '~/lib/util';
  import { tooltip } from '~/shared/tooltip';

  export let pubKey: string;
  export let playersSlots: PlayerSlot[];
  export let onChange: (playersSlots: PlayerSlot[]) => void;
  export let canJoinGame: boolean;

  function handleMove(from: number, to: number) {
    if (from !== to) {
      const newPlayersSlots = cloneDeep(playersSlots);
      const fromKey = newPlayersSlots[from].pubKey;
      newPlayersSlots[from].pubKey = newPlayersSlots[to].pubKey;
      newPlayersSlots[to].pubKey = fromKey;
      onChange(newPlayersSlots);
    }
  }

  function handleSetSlotColor(slot: number, color: string) {
    const n = cloneDeep(playersSlots);
    n[slot].color = color;
    onChange(n);
  }

  function handleAddSlot() {
    const newPlayersSlots = cloneDeep(playersSlots);
    newPlayersSlots.push({ color: COLORS[0], pubKey: null });
    onChange(newPlayersSlots);
  }

  function handleRemoveSlot() {
    const newPlayersSlots = cloneDeep(playersSlots);
    newPlayersSlots.pop();
    onChange(newPlayersSlots);
  }

  function handleRemovePlayer(slot: number) {
    const newPlayersSlots = cloneDeep(playersSlots);
    newPlayersSlots[slot].pubKey = null;
    onChange(newPlayersSlots);
  }

  function handleJoinSlot(slot: number) {
    const newPlayersSlots = cloneDeep(playersSlots);
    for (let i = 0; i < newPlayersSlots.length; i++) {
      if (newPlayersSlots[i].pubKey === pubKey) {
        newPlayersSlots[i].pubKey = null;
      }
    }
    newPlayersSlots[slot].pubKey = pubKey;
    onChange(newPlayersSlots);
  }
</script>

<div class="flex space-x-2">
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
          <SimpleColorPicker
            value={playerSlot.color}
            onChange={(v) => handleSetSlotColor(slot, v)}
          />
          <div class="text-center mb1">
            {#if playerSlot.pubKey}
              <div class="flex">
                <AgentName class="flex-grow" pubKey={playerSlot.pubKey} />
                <select
                  value={slot}
                  class="outline-main-500 b b-black/10 rounded-md"
                  on:change={(ev) => handleMove(slot, +ev.currentTarget.value)}
                  use:tooltip={'Move to different slot'}
                >
                  {#each playersSlots as playerSlot, i}
                    <option value={i}>{i + 1}</option>
                  {/each}
                </select>
              </div>
            {:else}
              Player {slot + 1}
            {/if}
          </div>
          {#if canJoinGame}
            {#if playerSlot.pubKey}
              <button
                on:click={() => handleRemovePlayer(slot)}
                class="text-xs bg-main-400 w-full rounded-md line-height-tight py1 text-white b b-black/10 hover:bg-main-500"
                >Remove<br />Player</button
              >
            {:else}
              <button
                on:click={() => handleJoinSlot(slot)}
                class="text-xs bg-main-400 w-full rounded-md line-height-tight py1 text-white b b-black/10 hover:bg-main-500"
                >Join Here</button
              >
            {/if}
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>
<div class="w-16 h-8 flex-shrink-0 flex">
  <button
    class="flexcc text-xs font-bold h-full w-1/2 bg-main-400 w-full rounded-l-md text-white b b-black/10 hover:bg-main-500"
    on:click={handleRemoveSlot}>-</button
  >
  <button
    class="flexcc text-xs font-bold h-full w-1/2 bg-main-400 w-full rounded-r-md text-white b b-black/10 hover:bg-main-500"
    on:click={handleAddSlot}>+</button
  >
</div>
