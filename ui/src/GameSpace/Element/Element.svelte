<script lang="ts">
  import { onMount } from 'svelte';
  import cx from 'classnames';
  import ArrowsLeftRight from '~icons/fa6-solid/arrows-left-right';
  import RotateIcon from '~icons/fa6-solid/rotate-right';
  import { tooltip } from '~/shared/tooltip';
  import type { GElement, GameSpaceSyn } from '~/store';
  import * as elements from '../elements';

  export let gameSpace: GameSpaceSyn;
  export let el: GElement;
  // export let dragging: boolean = false;
  // export let onMouseDown: (ev: MouseEvent) => void;
  // export let onDragStart: (ev: DragEvent) => void;
  // export let onDragEnd: () => void;
  // export let onContextMenu: (ev: MouseEvent) => void;
  // export let onResized: (width: number, height: number) => void;
  // export let onRotated: (rotation: number) => void;
  // export let zoomLevel: number;
  // export let isSelected: boolean;
  let klass: string = '';
  export { klass as class };

  // export let draggable: boolean;
  // export let resizable: boolean;
  // export let rotatable: boolean;

  $: permissions = gameSpace.permissions;

  // let isHovering = false;
  // let htmlEl: HTMLDivElement;

  // let isShiftPressed = false;
  // onMount(() => {
  //   function handleShiftDown(ev: KeyboardEvent) {
  //     if (ev.key === 'Shift') {
  //       isShiftPressed = true;
  //     }
  //   }
  //   function handleShiftUp(ev: KeyboardEvent) {
  //     if (ev.key === 'Shift') {
  //       isShiftPressed = false;
  //     }
  //   }
  //   window.addEventListener('keydown', handleShiftDown);
  //   window.addEventListener('keyup', handleShiftUp);
  //   return () => {
  //     window.removeEventListener('keydown', handleShiftDown);
  //     window.removeEventListener('keyup', handleShiftUp);
  //   };
  // });

  // function startHovering() {
  //   if (!$permissions.canEditComponents) return;
  //   if (!resizable && !rotatable) return;
  //   isHovering = true;
  //   function handleMouseLeave() {
  //     htmlEl.removeEventListener('mouseleave', handleMouseLeave);
  //     isHovering = false;
  //   }
  //   htmlEl.addEventListener('mouseleave', handleMouseLeave);
  // }

  // let resizingState: { startX: number; startY: number; endX: number; endY: number } | null = null;
  // function handleResizeStart(ev: MouseEvent) {
  //   ev.preventDefault();
  //   ev.stopPropagation();
  //   resizingState = {
  //     startX: ev.clientX,
  //     startY: ev.clientY,
  //     endX: ev.clientX,
  //     endY: ev.clientY,
  //   };
  //   function handleResizeMove(ev: MouseEvent) {
  //     resizingState = {
  //       ...resizingState,
  //       endX: ev.clientX,
  //       endY: ev.clientY,
  //     };
  //   }

  //   function handleResizeEnd() {
  //     const { dx, dy } = calculateResizeDeltas();
  //     onResized(el.width + dx, el.height + dy);

  //     resizingState = null;
  //     window.removeEventListener('mousemove', handleResizeMove);
  //     window.removeEventListener('mouseup', handleResizeEnd);
  //   }
  //   window.addEventListener('mousemove', handleResizeMove);
  //   window.addEventListener('mouseup', handleResizeEnd);
  // }

  // let rotatingState: { startDeg: number; endDeg: number } | null = null;
  // function handleRotateStart(ev: MouseEvent) {
  //   ev.preventDefault();
  //   ev.stopPropagation();
  //   const { left, top, width, height } = htmlEl.getBoundingClientRect();
  //   const centerX = left + width / 2;
  //   const centerY = top + height / 2;

  //   const rad = Math.atan2(ev.clientY - centerY, ev.clientX - centerX);
  //   const startDeg = rad * (180 / Math.PI);

  //   rotatingState = {
  //     startDeg,
  //     endDeg: startDeg,
  //   };
  //   function handleRotateMove(ev: MouseEvent) {
  //     const rad = Math.atan2(ev.clientY - centerY, ev.clientX - centerX);
  //     const endDeg = rad * (180 / Math.PI);
  //     rotatingState = {
  //       ...rotatingState,
  //       endDeg,
  //     };
  //   }
  //   function handleRotateEnd() {
  //     const dDeg = rotatingState.endDeg - rotatingState.startDeg;
  //     onRotated(el.rotation + dDeg);

  //     rotatingState = null;
  //     window.removeEventListener('mousemove', handleRotateMove);
  //     window.removeEventListener('mouseup', handleRotateEnd);
  //   }
  //   window.addEventListener('mousemove', handleRotateMove);
  //   window.addEventListener('mouseup', handleRotateEnd);
  // }

  // $: calculateResizeDeltas = () => {
  //   const rot = el.rotation * (Math.PI / 180);
  //   const cos = Math.cos(rot);
  //   const sin = Math.sin(rot);
  //   const dx = ((resizingState.endX - resizingState.startX) / zoomLevel) * 2;
  //   const dy = ((resizingState.endY - resizingState.startY) / zoomLevel) * 2;
  //   return {
  //     dx: dx * cos + dy * sin,
  //     dy: -dx * sin + dy * cos,
  //   };
  // };

  // $: previewEl =
  //   resizingState || rotatingState
  //     ? (() => {
  //         let newEl = el;
  //         if (resizingState) {
  //           const { dx, dy } = calculateResizeDeltas();

  //           newEl = { ...el, width: el.width + dx, height: el.height + dy };
  //         }
  //         if (rotatingState) {
  //           const dDeg = rotatingState.endDeg - rotatingState.startDeg;
  //           newEl = { ...el, rotation: el.rotation + dDeg };
  //         }

  //         return newEl;
  //       })()
  //     : el;

  // $: showResizeLayout =
  //   (isShiftPressed && isHovering && (resizable || rotatable)) || resizingState || rotatingState;

  $: Element = elements[el.type].Element as any;

  // let highlighted = false;

  $: boxStyle = `width: ${el.width}px;
    height: ${el.height}px;
    top: ${-el.height / 2}px;
    left: ${-el.width / 2}px;
    transform: translate(${el.x}px, ${el.y}px) rotate(${el.rotation}deg);`;

  // $: console.log('IS SELECTED', isSelected);
