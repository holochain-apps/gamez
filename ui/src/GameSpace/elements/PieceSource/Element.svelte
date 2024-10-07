<script lang="ts">
  import { cloneDeep } from 'lodash';
  import { v1 as uuidv1 } from 'uuid';
  import cx from 'classnames';
  import { type GameSpaceSyn } from '../../store/GameSpaceSyn';
  import type { PieceSourceElement, PieceElement } from '../../types';
  import Piece from '../Piece/Element.svelte';

  export let el: PieceSourceElement;
  export let gameSpace: GameSpaceSyn;
  export let zoomLevel: number;

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

  function clearSourceData(
    el: PieceSourceElement,
  ): Omit<PieceSourceElement, 'version' | 'type' | 'limit' | 'createdPieces'> {
    const newEl = { ...el };

    delete newEl.limit;
    delete newEl.createdPieces;
    delete newEl.version;
    delete newEl.type;
    return newEl;
  }

  $: displayPieceEl = {
    type: 'Piece' as 'Piece',
    version: 1 as 1,
    ...clearSourceData(el),
    width: el.pieceW,
    height: el.pieceH,
  };

  $: canAddPiece = el.limit === null || el.limit > el.createdPieces.length;

  async function handleAddPiece(clientX: number, clientY: number) {
    const { x, y } = gameSpace.getSurfaceCoordinates(clientX, clientY);

    if (!canAddPiece) return;
    const newEl = {
      type: 'Piece' as 'Piece',
      version: 1 as 1,
      ...cloneDeep(clearSourceData(el)),
      width: el.pieceW,
      height: el.pieceH,
      x,
      y,
      z: gameSpace.topZ(),
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

  let container: HTMLDivElement;

  type DragState = { picked: boolean; within: boolean; x: number; y: number } | null;
  let dragState: DragState = null;
  function handleEntering(ev: MouseEvent) {
    if (!canAddPiece || dragState) return;

    const cPos = containerPos();
    const x = ev.clientX;
    const y = ev.clientY;

    dragState = { picked: false, within: isWithinContainerRadius(x, y), x, y };

    function isWithinContainerRadius(x: number, y: number) {
      const dx = x - cPos.center.x;
      const dy = y - cPos.center.y;
      return dx * dx + dy * dy <= cPos.radius * cPos.radius;
    }

    function isWithinContainer(x: number, y: number) {
      const { top, left, width, height } = cPos;
      return x >= left && x <= left + width && y >= top && y <= top + height;
    }

    function handleMouseMoving(e: MouseEvent) {
      const x = e.clientX;
      const y = e.clientY;
      const withinContainer = isWithinContainer(x, y);
      if (dragState.picked || withinContainer) {
        dragState = {
          ...dragState,
          within: withinContainer ? isWithinContainerRadius(x, y) : false,
          x,
          y,
        };
      }
    }

    // Leaves container without picking piece
    function handleMouseLeave(e: MouseEvent) {
      if (!dragState.picked) {
        cleanUpListeners();
      }
    }

    // Drops piece
    function handleMouseUp() {
      if (!dragState.within) {
        handleAddPiece(dragState.x, dragState.y);
        cleanUpListeners();
      } else {
        dragState.picked = false;
      }
    }

    // Picks up piece
    function handleMouseDown(e: MouseEvent) {
      if (dragState.within) {
        e.preventDefault();
        dragState.picked = true;
      }
    }

    function cleanUpListeners() {
      dragState = null;
      window.document.removeEventListener('mousemove', handleMouseMoving);
      window.document.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousedown', handleMouseDown);
    }

    window.document.addEventListener('mousemove', handleMouseMoving);
    window.document.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousedown', handleMouseDown);
  }

  function handleHovering(ev: MouseEvent) {
    if (!canAddPiece) return;
    // if (!dragState) dragState = { picked: false, x: ev.clientX, y: ev.clientY };
    // else dragState = { ...dragState, x: ev.clientX, y: ev.clientY };
  }

  function handlePickingStart(ev: MouseEvent) {
    // if (dragState) dragState.picked = true;
  }

  function handleMouseLeave() {
    // if (!dragState.picked) {
    //   dragState = null;
    // }
  }

  function handleDropPiece() {
    // console.log('Piece dropped', dragState);
    // dragState = null;
  }

  function pieceStyle(i: number, dragState: DragState) {
    const isLast = i === el.limit - el.createdPieces.length - 1;
    if (isLast && dragState && (dragState.within || dragState.picked)) {
      const { top, left } = container.getBoundingClientRect();
      const relativeX = (dragState.x - left) / zoomLevel;
      const relativeY = (dragState.y - top) / zoomLevel;
      const scale = dragState.picked ? 1.2 : 1;
      return `transform: translate(${relativeX}px, ${relativeY}px) scale(${scale})`;
    } else {
      return `transform: translate(${piecesPositions[i].x}px, ${piecesPositions[i].y}px)`;
    }
  }
</script>

<div class="w-full h-full bg-red-800 shadow-inner b-2 b-white/60 rounded-full flexcc h-full w-full">
  <div
    bind:this={container}
    class={cx('outline-none flexcc flex-wrap relative w-full h-full', {
      'cursor-not-allowed': !canAddPiece,
      'cursor-grab': dragState && (dragState.within || !dragState.picked) && canAddPiece,
      'cursor-grabbing': dragState && dragState.picked && canAddPiece,
    })}
    on:mouseenter={handleEntering}
    on:mousemove={handleHovering}
    on:mouseleave={handleMouseLeave}
    on:mousedown={handlePickingStart}
    on:mouseup={handleDropPiece}
  >
    {#each { length: el.limit - el.createdPieces.length } as _, i}
      <div class="absolute top-0 left-0 z-20 translate-[-50%,-50%]">
        <div class="transition-transform duration-100 ease-linear" style={pieceStyle(i, dragState)}>
          <Piece class="relative z-20 flexcc " el={displayPieceEl} />
        </div>
      </div>
    {/each}
    <div class="absolute z-10 flexcc inset-0 opacity-25">
      <Piece el={{ ...displayPieceEl, width: el.width * 0.8, height: el.height * 0.8 }} />
    </div>
  </div>
</div>
