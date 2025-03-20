<script lang="ts">
  import { cx } from '~/lib/util';
  import type { PieceElement } from './type';

  export let el: Pick<PieceElement, 'display' | 'width' | 'height'>;
  // export let gameSpace: any = null;
  let klass: string = '';
  export { klass as class };
  export let style = '';
  $$restProps; // This prevents Svelte warnings from unused props
</script>

<div class={cx(klass, 'size-full flexcc')} {style}>
  {#if el.display.mode === 'emoji'}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
    >
      <text x="50%" y="53%" text-anchor="middle" dominant-baseline="central" font-size="100">
        {el.display.value}
      </text>
    </svg>
  {:else if el.display.mode === 'url'}
    <img
      style={`width: ${el.width}px; height: ${el.height}px;`}
      src={el.display.value}
      alt="Piece"
      draggable={false}
    />
  {/if}
</div>
