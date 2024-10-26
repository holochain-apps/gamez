<script lang="ts">
  import { cloneDeep } from 'lodash';
  import { v1 as uuidv1 } from 'uuid';
  import cx from 'classnames';
  import { type GameSpaceSyn } from '~/store';
  import type { PieceSourceElement } from './type';
  import Piece from '../Piece/Element.svelte';

  export let el: PieceSourceElement;
  export let gameSpace: GameSpaceSyn;

  $: ui = gameSpace.ui;
  $: zoomLevel = $ui.zoom;

  function stringToHashCode(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  $: genSeedRand = (seedString: string) => {
    var seed = stringToHashCode(seedString);
    return function random() {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
  };

  $: piecesPositions = (() => {
    const seedRand = genSeedRand(el.uuid);
    const radius = Math.min(el.width, el.height) / 2 - Math.max(el.pieceW, el.pieceH) / 2;
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < el.limit; i++) {
      const r = Math.floor(seedRand() * radius);
      const deg = Math.floor(seedRand() * 360);
      const x = Math.cos(deg) * r + el.width / 2;
      const y = Math.sin(deg) * r + el.height / 2;
      positions.push({ x, y });
    }
    return positions;
  })();

  $: displayPieceEl = {
    display: el.display,
    width: el.pieceW,
    height: el.pieceH,
  };

  $: canAddPiece = el.limit === null || el.limit > el.createdPieces.length;

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
      lock: {
        position: false,
        size: false,
        rotation: false,
        wals: false,
        config: true,
        remove: false,
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

  function containerPos() {
    const { top, left, width, height } = container.getBoundingClientRect();
    const center = { x: left + width / 2, y: top + height / 2 };
    const radius = Math.min(width, height) / 2;
    return { center, radius, top, left, width, height };
  }

  function isWithinContainerRadius(x: number, y: number) {
    const cPos = containerPos();
    const dx = x - cPos.center.x;
    const dy = y - cPos.center.y;
    return dx * dx + dy * dy <= cPos.radius * cPos.radius;
  }

  let container: HTMLDivElement;

  type DragState = { x: number; y: number } | null;
  let dragState: DragState = null;
  function handleDragStart(ev: DragEvent) {
    console.log('Drag starting!');
    ev.preventDefault();

    dragState = { x: ev.clientX, y: ev.clientY };

    function handleMouseMoving(e: MouseEvent) {
      if (dragState) {
        const x = e.clientX;
        const y = e.clientY;
        dragState = {
          x,
          y,
        };
      }
    }

    // Drops piece
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

  let hovering: { x: number; y: number } | null = null;
  function handleMouseMove(ev: MouseEvent) {
    if (isWithinContainerRadius(ev.clientX, ev.clientY)) {
      container.draggable = true;
      if (!hovering) {
        triggerSyntheticMouseOver(ev);
      }
      hovering = { x: ev.clientX, y: ev.clientY };
    } else {
      container.draggable = false;
      if (hovering) {
        triggerSyntheticMouseOver(ev);
      }
      hovering = null;
    }
  }

  function triggerSyntheticMouseOver(ev: MouseEvent) {
    // Create a synthetic mouse event
    const syntheticEvent = new MouseEvent('mouseover', {
      bubbles: true, // Allow event to bubble up to the parent
      cancelable: true, // Allow event to be canceled
      clientX: ev.clientX, // Set X position of the event
      clientY: ev.clientY, // Set Y position of the event
      relatedTarget: ev.target, // You can set this to whatever target is required
    });

    // Dispatch the event on the desired target (e.g., the parent)
    ev.target.dispatchEvent(syntheticEvent);
  }

  function handleMouseLeave() {
    hovering = null;
  }

  $: pieceStyle = (i: number) => {
    const isLast = i === el.limit - el.createdPieces.length - 1;
    const pos = dragState || hovering;
    if (isLast && pos) {
      const { top, left } = container.getBoundingClientRect();
      const relativeX = (pos.x - left) / zoomLevel;
      const relativeY = (pos.y - top) / zoomLevel;
      const scale = dragState ? 1.2 : 1;
      return `transform: translate(${relativeX}px, ${relativeY}px) scale(${scale})`;
    } else {
      return `transform: translate(${piecesPositions[i].x}px, ${piecesPositions[i].y}px)`;
    }
  };
</script>

<div class="w-full h-full bg-red-800 shadow-inner b-2 b-white/60 rounded-full lexcc h-full w-full">
  <div
    bind:this={container}
    class={cx('outline-none flexcc flex-wrap relative w-full h-full rounded-full', {
      'cursor-not-allowed': !canAddPiece && hovering && !dragState,
      'cursor-grab': canAddPiece && hovering && !dragState,
      'cursor-grabbing': dragState,
    })}
    draggable={true}
    on:dragstart={handleDragStart}
    on:mousemove={handleMouseMove}
    on:mouseleave={handleMouseLeave}
  >
    {#each { length: el.limit - el.createdPieces.length } as _, i}
      <div class="absolute top-0 left-0 z-20 translate-[-50%,-50%] pointer-events-none">
        <div class="transition-transform duration-100 ease-linear" style={pieceStyle(i)}>
          <Piece class="relative z-20 flexcc " el={displayPieceEl} />
        </div>
      </div>
    {/each}
    <div class="absolute z-10 flexcc inset-0 opacity-25 pointer-events-none">
      <Piece el={{ ...displayPieceEl, width: el.width * 0.8, height: el.height * 0.8 }} />
    </div>
  </div>
</div>
