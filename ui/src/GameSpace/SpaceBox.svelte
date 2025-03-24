<script lang="ts">
  import { cx } from '~/lib/util';

  export let vp: { panX: number; panY: number; zoom: number };
  export let box: { x: number; y: number; w: number; h: number; rotation?: number };
  export let onMouseDown: (ev: MouseEvent) => void = undefined;
  export let z: number;
  export let scale: boolean;
  let klass: string = '';
  export { klass as class };
</script>

{#if scale}
  <div
    class="absolute size-full transform-origin-tl pointer-events-none"
    style={`transform:scale(${vp.zoom}) translate(${vp.panX}px, ${vp.panY}px); z-index: ${z * 10};`}
  >
    <div
      on:contextmenu|preventDefault|stopPropagation={(ev) => {
        console.log('Space box context menu');
      }}
      on:mousedown={onMouseDown}
      class={cx('absolute top-0 left-0 pointer-events-auto', klass)}
      style={`width: ${box.w}px;
    height: ${box.h}px;
    transform: translate(${box.x}px, ${box.y}px) rotate(${box.rotation || 0}deg);`}
    >
      <slot />
    </div>
  </div>
{:else}
  <div
    on:contextmenu|preventDefault|stopPropagation={(ev) => {
      console.log('Space box context menu');
    }}
    on:mousedown={onMouseDown}
    class={cx('absolute top-0 left-0 pointer-events-auto', klass)}
    style={`width: ${box.w * vp.zoom}px;
    height: ${box.h * vp.zoom}px;
    transform: translate(${(box.x + vp.panX) * vp.zoom}px, ${(box.y + vp.panY) * vp.zoom}px) rotate(${box.rotation || 0}deg);
    z-index: ${z * 10};`}
  >
    <slot />
  </div>
{/if}
