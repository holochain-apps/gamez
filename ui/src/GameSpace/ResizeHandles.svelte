<script context="module" lang="ts">
  export type BoxResizeHandles = 'l' | 'r' | 'b' | 't' | 'tr' | 'br' | 'tl' | 'bl';
</script>

<script lang="ts">
  export let onMouseDown: (ev: MouseEvent, resizeHandle: BoxResizeHandles) => void;

  const handles: BoxResizeHandles[] = ['l', 'r', 'b', 't', 'tr', 'br', 'tl', 'bl'];
  const styles = {
    t: 'cursor-ns-resize left-0 -top-1 h2 w-full z-50',
    b: 'cursor-ns-resize left-0 -bottom-1 h2 w-full z-50',
    l: 'cursor-ew-resize -left-1 top-0 h-full w2 z-50',
    r: 'cursor-ew-resize -right-1 top-0 h-full w2 z-50',
    tl: 'cursor-nwse-resize -left-2 -top-2 h4 w4 z-51',
    tr: 'cursor-nesw-resize -right-2 -top-2 h4 w4 z-51',
    bl: 'cursor-nesw-resize -left-2 -bottom-2 h4 w4 z-51',
    br: 'cursor-nwse-resize -right-2 -bottom-2 h4 w4 z-51',
  };
</script>

{#each handles as handle}
  <div
    on:mousedown={(ev) => onMouseDown(ev, handle)}
    class="hidden group-hover:block absolute hover:bg-cyan-400 bg-black/0 rounded-sm {styles[
      handle
    ]}"
  ></div>
{/each}
