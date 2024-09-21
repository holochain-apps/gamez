<script lang="ts">
  import cx from 'classnames';
  import ElementWrapper from './ElementWrapper.svelte';
  import { type GElement } from './types.d';

  export let elements: GElement[];
  export let onMoveElement = (id: string, x: number, y: number) => {};
  // export let onAddPiece = (id: string, x: number, y: number) => {};

  // ██████╗ ██████╗  █████╗  ██████╗  ██████╗ ██╗███╗   ██╗ ██████╗
  // ██╔══██╗██╔══██╗██╔══██╗██╔════╝ ██╔════╝ ██║████╗  ██║██╔════╝
  // ██║  ██║██████╔╝███████║██║  ███╗██║  ███╗██║██╔██╗ ██║██║  ███╗
  // ██║  ██║██╔══██╗██╔══██║██║   ██║██║   ██║██║██║╚██╗██║██║   ██║
  // ██████╔╝██║  ██║██║  ██║╚██████╔╝╚██████╔╝██║██║ ╚████║╚██████╔╝
  // ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝

  const EMPTY_IMAGE = new Image(1, 1);
  EMPTY_IMAGE.src =
    'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

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
    dragImageEl.classList.add('dragging-image');
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
      onMoveElement(dragState.pieceId, boardX, boardY);
    } else if (dragState.type === 'add') {
      console.log('ADding piece', dragState);
      // onAddPiece(dragState.pieceTypeId, boardX, boardY);
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

<div
  class={cx(
    `inset-content-shadow flex-grow h-full overflow-hidden
  bg-main-400  b b-black/25 relative p-0 bg-[url('/noise20.png')]`,
    { 'cursor-move': isPanning },
  )}
  bind:this={boardContainer}
  on:wheel={handleZoomInOut}
  on:mousedown={handlePanningStart}
  on:drop={handleDragDrop}
  on:dragover={(ev) => handleDragOver(ev, 'board')}
  style={`background-position: ${panX * zoom}px ${panY * zoom}px; background-size: ${zoom * 150}px`}
>
  <div
    style={`
  height: 100%;
  width: 100%;
  transform:scale(${zoom}) translate(${panX}px, ${panY}px);
  transform-origin: top left;`}
  >
    {#each elements as element}
      <ElementWrapper
        onDragStart={(e) => handleDragStart(e, 'move', element.uuid)}
        onDragEnd={handleDragEnd}
        onDrop={handleDragDrop}
        onDragOver={(ev) => handleDragOver(ev, 'board')}
        hidden={!!(dragState && dragState.type === 'move' && dragState.pieceId === element.uuid)}
        el={element}
      />
    {/each}
  </div>
</div>
