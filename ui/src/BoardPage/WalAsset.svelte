<svelte:options accessors />

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import Moveable from 'svelte-moveable';

  import '@lightningrodlabs/we-elements/dist/elements/wal-embed.js';
  import { type WeaveUrl } from '@lightningrodlabs/we-applet';

  import { type Position, type Size } from '~/lib/util';

  const dispatch = createEventDispatcher();
  export let isEditable = false;

  let className = '';
  export const setEditable = (editable) => {
    isEditable = editable;
    draggable = editable;
    edgeDraggable = editable;
    resizable = editable;
    origin = editable;
  };
  export { className as class };
  export let bare = true;
  let edge = false;
  let origin = false;
  export let draggable = false;
  let edgeDraggable = false;
  export let resizable = false;
  export let position: Position;
  export let size: Size;
  export let weaveUrl: WeaveUrl;
  let target: HTMLDivElement;
  let embed;

  onMount(async () => {
    target.style.transform = `translate(${position.x}px,${position.y}px)`;
    if (size) {
      target.style.height = `${size.height}px`;
      target.style.width = `${size.width}px`;
    }
    setEditable(isEditable);
  });

  const onDragStart = (e) => {};
  const onDrag = (e) => {
    e.target.style.transform = e.transform;
    position = { x: e.translate[0], y: e.translate[1] };
  };
  const onDragEnd = (e) => {};
  const onResize = (e) => {
    e.target.style.width = `${e.width}px`;
    e.target.style.height = `${e.height}px`;
    e.target.style.transform = e.drag.transform;
    size = { height: e.height, width: e.width };
  };
</script>

<div class="asset {className}" bind:this={target}>
  <div class:no-pointer={draggable}>
    <wal-embed bind:this={embed} closable {bare} class="embed" style="" src={weaveUrl}> </wal-embed>
  </div>
</div>
<Moveable
  {target}
  {origin}
  {edge}
  {draggable}
  {edgeDraggable}
  throttleDrag={1}
  on:dragStart={({ detail }) => onDragStart(detail)}
  on:drag={({ detail }) => onDrag(detail)}
  on:dragEnd={({ detail }) => onDragEnd(detail)}
  {resizable}
  on:resize={({ detail }) => onResize(detail)}
/>

<style>
  .asset {
    position: absolute;
    background-color: gray;
    width: 100px;
    height: 100px;
    overflow: auto;
  }
  .no-pointer {
    pointer-events: none;
  }
</style>
