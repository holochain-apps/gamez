<script lang="ts">
  import RectangleListIcon from '~icons/fa6-solid/rectangle-list';
  import { type GameSpaceSyn } from '~/store';
  import type { DiceElement, Roll, Die as DieType } from './type';
  import Die from './Die.svelte';
  import AgentName from '~/shared/AgentName.svelte';
  import AgentAvatar from '~/shared/AgentAvatar.svelte';

  export let el: DiceElement;
  export let gameSpace: GameSpaceSyn;
  export let isLocked: boolean;
  $: state = gameSpace.state;

  $: slotIndex = $state.playersSlots.findIndex((s) => s.pubKey === gameSpace.pubKey);
  $: playerSlot = slotIndex !== -1 ? $state.playersSlots[slotIndex] : null;
  $: canPlay = playerSlot && !isLocked;

  function handleContainerClick() {
    if (!canPlay) return;
    const rolledDice = el.dice.map((d) => ({
      faces: d.faces,
      result: Math.floor(Math.random() * d.faces + 1),
    }));
    const roll = { dice: rolledDice, playerSlot: slotIndex };
    const rolls = el.rolls.concat([roll]);
    // Optimization for snappier interface
    lastRoll = roll;
    setTimeout(() => {
      gameSpace.change({ type: 'update-element', element: { uuid: el.uuid, rolls } });
    }, 50);
  }

  let lastRoll: { dice: { faces: number; result: number }[]; playerSlot: number };
  $: lastRoll = el.rolls[el.rolls.length - 1];
  function diceChanged(rolls: Roll[], dice: DieType[]) {
    const last = rolls[rolls.length - 1];
    if (!last) return true;
    if (last.dice.length !== dice.length) return true;
    for (let i = 0; i < last.dice.length; i++) {
      if (last.dice[i].faces !== dice[i].faces) return true;
    }
    return false;
  }
  $: showLastRoll = !diceChanged(el.rolls, el.dice);

  let showLog = false;
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
  {#if showLastRoll}
    {@const playerSlot = $state.playersSlots[lastRoll.playerSlot]}
    {#if playerSlot && playerSlot.pubKey}
      <div class="z-20 absolute -top-2 -left-2"
        ><AgentAvatar pubKey={playerSlot.pubKey} size={28} /></div
      >
    {/if}
  {/if}
  <div class="relative z-20 flexcc content-center h-full flex-wrap">
    {#if showLastRoll}
      {#each lastRoll.dice as roll}
        <Die faces={roll.faces} result={roll.result} />
      {/each}
    {:else}
      {#each el.dice as die}
        <Die faces={die.faces} />
      {/each}
    {/if}
  </div>
  {#if el.rolls.length > 0}
    <button
      class="absolute -top-2 -right-2 text-xs bg-gray-200 hover:bg-gray-100 rounded-md h6 w6 z-30 flexcc b b-black/10"
      on:click={handleToggleLog}><RectangleListIcon /></button
    >
  {/if}
  {#if showLog}
    <div
      class="absolute -top-1 right-8 z-110 bg-gray-200 rounded-md p1 text-[8px] b b-black/10 shadow-md text-right font-mono overflow-auto whitespace-nowrap"
      on:wheel={(ev) => ev.stopPropagation()}
      style={`max-height: ${el.height}px;`}
    >
      {#each el.rolls.toReversed() as roll}
        {@const playerSlot = $state.playersSlots[roll.playerSlot]}

        <div>
          {#if playerSlot && playerSlot.pubKey}
            <AgentName class="font-bold" pubKey={playerSlot.pubKey} />:
          {:else}
            <span>Player {roll.playerSlot + 1}:</span>
          {/if}
          {roll.dice.map((r) => `${r.result}/${r.faces}`).join(', ')}
        </div>
      {/each}
    </div>
  {/if}
</div>
