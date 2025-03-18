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

  let canvasVp: { x: number; y: number; w: number; h: number };
  let selectedElements = new Set<string>();

  $: elementsByUuid = new Map<string, GElement>(elements.map((el) => [el.uuid, el]));

  function selectionCmd(
    ...cmd: ['add', ...uuids: string[]] | ['clear'] | ['set', ...uuids: string[]]
  ) {
    switch (cmd[0]) {
      case 'add':
        selectedElements = new Set([...selectedElements, ...cmd.slice(1)]);
        break;
      case 'clear':
        console.log('Clearing selection');
        selectedElements = new Set();
        break;
      case 'set':
        selectedElements = new Set(cmd.slice(1));
        break;
    }
  }

  type Box = { x: number; y: number; w: number; h: number };

  $: elementsBoxes = elements.map((el) => ({
    x: el.x - el.width / 2,
    y: el.y - el.height / 2,
    w: el.width,
    h: el.height,
  }));
  $: state = gameSpace.state;
  $: permissions = gameSpace.permissions;
  $: everythingLocked = !$permissions.canEditComponents;
  $: {
    gameSpace.ui.set({ zoom, panX, panY, surfaceContainer: boardContainer });
  }
  $: editMode = gameSpace.editMode;

  $: console.log('SET', selectedElements);

  function handleContextMenu(ev: MouseEvent, id: string) {
    ev.preventDefault();
    // if (canOpenConfigMenu) {
    onContextMenu(id, ev.clientX, ev.clientY);
    // }
  }

  type NDragState =
    | { type: 'none' }
    | {
        type: 'panning';
        panned: boolean;
      }
    | {
        type: 'selecting';
        startViewport: { x: number; y: number };
        endViewport: { x: number; y: number };
        resolvedViewportBox: Box;
        resolvedSpaceBox: Box;
        touchedElements: Set<string>;
      }
    | {
        type: 'fromElement';
        moved: boolean;
        fromElement: string;
        viewportOffset: { x: number; y: number };
        spaceOffset: { x: number; y: number };
      };

  let nDragState: NDragState = { type: 'none' };

  function handleMouseDown(ev: MouseEvent, ...cmd: ['el', uuid: string] | ['surface']) {
    switch (cmd[0]) {
      case 'surface': {
        if (ev.button === 0) {
          const startViewport = clientToViewport({ x: ev.clientX, y: ev.clientY });
          const startSpace = viewportToSpace(startViewport);
          nDragState = {
            type: 'selecting',
            startViewport: startViewport,
            endViewport: startViewport,
            resolvedViewportBox: { ...startViewport, w: 0, h: 0 },
            resolvedSpaceBox: { ...startSpace, w: 0, h: 0 },
            touchedElements: new Set(),
          };
        } else if (ev.button === 1) {
          nDragState = { type: 'panning', panned: false };
        }
        break;
      }
      case 'el': {
        ev.stopPropagation();
        if (ev.shiftKey) {
          selectionCmd('add', cmd[1]);
        } else {
          nDragState = {
            type: 'fromElement',
            moved: false,
            fromElement: cmd[1],
            viewportOffset: { x: 0, y: 0 },
            spaceOffset: { x: 0, y: 0 },
          };
        }
      }
    }
  }

  function handleMouseMove(ev: MouseEvent, ...cmd: ['surface']) {
    switch (nDragState.type) {
      case 'panning': {
        if (!nDragState.panned) {
          nDragState.panned = true;
        }
        panX += ev.movementX / zoom;
        panY += ev.movementY / zoom;
        break;
      }
      case 'selecting': {
        nDragState.endViewport = clientToViewport({ x: ev.clientX, y: ev.clientY });
        nDragState.resolvedViewportBox = startEndToBox(
          nDragState.startViewport,
          nDragState.endViewport,
        );

        const startSpace = viewportToSpace(nDragState.startViewport);
        const endSpace = viewportToSpace(nDragState.endViewport);
        nDragState.resolvedSpaceBox = startEndToBox(startSpace, endSpace);

        nDragState.touchedElements = elementsOnBox(nDragState.resolvedSpaceBox);
        break;
      }
      case 'fromElement': {
        if (!nDragState.moved) {
          nDragState.moved = true;
        }
        nDragState.viewportOffset.x += ev.movementX;
        nDragState.viewportOffset.y += ev.movementY;
        nDragState.spaceOffset.x += ev.movementX / zoom;
        nDragState.spaceOffset.y += ev.movementY / zoom;
        break;
      }
    }
  }

  function handleMouseUp(ev: MouseEvent, ...cmd: ['surface']) {
    switch (nDragState.type) {
      case 'panning': {
        break;
      }
      case 'selecting': {
        if (nDragState.touchedElements.size > 0) {
          if (ev.shiftKey) {
            selectionCmd('add', ...nDragState.touchedElements);
          } else {
            selectionCmd('set', ...nDragState.touchedElements);
          }
        } else {
          selectionCmd('clear');
        }
        break;
      }

      case 'fromElement': {
        if (!nDragState.moved) {
          if (ev.shiftKey) {
            selectionCmd('add', nDragState.fromElement);
          } else {
            selectionCmd('set', nDragState.fromElement);
          }
        } else {
          gameSpace.change({
            type: 'move-elements',
            uuids: selectedElements.values().toArray(),
            offset: nDragState.spaceOffset,
          });
        }
      }
    }
    nDragState = { type: 'none' };
  }

  function handleWheel(ev: WheelEvent) {
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
  // let isPanning = false;

  // const handleZoomInOut = (ev: WheelEvent) => {
  //   if (!$editMode) return;
  //   ev.preventDefault();
  //   const prevZoom = zoom;
  //   zoom += ev.deltaY * zoomStep;
  //   if (zoom < minZoom) zoom = minZoom;
  //   if (zoom > maxZoom) zoom = maxZoom;
  //   const zoomDelta = 1 - zoom / prevZoom;
  //   if (zoomDelta !== 0) {
  //     const screenPos = screenToCanvasPos(ev);
  //     panX += (screenPos[0] * zoomDelta) / zoom;
  //     panY += (screenPos[1] * zoomDelta) / zoom;
  //   }
  // };

  // const handlePanningStart = (ev: MouseEvent) => {
  //   if (!$editMode) return;
  //   if (isPanning) return;
  //   if (shouldHandlePanning(ev.target as HTMLElement)) {
  //     isPanning = true;
  //     const [panInitialX, panInitialY] = [panX, panY];
  //     const [panStartX, panStartY] = screenToCanvasPos(ev);

  //     window.document.addEventListener('mousemove', handleMouseMove);
  //     window.document.addEventListener('mouseup', handleMouseUp);

  //     function handleMouseMove(ev: MouseEvent) {
  //       const [currentX, currentY] = screenToCanvasPos(ev);

  //       const deltaX = currentX - panStartX;
  //       const deltaY = currentY - panStartY;

  //       panX = panInitialX + deltaX / zoom;
  //       panY = panInitialY + deltaY / zoom;
  //     }

  //     function handleMouseUp() {
  //       console.log('Ending panning');
  //       isPanning = false;
  //       window.document.removeEventListener('mousemove', handleMouseMove);
  //       window.document.removeEventListener('mouseup', handleMouseUp);
  //     }
  //   }
  // };

  // function shouldHandlePanning(mouseDownTarget: HTMLElement): boolean {
  //   if (mouseDownTarget === boardContainer) return true;

  //   if (mouseDownTarget.draggable) {
  //     return false;
  //   } else {
  //     if (mouseDownTarget.parentElement) {
  //       return shouldHandlePanning(mouseDownTarget.parentElement);
  //     } else {
  //       return false;
  //     }
  //   }
  // }

  function screenToCanvasPos(ev: { clientX: number; clientY: number }) {
    const relativeX = ev.clientX - canvasVp.x;
    const relativeY = ev.clientY - canvasVp.y;
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
      waitUntilWidthAndHeight(boardContainer, (width, height, left, top) => {
        canvasVp = { w: width, h: height, x: left, y: top };
        const box = containingBox(elements, 50);
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

  $: resolvedSelection =
    nDragState.type === 'selecting'
      ? new Set([...nDragState.touchedElements, ...selectedElements])
      : selectedElements;

  $: resolvedSelectionBoxes = resolvedSelection.values().map((uuid) => {
    [zoom, panX, panY]; // Reactivity
    return {
      uuid,
      viewportBox: spaceBoxToViewportBox(elementToSpaceBox(elementsByUuid.get(uuid)!)),
    };
  });

  $: resolvedSelectionBoxesWithDragOffset = resolvedSelectionBoxes.map((v) =>
    nDragState.type === 'fromElement' && selectedElements.has(v.uuid)
      ? {
          uuid: v.uuid,
          viewportBox: {
            ...v.viewportBox,
            x: v.viewportBox.x + nDragState.viewportOffset.x,
            y: v.viewportBox.y + nDragState.viewportOffset.y,
          },
        }
      : v,
  );

  $: resolvedElementsWithDragOffset = elements.map((el) =>
    nDragState.type === 'fromElement' && selectedElements.has(el.uuid)
      ? {
          ...el,
          x: el.x + nDragState.spaceOffset.x,
          y: el.y + nDragState.spaceOffset.y,
        }
      : el,
  );

  // ██╗   ██╗████████╗██╗██╗     ███████╗
  // ██║   ██║╚══██╔══╝██║██║     ██╔════╝
  // ██║   ██║   ██║   ██║██║     ███████╗
  // ██║   ██║   ██║   ██║██║     ╚════██║
  // ╚██████╔╝   ██║   ██║███████╗███████║
  //  ╚═════╝    ╚═╝   ╚═╝╚══════╝╚══════╝

  function elementsOnBox(testBox: Box) {
    let els = new Set<string>();
    elementsBoxes.forEach((box, i) => {
      if (
        testBox.x < box.x + box.w &&
        testBox.x + testBox.w > box.x &&
        testBox.y < box.y + box.h &&
        testBox.y + testBox.h > box.y
      ) {
        els.add(elements[i].uuid);
      }
    });
    return els;
  }

  function startEndToBox(start: { x: number; y: number }, end: { x: number; y: number }) {
    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      w: Math.abs(start.x - end.x),
      h: Math.abs(start.y - end.y),
    };
  }

  // Client = screen position
  // Viewport = container element position (left and top applied)
  // Space = virtual canvas position (pan and zoom applied)

  function clientToViewport({ x: clientX, y: clientY }: { x: number; y: number }): {
    x: number;
    y: number;
  } {
    const imgBox = boardContainer.getBoundingClientRect();
    return { x: clientX - imgBox.left, y: clientY - imgBox.top };
  }

  function viewportToSpace({ x, y }: { x: number; y: number }): { x: number; y: number } {
    return { x: x / zoom - panX, y: y / zoom - panY };
  }

  function elementToSpaceBox(el: GElement): Box {
    return {
      x: el.x - el.width / 2,
      y: el.y - el.height / 2,
      w: el.width,
      h: el.height,
    };
  }

  function spaceBoxToViewportBox(box: Box): Box {
    return {
      x: (box.x + panX) * zoom,
      y: (box.y + panY) * zoom,
      w: box.w * zoom,
      h: box.h * zoom,
    };
  }

  function viewportBoxStyle(box: Box) {
    return `width: ${box.w}px; height: ${box.h}px; left: ${box.x}px; top: ${box.y}px`;
  }
</script>

<!-- on:drop={handleDragDrop} -->
<!-- on:dragover={handleDragOver} -->

<div
  class={cx(
    `inset-content-shadow flex-grow h-full overflow-hidden select-none
  bg-main-400  b b-black/25 relative p-0 bg-[url('/noise20.png')]`,
    { 'cursor-grabbing': nDragState.type !== 'none' },
  )}
  bind:this={boardContainer}
  on:wheel={handleWheel}
  on:mousedown={(ev) => handleMouseDown(ev, 'surface')}
  on:mousemove={(ev) => handleMouseMove(ev, 'surface')}
  on:mouseup={(ev) => handleMouseUp(ev, 'surface')}
  style={`background-position: ${panX * zoom}px ${panY * zoom}px; background-size: ${zoom * 150}px`}
>
  {#if $state.isLibraryItem}
    <Grid {zoom} {panX} {panY} />
  {/if}
  {#if nDragState.type === 'selecting'}
    {@const box = nDragState.resolvedViewportBox}
    <div
      class="absolute z-100 b-dashed b-2 b-cyan-400 bg-cyan-400/30 pointer-events-none"
      style={viewportBoxStyle(box)}
    ></div>
  {/if}
  {#each resolvedSelectionBoxesWithDragOffset as { uuid, viewportBox } (uuid)}
    <div
      class="absolute z-100 b-dashed b-2 b-cyan-400 bg-cyan-400/30 pointer-events-none"
      style={viewportBoxStyle(viewportBox)}
    >
    </div>
  {/each}
  <div
    class="relative w-full h-full transform-origin-tl"
    style={`transform:scale(${zoom}) translate(${panX}px, ${panY}px);`}
  >
    {#each resolvedElementsWithDragOffset as element (element.uuid)}
      {@const can = { ...DEFAULT_CAN_CONFIG, ...element.can }}
      <!-- Purposefully not using can.move || $editMode for draggable so that you can pan while clicking "locked" items -->
      <Element
        {gameSpace}
        isSelected={resolvedSelection.has(element.uuid)}
        dragging={dragState && dragState.pieceId === element.uuid}
        onMouseDown={(e) => handleMouseDown(e, 'el', element.uuid)}
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
