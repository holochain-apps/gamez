<script lang="ts">
  import cx from 'classnames';
  import type { GElement } from './types';
  import * as elements from './elements';
  import ArrowsLeftRight from '~icons/fa6-solid/arrows-left-right';

  export let el: GElement;
  export let onDragStart: (ev: DragEvent) => void;
  export let onDragEnd: () => void;
  export let onDrop: (ev: DragEvent) => void;
  export let onDragOver: (ev: DragEvent) => void;
  export let onContextMenu: (ev: MouseEvent) => void;
  export let onResized: (width: number, height: number) => void;

  export let draggable;
  export let resizable;

  let isHovering = false;
  let isShiftPressed = false;
  let htmlEl: HTMLDivElement;

  function startHovering() {
    if (!resizable) return;
    isHovering = true;
    function handleShiftDown(ev: KeyboardEvent) {
      if (ev.key === 'Shift') {
        isShiftPressed = true;
      }
    }
    function handleShiftUp(ev: KeyboardEvent) {
      if (ev.key === 'Shift') {
        isShiftPressed = false;
      }
    }
    function handleMouseLeave() {
      htmlEl.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('keydown', handleShiftDown);
      window.removeEventListener('keyup', handleShiftUp);
      isHovering = false;
    }
    window.addEventListener('keydown', handleShiftDown);
    window.addEventListener('keyup', handleShiftUp);
    htmlEl.addEventListener('mouseleave', handleMouseLeave);
  }

  let resizingState: { startX: number; startY: number; endX: number; endY: number } | null = null;
  function handleResizeStart(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    resizingState = {
      startX: ev.clientX,
      startY: ev.clientY,
      endX: ev.clientX,
      endY: ev.clientY,
    };
    function handleResizeMove(ev: MouseEvent) {
      resizingState = {
        ...resizingState,
        endX: ev.clientX,
        endY: ev.clientY,
      };
    }

    function handleResizeEnd() {
      const dx = resizingState.endX - resizingState.startX;
      const dy = resizingState.endY - resizingState.startY;
      onResized(el.width + dx, el.height + dy);

      resizingState = null;
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    }
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
  }

  $: resizedEl = resizingState
    ? (() => {
        const dx = resizingState.endX - resizingState.startX;
        const dy = resizingState.endY - resizingState.startY;

        return { ...el, width: el.width + dx, height: el.height + dy };
      })()
    : el;

  $: showResizeLayout = (isHovering && resizable && isShiftPressed) || resizingState;
</script>

<div
  class={cx('absolute ', {
    'hover:(brightness-125 saturate-125)': draggable,
  })}
  style={`
    width: ${resizedEl.width}px;
    height: ${resizedEl.height}px;
    transform: translate(${el.x}px, ${el.y}px);
    z-index: ${el.z};
  `}
  bind:this={htmlEl}
  on:dragstart={onDragStart}
  on:dragend={onDragEnd}
  on:drop={onDrop}
  on:dragover={onDragOver}
  on:contextmenu={onContextMenu}
  on:mouseenter={startHovering}
  {draggable}
>
  {#if resizedEl.type === 'Piece'}
    <svelte:component this={elements.Piece} el={resizedEl} />
  {:else if resizedEl.type === 'Image'}
    <svelte:component this={elements.Image} el={resizedEl} />
  {/if}
  {#if showResizeLayout}
    <div class="absolute inset-0 b b-red-500 b-dashed bg-red-500/10">
      <button
        class="h4 w4 bg-red-500 flexcc rounded-sm absolute -bottom-1 -right-1 cursor-nwse-resize"
        on:mousedown={handleResizeStart}
      >
        <ArrowsLeftRight class="rotate-45 text-xs text-white" />
      </button>
    </div>
  {/if}
</div>
