<script lang="ts">
  import { type GElement } from './types';

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
  ];

  function addElement(type: LibraryElement) {
    if (type.elementType === 'Piece') {
      onAdd({
        type: 'Piece',
        uuid: '',
        version: 1,
        x: 0,
        y: 0,
        z: 0,
        width: type.initialWidth,
        height: type.initialHeight,
        wals: [],
        display: { mode: 'emoji', value: '🔥' },
      });
    } else if (type.elementType === 'Image') {
      onAdd({
        type: 'Image',
        uuid: '',
        version: 1,
        x: 0,
        y: 0,
        z: 0,
        width: type.initialWidth,
        height: type.initialHeight,
        wals: [],
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chessboard_green_squares.svg/512px-Chessboard_green_squares.svg.png',
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
