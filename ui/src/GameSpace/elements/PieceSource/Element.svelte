<script lang="ts">
  import { cloneDeep } from 'lodash';
  import { v1 as uuidv1 } from 'uuid';
  import cx from 'classnames';
  import { type GameSpaceSyn } from '~/store';
  import type { PieceSourceElement } from './type';
  import Piece from '../Piece/Element.svelte';
  import Portal from 'svelte-portal';

  export let el: PieceSourceElement;
  export let gameSpace: GameSpaceSyn;
  export let isLocked: boolean;

  $: ui = gameSpace.ui;
  $: zoomLevel = $ui.zoom;

  $: displayPieceEl = {
    display: el.display,
    width: el.pieceW,
    height: el.pieceH,
  };

  $: canAddPiece = (el.limit === null || el.limit > el.createdPieces.length) && !isLocked;

  async function handleAddPiece(clientX: number, clientY: number) {
    if (!canAddPiece) return;

    const { x, y } = gameSpace.getSurfaceCoordinates(clientX, clientY);
    const newEl = {
      type: 'Piece' as 'Piece',
      version: 1 as 1,
      display: cloneDeep(el.display),
      width: el.pieceW,
      height: el.pieceH,
      x,
      y,
      z: gameSpace.topZ(),
      rotation: 0,
      wals: [],
      can: {
        move: true,
        resize: false,
        rotate: false,
        attach: true,
        configurate: false,
        remove: true,
        duplicate: false,
      },
      uuid: uuidv1(),
    };
    await gameSpace.change([
      { type: 'add-element', element: newEl },
      {
        type: 'update-element',
        element: {
          uuid: el.uuid,
          createdPieces: [...el.createdPieces, newEl.uuid],
        },
      },
    ]);
  }

  let container: HTMLDivElement;

  type DragState = {
    x: number;
    y: number;
  } | null;
  let dragState: DragState = null;
  function handleMouseDown(ev: MouseEvent) {
    if (ev.button !== 0) return;
    ev.preventDefault();
    ev.stopPropagation();

    dragState = {
      x: ev.clientX,
      y: ev.clientY,
    };

    function handleMouseMoving(e: MouseEvent) {
      if (dragState) {
        dragState.x = e.clientX;
        dragState.y = e.clientY;
        // dragState = {
        //   x,
        //   y,
        // };
      }
    }

    function handleMouseUp() {
      if (dragState) {
        handleAddPiece(dragState.x, dragState.y);
        dragState = null;
      }
      window.removeEventListener('mousemove', handleMouseMoving);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    window.document.addEventListener('mousemove', handleMouseMoving);
    window.document.addEventListener('mouseup', handleMouseUp);
  }
</script>

<div class="size-full b-4 b-yellow-8 b-b-8 rounded-lg">
  <div
    class={cx('relative size-full bg-red-7 shadow-[inset_0_3px_8px_3px_#0003]  flexcc', {
      'hover:cursor-grab': canAddPiece && !dragState,
      'hover:cursor-grabbing': dragState,
      'hover:bg-red-6': canAddPiece,
    })}
    on:dragstart={(ev) => {
      console.log('DRAGGING?');
    }}
    on:mousedown={canAddPiece ? handleMouseDown : null}
  >
    <div class="absolute z-10 inset-0 rounded-md bg-[url('/noise20.png')] opacity-25"></div>
    <div class={cx('flexcc space-x-1  flex-wrap relative w-full')}>
      {#if el.limit}
        {#each { length: el.limit } as _, i}
          {@const isUsed = i >= el.limit - (el.createdPieces.length + (dragState ? 1 : 0))}
          <div
            class={cx('pointer-events-none my.5', {
              'opacity-25 saturate-0': isUsed,
            })}
          >
            <Piece
              class="relative z-20"
              style={`width: ${el.pieceW}px; height: ${el.pieceH}px;`}
              el={displayPieceEl}
            />
          </div>
        {/each}
      {:else}
        <Piece class="relative z-20 scale-200" el={displayPieceEl} />
      {/if}
    </div>
  </div>
</div>

{#if dragState}
  {@const x = dragState.x - el.pieceW / 2}
  {@const y = dragState.y - el.pieceH / 2}
  <Portal target="body">
    <div
      class="absolute z-50 top-0 left-0 cursor-grabbing"
      style={`width: ${el.pieceW}px; height: ${el.pieceH}px; transform: translate(${x}px, ${y}px)`}
    >
      <Piece class="relative z-20 " el={displayPieceEl} />
    </div>
  </Portal>
{/if}
