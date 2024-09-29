<script lang="ts">
  import type { PieceElement } from '../types';

  export let el: PieceElement;
  let klass: string = '';
  export { klass as class };

  $: fontSize = Math.min(el.width, el.height) + 'px';
</script>

<div class={klass}>
  {#if el.display.mode === 'emoji'}
    <div
      class="flexcc text-black/100"
      style={`width: ${el.width}px; height: ${el.height}px; font-size: ${fontSize}`}
      >{el.display.value}</div
    >
  {:else if el.display.mode === 'url'}
    <img
      style={`width: ${el.width}px; height: ${el.height}px;`}
      src={el.display.value}
      alt="Piece"
      draggable={false}
    />
  {/if}
</div>
