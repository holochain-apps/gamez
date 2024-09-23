<script lang="ts">
  import cx from 'classnames';
  import type { GElement } from './types';
  import * as elements from './elements';

  export let el: GElement;
  export let onDragStart: (ev: DragEvent) => void;
  export let onDragEnd: () => void;
  export let onDrop: (ev: DragEvent) => void;
  export let onDragOver: (ev: DragEvent) => void;
  export let onContextMenu: (ev: MouseEvent) => void;

  const draggable = true;
</script>

<div
  class={cx('absolute ', {
    'hover:(brightness-125 saturate-125)': draggable,
  })}
  style={`
    width: ${el.width}px;
    height: ${el.height}px;
    transform: translate(${el.x}px, ${el.y}px);
    z-index: ${el.z};
  `}
  on:dragstart={onDragStart}
  on:dragend={onDragEnd}
  on:drop={onDrop}
  on:dragover={onDragOver}
  on:contextmenu={onContextMenu}
  {draggable}
>
  {#if el.type === 'Piece'}
    <svelte:component this={elements.Piece} {el} />
  {:else if el.type === 'Image'}
    <svelte:component this={elements.Image} {el} />
  {/if}
</div>
