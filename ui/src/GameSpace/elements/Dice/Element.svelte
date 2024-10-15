<script lang="ts">
  import RectangleListIcon from '~icons/fa6-solid/rectangle-list';
  import { type GameSpaceSyn } from '../../store/GameSpaceSyn';
  import type { DiceElement } from './type';
  import Die from './Die.svelte';
  import PlayerName from '~/shared/PlayerName.svelte';

  export let el: DiceElement;
  export let gameSpace: GameSpaceSyn;

  function handleContainerClick() {
    const rolledDice = el.dice.map((d) => ({
      faces: d.faces,
      result: Math.floor(Math.random() * d.faces + 1),
    }));
    const roll = { dice: rolledDice, player: gameSpace.pubKeyB64 };
    const rolls = el.rolls.concat([roll]);
    // Optimization for snappier interface
    lastRoll = roll;
    setTimeout(() => {
      gameSpace.change({ type: 'update-element', element: { uuid: el.uuid, rolls } });
    }, 50);
  }

  let lastRoll: { dice: { faces: number; result?: number }[]; player?: string };
  $: lastRoll = el.rolls[el.rolls.length - 1] || { dice: el.dice };
  $: console.log(lastRoll);

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
  <div class="relative z-20 flexcc content-center h-full flex-wrap">
    {#each lastRoll.dice as roll}
      <Die faces={roll.faces} result={roll.result} />
    {/each}
  </div>
  {#if el.rolls.length > 0}
    <button
      class="absolute -top-2 -right-2 bg-gray-200 hover:bg-gray-100 rounded-md h8 w8 z-30 flexcc"
      on:click={handleToggleLog}><RectangleListIcon /></button
    >
  {/if}
  {#if showLog}
    <div
      class="absolute -top-2 right-8 z-30 bg-gray-200 rounded-md p1 text-[8px] text-right font-mono overflow-auto whitespace-nowrap"
      style={`max-height: ${el.height}px;`}
    >
      {#each el.rolls.toReversed() as roll}
        <div>
          {roll.dice.map((r) => `${r.result}/${r.faces}`).join(', ')}
          <PlayerName agentPubKey={roll.player} />
        </div>
      {/each}
    </div>
  {/if}
</div>
