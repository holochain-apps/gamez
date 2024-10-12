<script lang="ts">
  import cx from 'classnames';
  import AgentAvatar from '~/shared/AgentAvatar.svelte';
  import PlayerName from '~/shared/PlayerName.svelte';
  import { type GameSpaceSyn } from '../../store/GameSpaceSyn';
  import type { PlayerPieceSourceElement } from './type';

  export let gameSpace: GameSpaceSyn;
  export let el: PlayerPieceSourceElement;
  let klass: string = '';
  export { klass as class };

  let piecesContainer: HTMLDivElement;
  $: overlapPieces = 0;
  $: {
    console.log('Calculating!');
    if (el.limit < 2) {
      overlapPieces = 0;
    }

    if (el.width && el.height) {
      // Makes it reactive to the size of the container
      if (piecesContainer) {
        const scrollWidth = piecesContainer.scrollWidth;
        const { width } = piecesContainer.getBoundingClientRect();
        const diff = scrollWidth - width;
        console.log('Diff!', diff);
        if (diff > 0) {
          overlapPieces = diff / el.limit;
        }
      }
    }
  }

  $: state = gameSpace.state;

  $: playerColor = (i: number) => {
    const hue = (i / $state.players.length) * 360;
    return `hsl(${hue}, 60%, 50%)`;
  };
</script>

<div class={cx(klass, 'h-full w-full bg-main-900 rounded-md p2')}>
  <div
    class={cx(`w-full grid gap-2`, {
      'grid-cols-[auto_1fr]': el.showNames,
      'grid-cols-1': !el.showNames,
    })}
  >
    {#each $state.players as player, i}
      {#if el.showNames}
        <div class="flexce text-xs">
          <PlayerName agentPubKey={player} />
        </div>
      {/if}
      <div class="flexcs min-w-0 overflow-hidden" bind:this={piecesContainer}>
        <div class="whitespace-nowrap">
          {#each { length: el.limit } as _, j}
            <div class={`inline-block`} style={j > 0 ? `margin-left: ${-overlapPieces}px;` : ''}>
              <AgentAvatar
                class={cx({
                  'inline-block outline-solid outline-red outline-3 m[3px]': el.colorCoded,
                })}
                style={el.colorCoded ? `outline-color: ${playerColor(i)}` : ''}
                pubKey={player}
                size={el.size - (el.colorCoded ? 6 : 0)}
              />
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
