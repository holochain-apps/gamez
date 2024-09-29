<script lang="ts">
  import { cloneDeep } from 'lodash';
  import { type GameSpaceSyn } from '../store/GameSpaceSyn';
  import type { PieceSourceElement, PieceElement } from '../types';
  import Piece from './Piece.svelte';

  export let el: PieceSourceElement;
  export let gameSpace: GameSpaceSyn;

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
    width: el.width * 0.8,
    height: el.height * 0.8,
  };

  async function handleAddPiece() {
    const newEl = {
      type: 'Piece' as 'Piece',
      version: 1 as 1,
      ...cloneDeep(clearSourceData(el)),
      width: 30,
      height: 30,
      x: -15,
      y: -15,
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
    };
    await gameSpace.change({ type: 'add-element', element: newEl });
    console.log('Piece added');
  }
</script>

<div class="w-full h-full b-2 b-white rounded-md bg-white/10 flexcc">
  <button on:click={handleAddPiece}>
    <Piece el={displayPieceEl} />
  </button>
</div>
