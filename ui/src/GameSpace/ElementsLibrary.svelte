<script lang="ts">
  import { type GElement } from './types.d';

  export let onAdd: (el: GElement) => void;

  type LibraryElement = {
    elementType: string;
    label: string;
    icon: string;
    initialWidth: number;
    initialHeight: number;
  };

  const LIBRARY: LibraryElement[] = [
    {
      elementType: 'Piece',
      label: 'Piece',
      icon: '♟',
      initialHeight: 30,
      initialWidth: 30,
    },
    {
      elementType: 'Image',
      label: 'Image',
      icon: '🖼',
      initialHeight: 250,
      initialWidth: 250,
    },
    {
      elementType: 'PieceSource',
      label: 'Pieces source',
      icon: '📤',
      initialHeight: 100,
      initialWidth: 100,
    },
  ];

  function addElement(type: LibraryElement) {
    const base = {
      uuid: '',
      x: -type.initialWidth / 2,
      y: -type.initialHeight / 2,
      z: 0,
      rotation: 0,
      height: type.initialHeight,
      width: type.initialWidth,
      lock: {
        position: false,
        size: false,
        rotation: false,
        wals: false,
        config: false,
        remove: false,
      },
      wals: [],
    };
    if (type.elementType === 'Piece') {
      onAdd({
        type: 'Piece',
        version: 1,
        display: { mode: 'emoji', value: '🔥' },
        ...base,
      });
    } else if (type.elementType === 'Image') {
      onAdd({
        type: 'Image',
        version: 1,
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chessboard_green_squares.svg/512px-Chessboard_green_squares.svg.png',
        ...base,
      });
    } else if (type.elementType === 'PieceSource') {
      onAdd({
        type: 'PieceSource',
        version: 1,
        limit: 3,
        createdPieces: [],
        display: { mode: 'emoji', value: '⚫️' },
        ...base,
      });
    }
  }
</script>

<div class="w-60 bg-main-800 h-full p2 space-y-2 flex-shrink-0">
  {#each LIBRARY as libraryElement}
    <button
      class="b b-black/10 rounded-md bg-black/5 flexcc w-full"
      on:click={() => addElement(libraryElement)}
    >
      <div class="text-4xl h12 w12 flexcc">{libraryElement.icon}</div>
      <div class="flex-grow text-left text-lg">{libraryElement.label}</div>
    </button>
  {/each}
</div>