</script>

<!-- on:dragstart={onDragStart} -->
<!-- on:dragend={onDragEnd} -->
<!-- on:mouseenter={startHovering} -->
<!-- {#if isSelected}
  <div
    class=" absolute transform-origin-center pointer-events-none"
    style={`${boxStyle}; z-index: ${el.z - 1};`}
  >
    <div class="absolute -inset-[2px] b-dashed b b-cyan-400 bg-cyan-400/30"></div>
  </div>
{/if} -->

<div class="size-full">
  <svelte:component this={Element} {el} {gameSpace} isLocked={!$permissions.canEditComponents} />
</div>
<!-- <div
  class={cx('absolute transform-origin-center', klass)}
  style={`${boxStyle}
    z-index: ${el.z};
  `}
  bind:this={htmlEl}
  on:contextmenu={(ev) => {
    console.log('Element context menu', ev);
    ev.preventDefault();
  }}
  on:mousedown={(ev) => {
    console.log('Element mouse down', ev);
    onMouseDown(ev);
  }}
> -->
<!-- <svelte:component this={Element} {el} {gameSpace} isLocked={!$permissions.canEditComponents} /> -->
<!-- {#if highlighted}
    <div
      class="absolute z-100 -inset-1 pointer-events-none bg-blue-5/10 b b-dashed b-blue-5/40 rounded-md"
    ></div>
  {/if} -->
<!-- {#if el.wals.length > 0 && el.type !== 'EmbedWal'}
    <button
      on:mousedown={(ev) => onMouseDown({ ...ev, button: 1 })}
      use:tooltip={`${el.wals.length} attachments`}
      class="absolute -top-4 -right-4 rounded-full b b-black/10 shadow-md text-lg font-bold bg-red-500 text-white flexcc h8 w8"
      >{el.wals.length}</button
    >
  {/if} -->
<!-- {#if showResizeLayout}
    <div
      class="absolute inset-0 b b-red-500 b-dashed bg-red-500/50 z-100 cursor-pointer"
      draggable={true}
    >
      {#if resizable}
        <button
          class="z-20 h4 w4 bg-red-500 flexcc rounded-sm absolute -bottom-1 -right-1 cursor-nwse-resize"
          on:mousedown={handleResizeStart}
        >
          <ArrowsLeftRight class="rotate-45 text-xs text-white" />
        </button>
      {/if}
      {#if rotatable}
        <button
          class="z-20 h4 w4 bg-red-500 flexcc rounded-sm absolute -bottom-5 -right-5 cursor-grab"
          on:mousedown={handleRotateStart}
        >
          <RotateIcon class="rotate-45 scale-x-[-1] relative top-.5 text-xs text-white" />
        </button>
      {/if}
      <div
        class="z-10 w10 h12 -rotate-45 absolute left-full top-full -mt5.5 -ml4.5 bg-green-500"
        draggable="true"
      ></div>
    </div>
  {/if} -->
<!-- </div> -->
