<script lang="ts">
  import RectangleListIcon from '~icons/fa6-solid/rectangle-list';
  import { getGSS } from '~/store';
  import type { DiceElement, Roll, Die as DieType } from './type';
  import Die from './Die.svelte';
  import AgentName from '~/center/static/AgentName.svelte';
  import PlayerIcon from '~/GameSpace/center/static/PlayerIcon.svelte';
  import { cx } from '~/center/lib/util';

  export let el: DiceElement;
  const GSS = getGSS();
  $: GS = GSS.state;
  $: mode = GSS.mode;
  $: slotIndex = $GS.playersSlots.findIndex((s) => s.pubKey === GSS.pubKey);
  $: playMode = $mode === 'play';

  function handleContainerClick() {
    const rolledDice = el.dice.map((d) => ({
      faces: d.faces,
      result: Math.floor(Math.random() * d.faces + 1),
    }));
    const roll = { dice: rolledDice, playerSlot: slotIndex };
    const rolls = el.rolls.concat([roll]);
    // Optimization for snappier interface
    lastRoll = roll;
    setTimeout(() => {
      GSS.change({ type: 'update-element', element: { uuid: el.uuid, rolls } });
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
>
  <div class="absolute z-10 inset-0 rounded-md bg-[url('/noise20.png')] opacity-25"></div>
  {#if showLastRoll}
    {@const playerSlot = $GS.playersSlots[lastRoll.playerSlot]}
    {#if playerSlot}
      <div class="z-20 absolute -top-3 -left-3"
        ><PlayerIcon
          pubKey={playerSlot.pubKey}
          size={30}
          color={playerSlot.color}
          slot={lastRoll.playerSlot}
        /></div
      >
    {/if}
  {/if}
  <div class="relative z-20 h-full flex-wrap p4">
    <div
      on:mousedown={(ev) => ev.stopPropagation()}
      on:click={(ev) => playMode && handleContainerClick()}
      class={cx('size-full b b-white/0 flexcc content-center flex-wrap rounded-md', {
        'hover:(bg-white/10 b-white/10) cursor-pointer': $mode === 'play',
        'cursor-no-drop': $mode === 'view',
      })}
    >
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
  </div>
  {#if el.rolls.length > 0}
    <button
      class="absolute -top-3 left-7 text-xs bg-gray-200 hover:bg-gray-100 rounded-full h6 w6 z-30 flexcc b b-black/10"
      on:mousedown={(ev) => ev.stopPropagation()}
      on:click={handleToggleLog}><RectangleListIcon /></button
    >
  {/if}
  {#if showLog}
    <div
      class="absolute top-4 left-2 z-110 bg-gray-200 rounded-md p1 text-[8px] b b-black/10 shadow-md text-right font-mono overflow-auto whitespace-nowrap"
      on:wheel={(ev) => ev.stopPropagation()}
      style={`max-height: ${el.height}px;`}
    >
      {#each el.rolls.toReversed() as roll}
        {@const playerSlot = $GS.playersSlots[roll.playerSlot]}

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
