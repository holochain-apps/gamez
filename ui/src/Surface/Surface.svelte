<script lang="ts">
  import cx from 'classnames';
  import { DEFAULT_CAN_CONFIG, containingBox, getGSS, type GElement } from '~/store';
  import Element from '~/elements/Element.svelte';
  import { resizeObserver, waitUntilWidthAndHeight } from '~/center/lib/util';
  import { resizeBox } from '~/Surface/center/resizeBox';

  import Grid from './Grid.svelte';
  import { type BoxResizeHandles } from './center/BoxResizeHandles.d';
  import ResizeHandles from './ResizeHandles.svelte';
  import SpaceBox from './SpaceBox.svelte';
  import { rotateBox } from './center/rotateBox';

  export let onOpenElementMenu: (id: string, posX: number, posY: number) => void;

  let GSS = getGSS();

  type Box = { x: number; y: number; w: number; h: number; r: number };
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
        type: 'rotating';
        fromElement: string;
        start: { x: number; y: number };
        end: { x: number; y: number };
      }
    | {
        type: 'fromElement';
        moved: boolean;
        fromElement: string;
        selectOnly: boolean;
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

  let selectedElements = new Set<string>();
  $: vp = GSS.vp;
  let mouse: { x: number; y: number } = { x: 0, y: 0 };
  let nDragState: NDragState = { type: 'none' };
  let panned = false;

  // Minimally derived

  $: mode = GSS.mode;
  $: editMode = $mode === 'edit';
  $: playMode = $mode === 'play';

  $: {
    $mode;
    panned = false;
  }

  $: GS = GSS.state;
  $: elements = $GS.elements;
  $: elementsByUuid = new Map<string, GElement>(elements.map((el) => [el.uuid, el]));
  $: cans = new Map<string, typeof DEFAULT_CAN_CONFIG>(elements.map((el) => [el.uuid, getCan(el)]));

  $: elementsBoxes = elements.map((el) => ({
    x: el.x,
    y: el.y,
    w: el.width,
    h: el.height,
  }));

  //  █████╗  ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
  // ██╔══██╗██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
  // ███████║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
  // ██╔══██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
  // ██║  ██║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
  // ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

  function selectionCmd(
    ...cmd:
      | ['add', ...uuids: string[]]
      | ['remove', ...uuids: string[]]
      | ['clear']
      | ['set', ...uuids: string[]]
  ) {
    switch (cmd[0]) {
      case 'add':
        selectedElements = new Set([...selectedElements, ...cmd.slice(1)]);
        break;
      case 'remove':
        selectedElements = new Set(
          [...selectedElements].filter((uuid) => !cmd.slice(1).includes(uuid)),
        );
        break;
      case 'clear':
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
      | ['elRotateHandle', uuid: string]
  ) {
    switch (cmd[0]) {
      case 'surface': {
        if (ev.button === 0) {
          const startViewport = $vp.screenToContainer({ x: ev.clientX, y: ev.clientY });
          const startSpace = $vp.containerToSpace(startViewport);
          nDragState = {
            type: 'selecting',
            startViewport: startViewport,
            endViewport: startViewport,
            resolvedViewportBox: { ...startViewport, w: 0, h: 0, r: 0 },
            resolvedSpaceBox: { ...startSpace, w: 0, h: 0, r: 0 },
            touchedElements: new Set(),
          };
        } else if (ev.button === 1 && editMode) {
          nDragState = { type: 'panning', panned: false };
        }
        break;
      }
      case 'el': {
        const el = elementsByUuid.get(cmd[1]);
        const can = getCan(el);
        if (ev.button === 2) {
          ev.stopPropagation();
          onOpenElementMenu(cmd[1], ev.clientX, ev.clientY);
        } else if (ev.button === 0) {
          if (ev.shiftKey) {
            // Add to selection
            ev.stopPropagation();
            if (selectedElements.has(cmd[1])) {
              selectionCmd('remove', cmd[1]);
            } else {
              selectionCmd('add', cmd[1]);
            }
          } else {
            if (!selectedElements.has(cmd[1])) {
              // There is a selection, but this element is not selected
              selectionCmd('clear');
            }
            // Start dragging selection or just this one element
            ev.stopPropagation();
            nDragState = {
              type: 'fromElement',
              moved: false,
              selectOnly: !(editMode || (can.move && playMode)),
              fromElement: cmd[1],
              viewportOffset: { x: 0, y: 0 },
              spaceOffset: { x: 0, y: 0 },
            };
          }
        }
        break;
      }
      case 'elResizeHandle': {
        if (ev.button === 0) {
          ev.stopPropagation();
          nDragState = {
            type: 'resizing',
            fromElement: cmd[1],
            fromHandle: cmd[2],
            startViewport: $vp.screenToContainer({ x: ev.clientX, y: ev.clientY }),
            endViewport: $vp.screenToContainer({ x: ev.clientX, y: ev.clientY }),
            expandSymetrically: ev.metaKey,
            keepAspectRatio: ev.shiftKey,
          };
        }
        break;
      }
      case 'elRotateHandle': {
        if (ev.button === 0) {
          ev.stopPropagation();
          nDragState = {
            type: 'rotating',
            fromElement: cmd[1],
            start: $vp.screenToContainer({ x: ev.clientX, y: ev.clientY }),
            end: $vp.screenToContainer({ x: ev.clientX, y: ev.clientY }),
          };
        }
        break;
      }
    }
  }

  function handleMouseMove(ev: MouseEvent, ...cmd: ['surface']) {
    mouse = $vp.screenToSpace({ x: ev.clientX, y: ev.clientY });
    switch (nDragState.type) {
      case 'panning': {
        if (!nDragState.panned) {
          nDragState.panned = true;
        }
        if (!panned) {
          panned = true;
        }
        $vp.panX += ev.movementX / $vp.zoom;
        $vp.panY += ev.movementY / $vp.zoom;
        break;
      }
      case 'selecting': {
        nDragState.endViewport = $vp.screenToContainer({ x: ev.clientX, y: ev.clientY });
        nDragState.resolvedViewportBox = startEndToBox(
          nDragState.startViewport,
          nDragState.endViewport,
        );

        const startSpace = $vp.containerToSpace(nDragState.startViewport);
        const endSpace = $vp.containerToSpace(nDragState.endViewport);
        nDragState.resolvedSpaceBox = startEndToBox(startSpace, endSpace);

        nDragState.touchedElements = elementsOnBox(nDragState.resolvedSpaceBox);
        break;
      }
      case 'fromElement': {
        if (!nDragState.moved) {
          nDragState.moved = true;
        }
        if (!nDragState.selectOnly) {
          nDragState.viewportOffset.x += ev.movementX;
          nDragState.viewportOffset.y += ev.movementY;
          nDragState.spaceOffset.x += ev.movementX / $vp.zoom;
          nDragState.spaceOffset.y += ev.movementY / $vp.zoom;
        }
        break;
      }
      case 'resizing': {
        nDragState.endViewport = $vp.screenToContainer({ x: ev.clientX, y: ev.clientY });
        break;
      }
      case 'rotating': {
        nDragState.end = $vp.screenToContainer({ x: ev.clientX, y: ev.clientY });
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
        } else if (!nDragState.selectOnly && selectedElements.size > 0) {
          const uuids = selectedElements.values().toArray();
          const toMove = editMode ? uuids : uuids.filter((uuid) => cans.get(uuid).move);
          GSS.change({
            type: 'move-elements',
            uuids: toMove,
            offset: nDragState.spaceOffset,
          });
        } else {
          GSS.change({
            type: 'move-element',
            uuid: nDragState.fromElement,
            offset: nDragState.spaceOffset,
          });
        }
        break;
      }

      case 'resizing': {
        const el = elementsByUuid.get(nDragState.fromElement);
        GSS.change({
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

      case 'rotating': {
        const el = elementsByUuid.get(nDragState.fromElement);
        GSS.change({
          type: 'update-element',
          element: {
            ...el,
            rotation: resolvedRotationSpaceBox.r,
          },
        });
        break;
      }
    }
    nDragState = { type: 'none' };
  }

  function handleWheel(ev: WheelEvent) {
    if (!editMode) return;
    ev.preventDefault();
    const prevZoom = $vp.zoom;
    let newZoom = $vp.zoom;
    newZoom += ev.deltaY * zoomStep;
    if (newZoom < minZoom) newZoom = minZoom;
    if (newZoom > maxZoom) newZoom = maxZoom;
    const zoomDelta = 1 - newZoom / prevZoom;
    if (zoomDelta !== 0) {
      const containerPos = $vp.screenToContainer({ x: ev.clientX, y: ev.clientY });
      $vp.panX += (containerPos.x * zoomDelta) / newZoom;
      $vp.panY += (containerPos.y * zoomDelta) / newZoom;
    }
    $vp.zoom = newZoom;
  }

  function handleKeydown(ev: KeyboardEvent) {
    if (ev.key === 'Escape') {
      selectionCmd('clear');
    } else if (ev.key === 'Shift' && nDragState.type === 'resizing') {
      nDragState.keepAspectRatio = true;
    } else if (ev.key === 'Alt' && nDragState.type === 'resizing') {
      nDragState.expandSymetrically = true;
    } else if (ev.key === 'Delete' || ev.key === 'Backspace') {
      if (selectedElements.size > 0) {
        const uuids = selectedElements.values().toArray();

        const toRemove = editMode ? uuids : uuids.filter((uuid) => cans.get(uuid).remove);
        selectionCmd('clear');
        GSS.change({ type: 'remove-elements', uuids: toRemove });
      }
    }
  }

  function handleKeyup(ev: KeyboardEvent) {
    if (ev.key === 'Shift' && nDragState.type === 'resizing') {
      nDragState.keepAspectRatio = false;
    } else if (ev.key === 'Alt' && nDragState.type === 'resizing') {
      nDragState.expandSymetrically = false;
    }
  }

  function handleContainerResized(boardContainer: HTMLDivElement) {
    waitUntilWidthAndHeight(boardContainer, (rect) => {
      $vp.rect = rect;
      if (!editMode || !panned) {
        const {
          panX,
          panY,
          zoom,
          rect: { width, height },
        } = $vp;

        const box = containingBox(elements, 50);
        if (!box) {
          if (panX === 0 && panY === 0 && zoom === 1) {
            $vp.panX = width / 2;
            $vp.panY = height / 2;
          }
        } else {
          const wRatio = width / box.w;
          const hRatio = height / box.h;
          const newZoom = Math.min(maxZoom, wRatio, hRatio);
          const offsetX = width > box.w * newZoom ? (width / newZoom - box.w) / 2 : 0;
          const offsetY = height > box.h * newZoom ? (height / newZoom - box.h) / 2 : 0;

          $vp.zoom = newZoom;
          $vp.panX = -box.x + offsetX;
          $vp.panY = -box.y + offsetY;
        }
      }
    });
  }

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
          $vp.containerToSpace(nDragState.startViewport),
          $vp.containerToSpace(nDragState.endViewport),
          {
            expandSymmetrically: nDragState.expandSymetrically,
            keepAspectRatio: nDragState.keepAspectRatio,
          },
        )
      : null;

  $: resolvedRotationSpaceBox =
    nDragState.type === 'rotating'
      ? rotateBox(
          elementToSpaceBox(elementsByUuid.get(nDragState.fromElement)),
          $vp.containerToSpace(nDragState.start),
          $vp.containerToSpace(nDragState.end),
        )
      : null;

  $: resolvedSelection =
    nDragState.type === 'selecting'
      ? new Set([...nDragState.touchedElements, ...selectedElements])
      : selectedElements;

  $: selectedElementsThatCanBeMoved = new Set(
    selectedElements
      .values()
      .toArray()
      .filter((uuid) => cans.get(uuid).move),
  );

  $: resolvedElementsWithEphemeralTransformation = elements.map((el) =>
    nDragState.type === 'fromElement' &&
    ((editMode ? selectedElements.has(el.uuid) : selectedElementsThatCanBeMoved.has(el.uuid)) ||
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
        : nDragState.type === 'rotating' && nDragState.fromElement === el.uuid
          ? {
              ...el,
              rotation: resolvedRotationSpaceBox!.r,
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
      r: 0,
    };
  }

  function elementToSpaceBox(el: GElement): Box {
    return {
      x: el.x,
      y: el.y,
      w: el.width,
      h: el.height,
      r: el.rotation,
    };
  }

  function getCan(el: GElement) {
    return { ...DEFAULT_CAN_CONFIG, ...el.can };
  }
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div
  class={cx(
    `inset-content-shadow flex-grow h-full overflow-hidden select-none
  bg-main-400  b b-black/25 relative p-0 bg-[url('/noise20.png')]`,
    {
      'cursor-grabbing!': nDragState.type !== 'none' && nDragState.type !== 'selecting',
    },
  )}
  use:resizeObserver={handleContainerResized}
  on:wheel={handleWheel}
  on:mousedown={(ev) => handleMouseDown(ev, 'surface')}
  on:mousemove={(ev) => handleMouseMove(ev, 'surface')}
  on:mouseup={(ev) => handleMouseUp(ev, 'surface')}
  style={`background-position: ${$vp.panX * $vp.zoom}px ${$vp.panY * $vp.zoom}px; background-size: ${$vp.zoom * 150}px`}
>
  {#if $vp.rect}
    <div id="surface-portal" class="contents"></div>
    {#if editMode}
      <Grid vp={$vp} />
    {/if}
    {#each resolvedElementsWithEphemeralTransformation as element (element.uuid)}
      {@const box = elementToSpaceBox(element)}
      {@const can = getCan(element)}
      <SpaceBox {box} z={element.z} onMouseDown={(e) => handleMouseDown(e, 'el', element.uuid)}>
        <Element el={element} />
        {#if element.wals.length}
          <button
            on:mousedown={(ev) => ev.stopPropagation()}
            on:click={(ev) => onOpenElementMenu(element.uuid, ev.clientX, ev.clientY)}
            class="absolute h6 w6 z-1000 bg-red-500 -top-2 -right-2 rounded-full b b-black/10 text-white text-center"
          >
            {element.wals.length}
          </button>
        {/if}
      </SpaceBox>

      {#if resolvedSelection.has(element.uuid)}
        <SpaceBox {box} z={element.z + 0.1} scale={false} class="group">
          {#if editMode || (can.resize && playMode)}
            <ResizeHandles
              onMouseDown={(ev, resizeHandle) =>
                handleMouseDown(ev, 'elResizeHandle', element.uuid, resizeHandle)}
            />
          {/if}
          {#if editMode || (can.rotate && playMode)}
            <div class="absolute w-8 h-8 -top-8 left-50% -ml-4 flexcc">
              <div
                on:mousedown={(ev) => handleMouseDown(ev, 'elRotateHandle', element.uuid)}
                class={cx(
                  'group-hover:block b-1 b-cyan-400 hover:bg-cyan-400 bg-black/0 rounded-full w4 h4',
                  {
                    'cursor-grab hidden': nDragState.type === 'none',
                    'bg-cyan-400 cursor-grabbing block':
                      nDragState.type === 'rotating' && nDragState.fromElement === element.uuid,
                  },
                )}
              ></div>
            </div>
          {/if}
          <div
            on:mousedown={(e) => handleMouseDown(e, 'el', element.uuid)}
            class={cx('absolute z-40 -inset-[2px] b-dashed b-2 b-cyan-400 bg-cyan-400/30', {
              'cursor-grab': nDragState.type === 'fromElement' && !nDragState.selectOnly,
            })}
          ></div>
        </SpaceBox>
      {/if}
    {/each}
    {#if nDragState.type === 'selecting'}
      {@const box = nDragState.resolvedSpaceBox}
      <SpaceBox
        {box}
        z={100}
        scale={false}
        class="b-dashed b-2 b-cyan-400 bg-cyan-400/30 pointer-events-none!"
      />
    {/if}
    {#if import.meta.env.MODE === 'development'}
      <div class="bg-black/50 text-white rounded-tl-md absolute right-0 bottom-0 p1">
        M[{Math.floor(mouse.x)}, {Math.floor(mouse.y)}] | P[{Math.floor($vp.panX)}, {Math.floor(
          $vp.panY,
        )}] Z {Math.floor($vp.zoom * 100) / 100}
      </div>
    {/if}
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
