<script lang="ts">
  import cx from 'classnames';
  import PlayerIcon from '~icons/fa6-solid/user';
  import Portal from 'svelte-portal';
  import { v1 as uuidv1 } from 'uuid';

  import { type GameSpaceSyn } from '~/store';

  import { Element as PlayerPieceEl, type ElType as PlayerPieceType } from '../PlayerPiece';
  import type { PlayerPieceSourceElement } from './type';

  export let gameSpace: GameSpaceSyn;
  export let el: PlayerPieceSourceElement;
  let klass: string = '';
  export { klass as class };

  $: state = gameSpace.state;
  $: elements = $state.elements;

  // Overlap pieces to fit container width
  let piecesContainer: HTMLDivElement[] = [];
  let timeout: NodeJS.Timeout;
  $: {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      let overlapPieces = 0;
      if (el.limit < 2) {
        overlapPieces = 0;
      } else {
        if (el.width && el.height) {
          piecesContainer.forEach((el) => {
            if (el) {
              el.style.setProperty('--overlap', 0 + 'px');
            }
          });
          // Makes it reactive to the size of the container
          if (piecesContainer[0]) {
            const ref = piecesContainer[0];
            const scrollWidth = ref.scrollWidth;
            const width = ref.clientWidth;
            const diff = scrollWidth - width;
            if (diff > 0) {
              overlapPieces = diff / (el.limit - 1);
            }
          }
        }
      }
      piecesContainer.forEach((el) => {
        if (el) {
          el.style.setProperty('--overlap', -overlapPieces + 'px');
        }
      });
    }, 50);
  }

  $: everythingEmpty = el.showEmptyPlayersSlots
    ? false
    : $state.playersSlots.filter((slot) => slot.pubKey).length === 0;
</script>

<div class={cx(klass, 'size-full rounded-lg')}>
  <div class={cx(klass, 'relative size-full bg-cyan-5 rounded-lg py2 px1 overflow-hidden')}>
    <div
      class={cx(`w-full h-full grid gap-x-1 overflow-hidden`, {
        'grid-cols-[auto_1fr]': el.showNames,
        'grid-cols-1': !el.showNames,
      })}
    >
      {#each $state.playersSlots as playerSlot, i}
        {#if el.showNames}
          <div class="flex-grow h-full flexcc w12 p1">
            <div class="bg-white/40 size-full flex-grow rounded-lg"></div>
          </div>
        {/if}
        <div class={cx('flexcs min-w-0 overflow-hidden')} bind:this={piecesContainer[i]}>
          <div class="flex">
            {#each { length: el.limit || 1 } as _, j}
              <div
                class="block mr.5 last:mr0 relative w8 h8 rounded-full bg-white flexcc"
                style={(j > 0 ? `margin-left: var(--overlap);` : '') + `z-index: ${10 + j}`}
              >
                <PlayerIcon class="" />
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
