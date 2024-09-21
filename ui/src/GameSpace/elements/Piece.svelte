<script lang="ts">
  import type { PieceElement } from '../types';

  export let el: PieceElement;

  let fontSize = Math.min(el.width, el.height) + 'px';
</script>

<div class="hover:bg-black/20">
  {#if el.display.mode === 'emoji'}
    <div
      class="flexcc"
      style={`width: ${el.width}px; height: ${el.height}px; font-size: ${fontSize}`}
      >{el.display.value}</div
    >
  {:else if el.display.mode === 'url'}
    <img
      style={`width: ${el.width}px; height: ${el.height}px;`}
      src={el.display.value}
      alt="image"
    />
  {/if}
</div>
