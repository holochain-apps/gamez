<script lang="ts">
  import type { GElement } from './types';
  import * as elements from './elements';

  export let el: GElement;

  function onDragStart(ev: DragEvent) {
    console.log('Drag start', ev);
  }
</script>

<div
  class="absolute hover:bg-black/20"
  style={`width: ${el.width}px; height: ${el.height}px; left: ${el.x}px; top: ${el.y}px;`}
  on:dragstart={onDragStart}
>
  {#if el.type === 'Piece'}
    <svelte:component this={elements.Piece} {el} />
  {:else if el.type === 'Image'}
    <svelte:component this={elements.Image} {el} />
  {/if}
</div>
