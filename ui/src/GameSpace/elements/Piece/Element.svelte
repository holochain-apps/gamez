<script lang="ts">
  import type { PieceElement } from './type';

  export let el: Pick<PieceElement, 'display' | 'width' | 'height'>;
  // export let gameSpace: any = null;
  let klass: string = '';
  export { klass as class };
  export let style = '';
  $$restProps; // This prevents Svelte warnings from unused props

  $: fontSize = Math.min(el.width, el.height) + 'px';
</script>

<div class={klass} {style}>
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
