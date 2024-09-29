<script lang="ts">
  import { cloneDeep } from 'lodash';
  import { v1 as uuidv1 } from 'uuid';
  import { type GameSpaceSyn } from '../store/GameSpaceSyn';
  import type { PieceSourceElement, PieceElement } from '../types';
  import Piece from './Piece.svelte';

  export let el: PieceSourceElement;
  export let gameSpace: GameSpaceSyn;

  function stringToHashCode(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  $: genSeedRand = (seedString: string) => {
    var seed = stringToHashCode(seedString);
    return function random() {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
  };

  $: piecesPositions = (() => {
    const seedRand = genSeedRand(el.uuid);
    const radius = Math.min(el.width, el.height) / 2 - Math.max(el.pieceW, el.pieceH) / 2;
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < el.limit; i++) {
      const r = Math.floor(seedRand() * radius);
      const deg = Math.floor(seedRand() * 360);
      const x = Math.cos(deg) * r + el.width / 2;
      const y = Math.sin(deg) * r + el.height / 2;
      positions.push({ x, y });
    }
    return positions;
  })();

  function clearSourceData(
    el: PieceSourceElement,
  ): Omit<PieceSourceElement, 'version' | 'type' | 'limit' | 'createdPieces'> {
    const newEl = { ...el };

    delete newEl.limit;
    delete newEl.createdPieces;
    delete newEl.version;
    delete newEl.type;
    return newEl;
  }

  $: displayPieceEl = {
    type: 'Piece' as 'Piece',
    version: 1 as 1,
    ...clearSourceData(el),
    width: el.pieceW,
    height: el.pieceH,
  };

  $: canAddPiece = el.limit === null || el.limit > el.createdPieces.length;

  async function handleAddPiece() {
    if (!canAddPiece) return;
    const newEl = {
      type: 'Piece' as 'Piece',
      version: 1 as 1,
      ...cloneDeep(clearSourceData(el)),
      width: el.pieceW,
      height: el.pieceH,
      x: -el.pieceW / 2,
      y: -el.pieceH / 2,
      z: 0,
      wals: [],
      lock: {
        position: false,
        size: false,
        rotation: false,
        wals: false,
        config: true,
        remove: false,
      },
      uuid: uuidv1(),
    };
    await gameSpace.change([
      { type: 'add-element', element: newEl },
      {
        type: 'update-element',
        element: {
          uuid: el.uuid,
          createdPieces: [...el.createdPieces, newEl.uuid],
        },
      },
    ]);
  }
</script>

<div class="w-full h-full bg-red-800 shadow-inner b-2 b-white/60 rounded-full flexcc h-full w-full">
  <button
    on:click={handleAddPiece}
    class="outline-none flexcc flex-wrap relative w-full h-full disabled:cursor-not-allowed"
    disabled={!canAddPiece}
    style={``}
  >
    {#each { length: el.limit - el.createdPieces.length } as _, i}
      <div
        class="absolute z-20"
        style={`transform: translate(-50%, -50%); top: ${piecesPositions[i].y}px; left: ${piecesPositions[i].x}px`}
      >
        <Piece class="relative z-20 flexcc" el={displayPieceEl} />
      </div>
    {/each}
    <div class="absolute z-10 flexcc inset-0 opacity-25">
      <Piece el={{ ...displayPieceEl, width: el.width * 0.8, height: el.height * 0.8 }} />
    </div>
  </button>
</div>
