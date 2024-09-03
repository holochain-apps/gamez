<script lang="ts">
  import cx from 'classnames';

  import { type Piece, PieceDef } from '~/lib/store';
  import PieceEl from './Piece.svelte';
  import { decodeHashFromBase64 } from '@holochain/client';
  import PlayerName from '~/shared/PlayerName.svelte';

  const EMPTY_IMAGE = new Image(1, 1);
  EMPTY_IMAGE.src =
    'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

  export let pieces: { [key: string]: Piece };
  export let piecesDefs: PieceDef[];
  export let bgUrl: string;
  export let bgWidth: string;
  export let bgHeight: string;
  export let playerPieces: boolean;
  export let dragPiecesEnabled: boolean = false;
  export let showPiecesSource = true;
  export let canAddPieces = true;
  export let players: string[] = [];

  export let onEditPieceAttachment: (piece: Piece) => void = () => {};
  export let onMovePiece: (pieceId: string, x: number, y: number) => void = () => {};
  export let onAddPiece: (pieceTypeId: string, x: number, y: number) => void = () => {};

  $: piecesFlat = Object.values(pieces);
  $: pieceDefsMap = piecesDefToMap(piecesDefs);

  const piecesDefToMap = (defs: Array<PieceDef>) => {
    const pieceDefs: { [key: string]: PieceDef } = {};
    defs.forEach((d) => (pieceDefs[d.id] = d));
    return pieceDefs;
  };

  // ██████╗ ██████╗  █████╗  ██████╗  ██████╗ ██╗███╗   ██╗ ██████╗
  // ██╔══██╗██╔══██╗██╔══██╗██╔════╝ ██╔════╝ ██║████╗  ██║██╔════╝
  // ██║  ██║██████╔╝███████║██║  ███╗██║  ███╗██║██╔██╗ ██║██║  ███╗
  // ██║  ██║██╔══██╗██╔══██║██║   ██║██║   ██║██║██║╚██╗██║██║   ██║
  // ██████╔╝██║  ██║██║  ██║╚██████╔╝╚██████╔╝██║██║ ╚████║╚██████╔╝
  // ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝

  let dragState:
    | null
    | {
        type: 'add';
        offsetX: number;
        offsetY: number;
        pieceTypeId: string;
      }
    | {
        type: 'move';
        offsetX: number;
        offsetY: number;
        pieceId: string;
      } = null;

  let dragImageEl: HTMLDivElement;
  const root = document.getElementById('root');
  function handleDragStart(e: DragEvent, dragType: 'add' | 'move', id: string) {
    const currentTarget = e.currentTarget as HTMLDivElement;
    const bounds = currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - bounds.left;
    const offsetY = e.clientY - bounds.top;

    let dragOffsetX, dragOffsetY: number;
    let dragImageZoom: number;
    if (dragType === 'move') {
      dragState = {
        type: 'move',
        offsetX,
        offsetY,
        pieceId: id,
      };
      dragOffsetX = dragState.offsetX / zoom;
      dragOffsetY = dragState.offsetY / zoom;
      dragImageZoom = zoom;
    } else if (dragType === 'add') {
      dragState = {
        type: 'add',
        offsetX,
        offsetY,
        pieceTypeId: id,
      };
      dragOffsetX = dragState.offsetX / zoom;
      dragOffsetY = dragState.offsetY / zoom;
      dragImageZoom = 1;
    }

    dragImageEl = currentTarget.cloneNode(true) as HTMLDivElement;
    dragImageEl.style.top = '0';
    dragImageEl.style.left = '0';
    dragImageEl.style.zIndex = '9999';
    dragImageEl.style.position = 'absolute';
    dragImageEl.style.pointerEvents = 'none';
    dragImageEl.style.transform = `translate(-${dragOffsetX + e.clientX}px, -${dragOffsetY + e.clientY}px) scale(${zoom})`;
    dragImageEl.style.transformOrigin = `${dragOffsetX}px ${dragOffsetY}px`;

    // Fixes Svelte not setting non-string custom properties on the element
    const agentAvatarEl = dragImageEl.querySelector('agent-avatar');
    // @ts-ignore
    if (agentAvatarEl) agentAvatarEl.setAttribute('size', PLAYER_PIECE_SIZE.toString());

    root.appendChild(dragImageEl);

    e.dataTransfer.setDragImage(EMPTY_IMAGE, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: DragEvent, el: 'source' | 'board') {
    e.preventDefault();
    if (!dragState) return;
    const resolvedOffsetX = dragState.offsetX / zoom;
    const resolvedOffsetY = dragState.offsetY / zoom;
    const resolvedZoom = el === 'source' ? 1 : zoom;
    dragImageEl.style.transform = `translate(${-resolvedOffsetX + e.clientX}px, ${-resolvedOffsetY + e.clientY}px) scale(${resolvedZoom})`;
    dragImageEl.style.transformOrigin = `${resolvedOffsetX}px ${resolvedOffsetY}px`;
  }

  function handleDragDrop(e: DragEvent) {
    e.preventDefault();
    if (!dragState) {
      return;
    }

    const [canvasX, canvasY] = screenToCanvasPos(e);
    const [boardX, boardY] = canvasToBoardPos([
      canvasX - dragState.offsetX,
      canvasY - dragState.offsetY,
    ]);

    if (dragState.type === 'move') {
      onMovePiece(dragState.pieceId, boardX, boardY);
    } else if (dragState.type === 'add') {
      console.log('ADding piece', dragState);
      onAddPiece(dragState.pieceTypeId, boardX, boardY);
    }

    handleDragEnd();
  }

  function handleDragEnd() {
    dragState = null;
    if (dragImageEl) {
      dragImageEl.remove();
      dragImageEl = null;
    }
  }

  // ███████╗ ██████╗  ██████╗ ███╗   ███╗     █████╗ ███╗   ██╗██████╗     ██████╗  █████╗ ███╗   ██╗
  // ╚══███╔╝██╔═══██╗██╔═══██╗████╗ ████║    ██╔══██╗████╗  ██║██╔══██╗    ██╔══██╗██╔══██╗████╗  ██║
  //   ███╔╝ ██║   ██║██║   ██║██╔████╔██║    ███████║██╔██╗ ██║██║  ██║    ██████╔╝███████║██╔██╗ ██║
  //  ███╔╝  ██║   ██║██║   ██║██║╚██╔╝██║    ██╔══██║██║╚██╗██║██║  ██║    ██╔═══╝ ██╔══██║██║╚██╗██║
  // ███████╗╚██████╔╝╚██████╔╝██║ ╚═╝ ██║    ██║  ██║██║ ╚████║██████╔╝    ██║     ██║  ██║██║ ╚████║
  // ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝     ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝

  const maxZoom = 4; // x4 the original size
  const minZoom = 0.5;
  const zoomStep = 0.001; // % zoomed for each deltaY
  let boardContainer: HTMLDivElement;
  let zoom = 1; // From 1 to maxZoom
  let panX = 0;
  let panY = 0;
  let isPanning = false;

  const handleZoomInOut = (ev: WheelEvent) => {
    ev.preventDefault();
    const prevZoom = zoom;
    zoom += ev.deltaY * zoomStep;
    if (zoom < minZoom) zoom = minZoom;
    if (zoom > maxZoom) zoom = maxZoom;
    const zoomDelta = 1 - zoom / prevZoom;
    if (zoomDelta !== 0) {
      const screenPos = screenToCanvasPos(ev);
      panX += (screenPos[0] * zoomDelta) / zoom;
      panY += (screenPos[1] * zoomDelta) / zoom;
    }
  };

  const handlePanningStart = (ev: MouseEvent) => {
    if (shouldHandlePanning(ev.target as HTMLElement)) {
      isPanning = true;
      const [panInitialX, panInitialY] = [panX, panY];
      const [panStartX, panStartY] = screenToCanvasPos(ev);

      window.document.addEventListener('mousemove', handleMouseMove);
      window.document.addEventListener('mouseup', handleMouseUp);

      function handleMouseMove(ev: MouseEvent) {
        const [currentX, currentY] = screenToCanvasPos(ev);

        const deltaX = currentX - panStartX;
        const deltaY = currentY - panStartY;

        panX = panInitialX + deltaX / zoom;
        panY = panInitialY + deltaY / zoom;
      }

      function handleMouseUp() {
        isPanning = false;
        window.document.removeEventListener('mousemove', handleMouseMove);
        window.document.removeEventListener('mouseup', handleMouseUp);
      }
    }
  };

  function shouldHandlePanning(mouseDownTarget: HTMLElement): boolean {
    if (mouseDownTarget === boardContainer) return true;

    if (mouseDownTarget.draggable) {
      return false;
    } else {
      if (mouseDownTarget.parentElement) {
        return shouldHandlePanning(mouseDownTarget.parentElement);
      } else {
        return false;
      }
    }
  }

  function screenToCanvasPos(ev: { clientX: number; clientY: number }) {
    const imgBox = boardContainer.getBoundingClientRect();
    const relativeX = ev.clientX - imgBox.left;
    const relativeY = ev.clientY - imgBox.top;
    return [relativeX, relativeY] as [number, number];
  }

  function canvasToBoardPos([x, y]: [number, number]) {
    return [x / zoom - panX, y / zoom - panY] as [number, number];
  }
</script>

{#if showPiecesSource}
  <div class="w60 pt4" on:dragover={(ev) => handleDragOver(ev, 'source')}>
    <h3 class="text-bold text-xl text-center">{canAddPieces ? 'Add Piece:' : 'Pieces:'}</h3>
    {#each piecesDefs as pieceDef}
      <div class="flexcc">
        <div class="flex-grow mr2 text-right">
          {pieceDef.name}
        </div>
        <PieceEl
          displayPiece={{ type: 'pieceDefPiece', pieceDef }}
          on:dragstart={(e) => handleDragStart(e, 'add', pieceDef.id)}
          on:dragend={handleDragEnd}
          on:drop={handleDragEnd}
          dragEnabled={canAddPieces}
        />
      </div>
    {/each}
    {#if playerPieces}
      {#each players as player, index}
        <div class="flexce">
          <div class="text-right mr2 flex-grow">
            <PlayerName agentPubKey={decodeHashFromBase64(player)} />
          </div>
          <div class="p2">
            <PieceEl
              displayPiece={{ type: 'pieceDefPlayer', id: player }}
              on:dragstart={(e) => handleDragStart(e, 'add', player)}
              on:dragend={handleDragEnd}
              on:drop={handleDragEnd}
              dragEnabled={canAddPieces}
            />
          </div>
        </div>
      {/each}
    {/if}
  </div>
{/if}

<div
  class={cx(
    `inset-content-shadow flex-grow h-full overflow-hidden
  bg-main-400  b b-black/25 relative p-0 bg-[url('/noise20.png')]`,
    {
      'rounded-md': showPiecesSource,
    },
  )}
  bind:this={boardContainer}
  on:wheel={handleZoomInOut}
  on:mousedown={handlePanningStart}
  on:drop={handleDragDrop}
  on:dragover={(ev) => handleDragOver(ev, 'board')}
  style={`${isPanning ? 'cursor: move;' : ''} background-position: ${panX}px ${panY}px;`}
>
  <!--
> -->
  <!-- <PieceAttachmentDialog {activeBoard} bind:this={pieceAttachmentDialog}></PieceAttachmentDialog> -->
  <div
    style={`
    height: 100%;
    width: 100%;
    transform:scale(${zoom}) translate(${panX}px, ${panY}px);
    transform-origin: top left;`}
  >
    {#each piecesFlat as piece}
      <PieceEl
        displayPiece={{ type: 'piece', piece }}
        pieceDefs={pieceDefsMap}
        dragEnabled={dragPiecesEnabled}
        on:dblclick={() => onEditPieceAttachment(piece)}
        on:dragstart={(e) => handleDragStart(e, 'move', piece.id)}
        on:dragend={handleDragEnd}
        on:drop={handleDragDrop}
        on:dragover={(ev) => handleDragOver(ev, 'board')}
        hidden={!!(dragState && dragState.type === 'move' && dragState.pieceId === piece.id)}
      />
    {/each}
    <img
      alt="Board"
      width={bgWidth ? `${bgWidth}px` : bgWidth}
      height={bgHeight ? `${bgHeight}px` : bgHeight}
      draggable={false}
      src={bgUrl}
      class="max-w-none block p-[80px] bg-transparent b b-transparent object-cover"
    />
  </div>
</div>

<style>
  .inset-content-shadow:before {
    content: ' ';
    position: absolute;
    inset: 0;
    z-index: 20;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }
</style>
