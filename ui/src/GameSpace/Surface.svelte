<script lang="ts">
  import cx from 'classnames';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { DEFAULT_CAN_CONFIG, containingBox, type GElement, type GameSpaceSyn } from '~/store';
  import Element from './Element';
  import Grid from './Grid.svelte';
  import { waitUntilWidthAndHeight } from '~/lib/util';

  export let gameSpace: GameSpaceSyn;
  export let elements: GElement[];
  export let onRotateElement = (id: string, rotation: number) => {};
  export let onResizeElement = (id: string, width: number, height: number) => {};
  export let onMoveElement = (id: string, x: number, y: number) => {};
  export let onContextMenu = (id: string, posX: number, posY: number) => {};
  export let canOpenConfigMenu: boolean;

  $: state = gameSpace.state;
  $: permissions = gameSpace.permissions;
  $: everythingLocked = !$permissions.canEditComponents;
  $: {
    gameSpace.ui.set({ zoom, panX, panY, surfaceContainer: boardContainer });
  }
  $: editMode = gameSpace.editMode;

  function handleContextMenu(ev: MouseEvent, id: string) {
    ev.preventDefault();
    // if (canOpenConfigMenu) {
    onContextMenu(id, ev.clientX, ev.clientY);
    // }
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
    console.log('DRAG START!');
    if (!$permissions.canEditComponents) {
      e.preventDefault();
      return;
    }
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
    // e.preventDefault();
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
  let ui = get(gameSpace.ui);
  let zoom = ui.zoom; // From 1 to maxZoom
  let panX = ui.panX;
  let panY = ui.panY;
  let isPanning = false;

  const handleZoomInOut = (ev: WheelEvent) => {
    if (!$editMode) return;
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
    if (!$editMode) return;
    if (isPanning) return;
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
        console.log('Ending panning');
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
      // const { width, height } = boardContainer.getBoundingClientRect();
      waitUntilWidthAndHeight(boardContainer, (width, height) => {
        const box = containingBox(elements, 50);
        console.log('BOX', box, elements);
        if (!box) {
          if (panX === 0 && panY === 0 && zoom === 1) {
            panX = width / 2;
            panY = height / 2;
          }
        } else {
          const wRatio = width / box.w;
          const hRatio = height / box.h;
          zoom = Math.min(maxZoom, wRatio, hRatio);
          const offsetX = width > box.w * zoom ? (width / zoom - box.w) / 2 : 0;
          const offsetY = height > box.h * zoom ? (height / zoom - box.h) / 2 : 0;

          panX = -box.x + offsetX;
          panY = -box.y + offsetY;
        }
      });
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

  let mouseCoords: { x: number; y: number } = { x: 0, y: 0 };
  function handleUpdateCoords(ev: MouseEvent) {
    const [x, y] = canvasToBoardPos(screenToCanvasPos(ev));
    mouseCoords = { x, y };
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
  on:mousemove={handleUpdateCoords}
  style={`background-position: ${panX * zoom}px ${panY * zoom}px; background-size: ${zoom * 150}px`}
>
  {#if $state.isLibraryItem}
    <Grid {zoom} {panX} {panY} />
  {/if}
  <div
    class="relative w-full h-full transform-origin-tl"
    style={`transform:scale(${zoom}) translate(${panX}px, ${panY}px);`}
  >
    {#each elements as element (element.uuid)}
      {@const can = { ...DEFAULT_CAN_CONFIG, ...element.can }}
      <!-- Purposefully not using can.move || $editMode for draggable so that you can pan while clicking "locked" items -->
      <Element
        {gameSpace}
        dragging={dragState && dragState.pieceId === element.uuid}
        onDragStart={(e) => handleDragStart(e, element.uuid)}
        onDragEnd={handleDragEnd}
        draggable={can.move}
        resizable={can.resize || $editMode}
        rotatable={can.rotate || $editMode}
        onRotated={(rotation) => handleElementRotated(element.uuid, rotation)}
        onResized={(w, h) => handleElementResized(element.uuid, w, h)}
        el={offsetDraggedElementPosition(element)}
        onContextMenu={(ev) => handleContextMenu(ev, element.uuid)}
        zoomLevel={zoom}
      />
    {/each}
  </div>
  {#if import.meta.env.MODE === 'development'}
    <div class="bg-black/50 text-white rounded-tl-md absolute right-0 bottom-0 p1">
      M[{Math.floor(mouseCoords.x)}, {Math.floor(mouseCoords.y)}] | P[{Math.floor(panX)}, {Math.floor(
        panY,
      )}] Z {Math.floor(zoom * 100) / 100}
    </div>
  {/if}
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
