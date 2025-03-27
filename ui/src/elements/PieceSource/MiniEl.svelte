<script lang="ts">
  import cx from 'classnames';
  import type { PieceSourceElement } from './type';
  import Piece from '../Piece/Element.svelte';

  export let el: PieceSourceElement;

  $: displayPieceEl = {
    display: el.display,
    width: el.pieceW,
    height: el.pieceH,
  };
</script>

<div class="size-full">
  <div class="relative size-full bg-red-7 b-3 b-white/30 rounded-lg flexcc">
    <div class="absolute z-10 inset-0 rounded-md bg-[url('/noise20.png')] opacity-25"></div>
    <div class={cx('flexcc space-x-1  flex-wrap relative w-full p2')}>
      {#if el.limit}
        {#each { length: el.limit } as _, i}
          {@const isUsed = i >= el.limit - el.createdPieces.length}
          <div
            class={cx('pointer-events-none my.5', {
              'opacity-25 saturate-0': isUsed,
            })}
          >
            <Piece
              style={`width: ${displayPieceEl.width}px; height: ${displayPieceEl.height}px;`}
              class="relative z-20 "
              el={displayPieceEl}
            />
          </div>
        {/each}
      {:else}
        <Piece
          style={`width: ${displayPieceEl.width * 2}px; height: ${displayPieceEl.height * 2}px;`}
          class="relative z-20"
          el={displayPieceEl}
        />
      {/if}
    </div>
  </div>
</div>
