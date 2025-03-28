<script lang="ts">
  import { containingBox, type Box, type GElement, type GameSpace } from '~/store';
  import * as ELS from '~/elements';
  import { waitUntilWidthAndHeight } from '~/center/lib/util';

  export let gameSpace: GameSpace;
  $: elements = gameSpace.elements;

  let zoom = 1;
  let x = 0;
  let y = 0;
  let offsetX = 0;
  let offsetY = 0;
  let container: HTMLDivElement;
  let box: Box | null = null;

  $: {
    if (container && elements.length) {
      const newBox = containingBox(elements, 50);
      if (newBox) {
        waitUntilWidthAndHeight(container!, (rect) => {
          const wRatio = rect.width / newBox.w;
          const hRatio = rect.height / newBox.h;
          zoom = Math.min(wRatio, hRatio);
          x = -newBox.x;
          y = -newBox.y;
          offsetX = wRatio > hRatio ? (rect.width - newBox.w * zoom) / 2 : 0;
          offsetY = hRatio > wRatio ? (rect.height - newBox.h * zoom) / 2 : 0;
          box = newBox;
        });
      }
    }
  }
</script>

<div
  class="h-full w-full bg-main-400 b b-black/25 bg-[url('/noise20.png')] pointer-events-none overflow-hidden"
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
      <div
        class="absolute"
        style={`
          width: ${el.width}px;
          height: ${el.height}px;
          top: 0px;
          left: 0px;
          transform: translate(${el.x}px, ${el.y}px) rotate(${el.rotation}deg);
          z-index: ${el.z};
    `}
      >
        {#if el.type === 'Piece'}
          <ELS.Piece.Element {el} />
        {:else if el.type === 'Image'}
          <ELS.Image.Element {el} />
        {:else if el.type === 'TurnTracker'}
          <ELS.TurnTracker.MiniEl {el} {gameSpace} />
        {:else if el.type === 'PlayerPieceSource'}
          <ELS.PlayerPieceSource.MiniEl {el} {gameSpace} />
        {:else if el.type === 'PieceSource'}
          <ELS.PieceSource.MiniEl {el} />
        {:else if el.type === 'Dice'}
          <ELS.Dice.MiniEl {el} />
        {:else if el.type === 'EmbedWal'}
          <ELS.EmbedWal.MiniEl {el} />
        {/if}
      </div>
    {/each}
  </div>
</div>
