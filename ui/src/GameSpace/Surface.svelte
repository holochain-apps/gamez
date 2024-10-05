<script lang="ts">
  import cx from 'classnames';
  import { onMount } from 'svelte';
  import ElementWrapper from './ElementWrapper.svelte';
  import { type GElement } from './types.d';
  import { type GameSpaceSyn } from './store/GameSpaceSyn';

  export let gameSpace: GameSpaceSyn;
  export let elements: GElement[];
  export let onRotateElement = (id: string, rotation: number) => {};
  export let onResizeElement = (id: string, width: number, height: number) => {};
  export let onMoveElement = (id: string, x: number, y: number) => {};
  export let onContextMenu = (id: string, posX: number, posY: number) => {};
  // export let onAddPiece = (id: string, x: number, y: number) => {};
  export let isCreator: boolean;
  export let isSteward: boolean;
  export let isPlaying: boolean;

  $: everythingLocked = !isCreator && !isPlaying;
  $: {
    gameSpace.updateUiState({ zoom, panX, panY, surfaceContainer: boardContainer });
  }

  function handleContextMenu(ev: MouseEvent, id: string) {
    ev.preventDefault();
    onContextMenu(id, ev.clientX, ev.clientY);
  }

  export function getSurfaceCoordinates(clientX, clientY): { x: number; y: number } | null {
    const { left, top, width, height } = boardContainer.getBoundingClientRect();
    if (clientX < left || clientX > left + width || clientY < top || clientY > top + height) {
      return null;
    }
    const surfaceX = clientX - left;
    const surfaceY = clientY - top;
    return { x: surfaceX / zoom - panX, y: surfaceY / zoom - panY };
  }

  export function getCurrentCenter(): { x: number; y: number } {
    const { width, height } = boardContainer.getBoundingClientRect();
    return { x: width / 2 / zoom - panX, y: height / 2 / zoom - panY };
  }

  // ██████╗ ██████╗  █████╗  ██████╗  ██████╗ ██╗███╗   ██╗ ██████╗
  // ██╔══██╗██╔══██╗██╔══██╗██╔════╝ ██╔════╝ ██║████╗  ██║██╔════╝
  // ██║  ██║██████╔╝███████║██║  ███╗██║  ███╗██║██╔██╗ ██║██║  ███╗
  // ██║  ██║██╔══██╗██╔══██║██║   ██║██║   ██║██║██║╚██╗██║██║   ██║
  // ██████╔╝██║  ██║██║  ██║╚██████╔╝╚██████╔╝██║██║ ╚████║╚██████╔╝
  // ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝

  const EMPTY_IMAGE = new Image(1, 1);
  EMPTY_IMAGE.src =
    'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

  type DragState = null | {
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    pieceId: string;
  };
  let dragState: DragState = null;

  function handleDragStart(e: DragEvent, id: string) {
    let dragOffsetX, dragOffsetY: number;
    let dragImageZoom: number;
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: 0,
      offsetY: 0,
      pieceId: id,
    };
    dragOffsetX = dragState.offsetX / zoom;
    dragOffsetY = dragState.offsetY / zoom;
    dragImageZoom = zoom;

    e.dataTransfer.setDragImage(EMPTY_IMAGE, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (!dragState) return;
    dragState = {
      ...dragState,
      offsetX: e.clientX - dragState.startX,
      offsetY: e.clientY - dragState.startY,
    };
  }

  function handleDragDrop(e: DragEvent) {
    e.preventDefault();
    if (!dragState) {
      return;
    }

    const piece = elements.find((v) => v.uuid === dragState.pieceId);

    const newX = piece.x + dragState.offsetX / zoom;
    const newY = piece.y + dragState.offsetY / zoom;

    onMoveElement(dragState.pieceId, newX, newY);

    handleDragEnd();
  }

  function handleDragEnd() {
    dragState = null;
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
  let zoom = gameSpace.ui.zoom; // From 1 to maxZoom
  let panX = gameSpace.ui.panX;
  let panY = gameSpace.ui.panY;
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

  // --------------

  $: offsetDraggedElementPosition = (el: GElement) => {
    if (dragState && dragState.pieceId === el.uuid) {
      return {
        ...el,
        x: el.x + dragState.offsetX / zoom,
        y: el.y + dragState.offsetY / zoom,
      };
    } else {
      return el;
    }
  };

  onMount(() => {
    function centerBoard() {
      const { width, height } = boardContainer.getBoundingClientRect();
      setTimeout(() => {
        const { width, height } = boardContainer.getBoundingClientRect();
      }, 100);
      if (panX === 0 && panY === 0 && zoom === 1) {
        panX = width / 2;
        panY = height / 2;
      }
    }
    centerBoard();
    window.addEventListener('resize', centerBoard);
    return () => {
      window.removeEventListener('resize', centerBoard);
    };
  });

  function handleElementResized(id: string, width: number, height: number) {
    onResizeElement(id, width, height);
  }

  function handleElementRotated(id: string, rotation: number) {
    onRotateElement(id, rotation);
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
  on:dragover={handleDragOver}
  style={`background-position: ${panX * zoom}px ${panY * zoom}px; background-size: ${zoom * 150}px`}
>
  <div
    class="relative w-full h-full transform-origin-tl"
    style={`transform:scale(${zoom}) translate(${panX}px, ${panY}px);`}
  >
    {#each elements as element (element.uuid)}
      <ElementWrapper
        {gameSpace}
        onDragStart={(e) => handleDragStart(e, element.uuid)}
        onDragEnd={handleDragEnd}
        onDrop={handleDragDrop}
        onDragOver={handleDragOver}
        draggable={!element.lock.position && !everythingLocked}
        resizable={!element.lock.size && !everythingLocked}
        rotatable={!element.lock.rotation && !everythingLocked}
        onRotated={(rotation) => handleElementRotated(element.uuid, rotation)}
        onResized={(w, h) => handleElementResized(element.uuid, w, h)}
        el={offsetDraggedElementPosition(element)}
        onContextMenu={(ev) => handleContextMenu(ev, element.uuid)}
        zoomLevel={zoom}
      />
    {/each}
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
