<script lang="ts">
  import cx from 'classnames';
  import ElementWrapper from './ElementWrapper.svelte';
  import { type GElement } from './types.d';

  export let elements: GElement[];
  export let onMoveElement = (id: string, x: number, y: number, z: number) => {};
  // export let onAddPiece = (id: string, x: number, y: number) => {};

  let menuForId: string | null = null;
  function handleContextMenu(ev: MouseEvent, id: string) {
    ev.preventDefault();
    menuForId = id;
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
    z: number;
  };
  let dragState: DragState = null;

  function handleDragStart(e: DragEvent, id: string) {
    const piece = elements.find((v) => v.uuid === id);
    const maxZ = elements.reduce((max, el) => (el.z > max ? el.z : max), 0);
    const maxZCount = elements.filter((v) => v.z === maxZ).length;
    const shouldIncreaseZ = piece.z < maxZ || (piece.z === maxZ && maxZCount > 1);
    const newZ = shouldIncreaseZ ? maxZ + 1 : piece.z;

    let dragOffsetX, dragOffsetY: number;
    let dragImageZoom: number;
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: 0,
      offsetY: 0,
      pieceId: id,
      z: newZ,
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

    onMoveElement(dragState.pieceId, newX, newY, dragState.z);

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

  // --------------

  $: offsetDraggedElementPosition = (el: GElement) => {
    if (dragState && dragState.pieceId === el.uuid) {
      return {
        ...el,
        x: el.x + dragState.offsetX / zoom,
        y: el.y + dragState.offsetY / zoom,
        z: dragState.z,
      };
    } else {
      return el;
    }
  };
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
    {#each elements as element}
      <ElementWrapper
        onDragStart={(e) => handleDragStart(e, element.uuid)}
        onDragEnd={handleDragEnd}
        onDrop={handleDragDrop}
        onDragOver={handleDragOver}
        el={offsetDraggedElementPosition(element)}
        onContextMenu={(ev) => handleContextMenu(ev, element.uuid)}
      />
    {/each}
  </div>
  {#if menuForId}
    <div class="absolute left-0 top-0 w-40 rounded-md bg-white shadow-md b b-black/10">
      Edit piece
    </div>
  {/if}
</div>
