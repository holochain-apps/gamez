<script lang="ts">
  import { containingBox, type Box, type GElement, type GameSpaceSyn } from '~/store';
  import * as ELS from './elements';

  export let gameSpace: GameSpaceSyn;
  export let elements: GElement[];

  $: GS = gameSpace.state;

  let zoom = 1;
  let x = 0;
  let y = 0;
  let offsetX = 0;
  let offsetY = 0;
  let container: HTMLDivElement;
  let box: Box | null = null;

  $: {
    if (container && elements.length) {
      console.log('Recalculating');
      const newBox = containingBox(elements, 50);
      const { width, height } = container!.getBoundingClientRect();
      if (newBox && width && height) {
        const wRatio = width / newBox.w;
        const hRatio = height / newBox.h;
        zoom = Math.min(wRatio, hRatio);
        console.log(wRatio, hRatio);
        x = -newBox.x;
        y = -newBox.y;
        offsetX = wRatio > hRatio ? (width - newBox.w * zoom) / 2 : 0;
        offsetY = hRatio > wRatio ? (height - newBox.h * zoom) / 2 : 0;
        // offsetX = 0;
        // console.log('M', height - newBox.h * zoom);
        // offsetY = 54;
        box = newBox;
      }
    }
  }
</script>

<div
  class="absolute bottom-8 right-0 w-50 h-50 bg-main-400 b b-black/25 bg-[url('/noise20.png')] z-100"
  bind:this={container}
>
  <div
    class="relative size-full transform-origin-tl"
    style={`transform: scale(${zoom}) translate(${x}px, ${y}px); left: ${offsetX}px; top: ${offsetY}px;`}
  >
    {#if box}
      <div
        class="absolute"
        style={`
          width: ${box.w}px;
          height: ${box.h}px;
          top: ${0}px;
          left: ${0}px;
          transform: translate(${box.x}px, ${box.y}px);
        `}
      ></div>
    {/if}
    {#each elements as el (el.uuid)}
      {@const Element = ELS[el.type].Element}
      <div
        class="absolute"
        style={`
      width: ${el.width}px;
      height: ${el.height}px;
      top: ${-el.height / 2}px;
      left: ${-el.width / 2}px;
      transform: translate(${el.x}px, ${el.y}px) rotate(${el.rotation}deg);
      z-index: ${el.z};
    `}
      >
        <!-- <svelte:component
        this={Element}
        el={el}
        {gameSpace}
        isLocked={true}
      /> -->
        {#if el.type === 'Piece'}
          <ELS.Piece.Element {el} isLocked={true} />
        {:else if el.type === 'Image'}
          <ELS.Image.Element {el} isLocked={true} />
        {:else if el.type === 'TurnTracker'}
          <ELS.TurnTracker.MiniEl {el} {gameSpace} />
        {:else if el.type === 'PlayerPieceSource'}
          <ELS.PlayerPieceSource.MiniEl {el} {gameSpace} />
        {/if}
      </div>
    {/each}
  </div>
</div>
