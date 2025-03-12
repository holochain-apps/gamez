<script lang="ts">
  import cx from 'classnames';
  import { type GameSpaceSyn } from '~/store';
  import type { PieceSourceElement } from './type';
  import Piece from '../Piece/Element.svelte';

  export let el: PieceSourceElement;
  export let gameSpace: GameSpaceSyn;

  $: ui = gameSpace.ui;

  $: displayPieceEl = {
    display: el.display,
    width: el.pieceW,
    height: el.pieceH,
  };
</script>

<div class="size-full">
  <div class="relative size-full bg-red-7 rounded-lg flexcc">
    <div class="absolute z-10 inset-0 rounded-md bg-[url('/noise20.png')] opacity-25"></div>
    <div class={cx('flexcc space-x-1  flex-wrap relative w-full')}>
      {#if el.limit}
        {#each { length: el.limit } as _, i}
          {@const isUsed = i >= el.limit - el.createdPieces.length}
          <div
            class={cx('pointer-events-none my.5', {
              'opacity-25 saturate-0': isUsed,
            })}
          >
            <Piece class="relative z-20 " el={displayPieceEl} />
          </div>
        {/each}
      {:else}
        <Piece class="relative z-20" style="transform: scale(2);" el={displayPieceEl} />
      {/if}
    </div>
  </div>
</div>
