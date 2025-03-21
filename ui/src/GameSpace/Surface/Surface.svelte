<script lang="ts">
  import cx from 'classnames';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { DEFAULT_CAN_CONFIG, containingBox, type GElement, type GameSpaceSyn } from '~/store';
  import Element from '../Element';
  import Grid from '../Grid.svelte';
  import ResizeHandles, { type BoxResizeHandles } from '../ResizeHandles.svelte';
  import { waitUntilWidthAndHeight } from '~/lib/util';
  import SpaceBox from '../SpaceBox.svelte';
  import { resizeBox } from '~/lib/resizeBox';

  export let gameSpace: GameSpaceSyn;
  export let elements: GElement[];
  export let onRotateElement = (id: string, rotation: number) => {};
  export let onResizeElement = (id: string, width: number, height: number) => {};
  export let onMoveElement = (id: string, x: number, y: number) => {};
  export let onContextMenu = (id: string, posX: number, posY: number) => {};
  export let canOpenConfigMenu: boolean;

  type Box = { x: number; y: number; w: number; h: number; rotation?: number };
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
        type: 'resizing';
        fromElement: string;
        fromHandle: BoxResizeHandles;
        startViewport: { x: number; y: number };
        endViewport: { x: number; y: number };
        expandSymetrically: boolean;
        keepAspectRatio: boolean;
      }
    | {
        type: 'fromElement';
        moved: boolean;
        fromElement: string;
        viewportOffset: { x: number; y: number };
        spaceOffset: { x: number; y: number };
      };

  const maxZoom = 4; // x4 the original size
  const minZoom = 0.5;
  const zoomStep = 0.001; // % zoomed for each deltaY

  // ███████╗████████╗ █████╗ ████████╗███████╗
  // ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝
  // ███████╗   ██║   ███████║   ██║   █████╗
  // ╚════██║   ██║   ██╔══██║   ██║   ██╔══╝
  // ███████║   ██║   ██║  ██║   ██║   ███████╗
  // ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝

  let canvasVp: { x: number; y: number; w: number; h: number };
  let selectedElements = new Set<string>();
  let boardContainer: HTMLDivElement;
  let ui = get(gameSpace.ui);
  let zoom = ui.zoom; // From 1 to maxZoom
  let panX = ui.panX;
  let panY = ui.panY;
  let mouse: { x: number; y: number } = { x: 0, y: 0 };
  let nDragState: NDragState = { type: 'none' };

  // Minimally derived

  $: state = gameSpace.state;
  $: editMode = gameSpace.editMode;

  $: vp = { panX, panY, zoom };
  $: elementsByUuid = new Map<string, GElement>(elements.map((el) => [el.uuid, el]));
  $: cans = new Map<string, typeof DEFAULT_CAN_CONFIG>(elements.map((el) => [el.uuid, getCan(el)]));

  $: elementsBoxes = elements.map((el) => ({
    x: el.x,
    y: el.y,
    w: el.width,
    h: el.height,
  }));
  // $: permissions = gameSpace.permissions;
  // $: everythingLocked = !$permissions.canEditComponents;

  // EFFECTS

  $: {
    gameSpace.ui.set({ zoom, panX, panY, surfaceContainer: boardContainer });
  }

  //  █████╗  ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
  // ██╔══██╗██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
  // ███████║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
  // ██╔══██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
  // ██║  ██║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
  // ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

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

  function handleMouseDown(
    ev: MouseEvent,
    ...cmd:
      | ['el', uuid: string]
      | ['surface']
      | ['elResizeHandle', uuid: string, handle: BoxResizeHandles]
  ) {
    console.log('MOUSE DOWN', ev, cmd);
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
        } else if (ev.button === 1 && $editMode) {
          nDragState = { type: 'panning', panned: false };
        }
        break;
      }
      case 'el': {
        const el = elementsByUuid.get(cmd[1]);
        const can = getCan(el);
        if (ev.button === 2) {
          ev.stopPropagation();
          onContextMenu(cmd[1], ev.clientX, ev.clientY);
        } else if (ev.button === 0) {
          if (ev.shiftKey) {
            // Add to selection
            ev.stopPropagation();
            selectionCmd('add', cmd[1]);
          } else {
            if (!selectedElements.has(cmd[1])) {
              // There is a selection, but this element is not selected
              selectionCmd('clear');
            }
            if ($editMode || can.move) {
              // Start dragging selection or just this one element
              ev.stopPropagation();
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
        break;
      }
      case 'elResizeHandle': {
        if (ev.button === 0) {
          ev.stopPropagation();
          const el = elementsByUuid.get(cmd[1]);
          nDragState = {
            type: 'resizing',
            fromElement: cmd[1],
            fromHandle: cmd[2],
            startViewport: clientToViewport({ x: ev.clientX, y: ev.clientY }),
            endViewport: clientToViewport({ x: ev.clientX, y: ev.clientY }),
            expandSymetrically: ev.metaKey,
            keepAspectRatio: ev.shiftKey,
          };
        }
        break;
      }
    }
  }

  function handleMouseMove(ev: MouseEvent, ...cmd: ['surface']) {
    mouse = viewportToSpace(clientToViewport({ x: ev.clientX, y: ev.clientY }));
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
      case 'resizing': {
        nDragState.endViewport = clientToViewport({ x: ev.clientX, y: ev.clientY });
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
        } else if (selectedElements.size > 0) {
          const uuids = selectedElements.values().toArray();
          const toMove = $editMode ? uuids : uuids.filter((uuid) => cans.get(uuid).move);
          gameSpace.change({
            type: 'move-elements',
            uuids: toMove,
            offset: nDragState.spaceOffset,
          });
        } else {
          gameSpace.change({
            type: 'move-element',
            uuid: nDragState.fromElement,
            offset: nDragState.spaceOffset,
          });
        }
        break;
      }

      case 'resizing': {
        const el = elementsByUuid.get(nDragState.fromElement);
        gameSpace.change({
          type: 'update-element',
          element: {
            ...el,
            width: resolvedResizeSpaceBox.w,
            height: resolvedResizeSpaceBox.h,
            x: resolvedResizeSpaceBox.x,
            y: resolvedResizeSpaceBox.y,
          },
        });
        break;
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
      const screenPos = clientToViewport({ x: ev.clientX, y: ev.clientY });
      panX += (screenPos.x * zoomDelta) / zoom;
      panY += (screenPos.y * zoomDelta) / zoom;
    }
  }

  function handleKeydown(ev: KeyboardEvent) {
    console.log(ev);
    if (ev.key === 'Escape') {
      selectionCmd('clear');
    } else if (ev.key === 'Shift' && nDragState.type === 'resizing') {
      nDragState.keepAspectRatio = true;
    } else if (ev.key === 'Alt' && nDragState.type === 'resizing') {
      nDragState.expandSymetrically = true;
    } else if (ev.key === 'Delete' || ev.key === 'Backspace') {
      if (selectedElements.size > 0) {
        const uuids = selectedElements.values().toArray();

        const toRemove = $editMode ? uuids : uuids.filter((uuid) => cans.get(uuid).remove);
        selectionCmd('clear');
        gameSpace.change({ type: 'remove-elements', uuids: toRemove });
      }
    }
    // if (ev.keyCode === 'Esc')
  }

  function handleKeyup(ev: KeyboardEvent) {
    if (ev.key === 'Shift' && nDragState.type === 'resizing') {
      nDragState.keepAspectRatio = false;
    } else if (ev.key === 'Alt' && nDragState.type === 'resizing') {
      nDragState.expandSymetrically = false;
    }
  }

  let firstCentered = false;
  onMount(() => {
    function centerBoard() {
      waitUntilWidthAndHeight(boardContainer, (width, height, left, top) => {
        canvasVp = { w: width, h: height, x: left, y: top };
        if (!$editMode || !firstCentered) {
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
          firstCentered = true;
        }
      });
    }

    centerBoard();

    // Observe container for size changes
    const observer = new ResizeObserver(centerBoard);
    observer.observe(boardContainer);

    return () => {
      observer.disconnect();
    };
  });

  // function handleElementResized(id: string, width: number, height: number) {
  //   onResizeElement(id, width, height);
  // }

  // function handleElementRotated(id: string, rotation: number) {
  //   onRotateElement(id, rotation);
  // }

  // ██████╗ ███████╗███████╗ ██████╗ ██╗    ██╗   ██╗███████╗██████╗
  // ██╔══██╗██╔════╝██╔════╝██╔═══██╗██║    ██║   ██║██╔════╝██╔══██╗
  // ██████╔╝█████╗  ███████╗██║   ██║██║    ██║   ██║█████╗  ██║  ██║
  // ██╔══██╗██╔══╝  ╚════██║██║   ██║██║    ╚██╗ ██╔╝██╔══╝  ██║  ██║
  // ██║  ██║███████╗███████║╚██████╔╝███████╗╚████╔╝ ███████╗██████╔╝
  // ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚══════╝ ╚═══╝  ╚══════╝╚═════╝
  // Very derived stuff that creates new ephemeral elements by mixing in drag states

  $: resolvedResizeSpaceBox =
    nDragState.type === 'resizing'
      ? resizeBox(
          elementToSpaceBox(elementsByUuid.get(nDragState.fromElement)),
          nDragState.fromHandle,
          viewportToSpace(nDragState.startViewport),
          viewportToSpace(nDragState.endViewport),
          {
            expandSymmetrically: nDragState.expandSymetrically,
            keepAspectRatio: nDragState.keepAspectRatio,
          },
        )
      : null;

  $: resolvedSelection =
    nDragState.type === 'selecting'
      ? new Set([...nDragState.touchedElements, ...selectedElements])
      : selectedElements;

  // $: resolvedSelectionBoxesWithDragOffset = resolvedSelectionBoxes.map((v) =>
  //   nDragState.type === 'fromElement' && selectedElements.has(v.uuid)
  //     ? {
  //         uuid: v.uuid,
  //         spaceBox: {
  //           ...v.spaceBox,
  //           x: v.spaceBox.x + nDragState.spaceOffset.x,
  //           y: v.spaceBox.y + nDragState.spaceOffset.y,
  //         },
  //       }
  //     : v,
  // );

  $: selectedElementsThatCanBeMoved = new Set(
    selectedElements
      .values()
      .toArray()
      .filter((uuid) => cans.get(uuid).move),
  );

  $: resolvedElementsWithEphemeralTransformation = elements.map((el) =>
    nDragState.type === 'fromElement' &&
    (($editMode ? selectedElements.has(el.uuid) : selectedElementsThatCanBeMoved.has(el.uuid)) ||
      nDragState.fromElement === el.uuid)
      ? {
          ...el,
          x: el.x + nDragState.spaceOffset.x,
          y: el.y + nDragState.spaceOffset.y,
        }
      : nDragState.type === 'resizing' && nDragState.fromElement === el.uuid
        ? {
            ...el,
            x: resolvedResizeSpaceBox!.x,
            y: resolvedResizeSpaceBox!.y,
            width: resolvedResizeSpaceBox!.w,
            height: resolvedResizeSpaceBox!.h,
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

  // Coordinates transformations
  //----------------------------
  // Client = screen position
  // Viewport = container element position (left and top applied)
  // Space = virtual canvas position (pan and zoom applied)

  function clientToViewport({ x: clientX, y: clientY }: { x: number; y: number }): {
    x: number;
    y: number;
  } {
    return { x: clientX - canvasVp.x, y: clientY - canvasVp.y };
  }

  function viewportToSpace({ x, y }: { x: number; y: number }): { x: number; y: number } {
    return { x: x / zoom - panX, y: y / zoom - panY };
  }

  // function clientToSpace({ x, y }): { x: number; y: number } {
  //   return viewportToSpace(clientToViewport({ x, y }));
  // }

  function elementToSpaceBox(el: GElement): Box {
    return {
      x: el.x,
      y: el.y,
      w: el.width,
      h: el.height,
      rotation: el.rotation,
    };
  }

  // function spaceBoxToViewportBox(box: Box): Box {
  //   return {
  //     x: (box.x + panX) * zoom,
  //     y: (box.y + panY) * zoom,
  //     w: box.w * zoom,
  //     h: box.h * zoom,
  //   };
  // }

  // function viewportBoxStyle(box: Box) {
  //   return `width: ${box.w}px; height: ${box.h}px; left: ${box.x}px; top: ${box.y}px;`;
  // }

  // function elBoxStyle(el: GElement) {
  //   return `width: ${el.width}px;
  //   height: ${el.height}px;
  //   top: ${-el.height / 2}px;
  //   left: ${-el.width / 2}px;
  //   transform: translate(${el.x}px, ${el.y}px) rotate(${el.rotation}deg);`;
  // }

  function getCan(el: GElement) {
    return { ...DEFAULT_CAN_CONFIG, ...el.can };
  }
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

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
  {#each resolvedElementsWithEphemeralTransformation as element (element.uuid)}
    {@const box = elementToSpaceBox(element)}
    {@const can = getCan(element)}
    <SpaceBox
      {vp}
      {box}
      z={element.z}
      scale={true}
      onMouseDown={(e) => handleMouseDown(e, 'el', element.uuid)}
    >
      <Element {gameSpace} el={element} />
    </SpaceBox>

    {#if ($editMode || can.move || can.resize || can.rotate) && resolvedSelection.has(element.uuid)}
      <SpaceBox
        {vp}
        {box}
        z={element.z + 0.1}
        scale={false}
        onMouseDown={(e) => handleMouseDown(e, 'el', element.uuid)}
        class="group"
      >
        {#if $editMode || can.resize}
          <ResizeHandles
            onMouseDown={(ev, resizeHandle) =>
              handleMouseDown(ev, 'elResizeHandle', element.uuid, resizeHandle)}
          />
        {/if}
        {#if $editMode || can.move}
          <div
            class={cx('absolute z-40 -inset-[2px] b-dashed b-2 b-cyan-400 bg-cyan-400/30', {
              'cursor-grab': nDragState.type === 'none',
            })}
          ></div>
        {/if}
      </SpaceBox>
    {/if}
  {/each}
  {#if nDragState.type === 'selecting'}
    {@const box = nDragState.resolvedSpaceBox}
    <SpaceBox
      {vp}
      {box}
      z={100}
      scale={false}
      class="b-dashed b-2 b-cyan-400 bg-cyan-400/30 pointer-events-none!"
    />
  {/if}
  {#if import.meta.env.MODE === 'development'}
    <div class="bg-black/50 text-white rounded-tl-md absolute right-0 bottom-0 p1">
      M[{Math.floor(mouse.x)}, {Math.floor(mouse.y)}] | P[{Math.floor(panX)}, {Math.floor(panY)}] Z {Math.floor(
        zoom * 100,
      ) / 100}
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
