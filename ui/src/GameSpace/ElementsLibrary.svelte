<script lang="ts">
  import cx from 'classnames';
  import { LIBRARY, type LibraryElement } from './store/library';

  export let onAdd: (libraryElement: LibraryElement, x?: number, y?: number) => void;

  let dragState: {
    element: LibraryElement;
    x: number;
    y: number;
  } | null = null;
  function handleDragStart(elementType: string, ev: DragEvent) {
    const element = LIBRARY.find((el) => el.elementType === elementType);

    dragState = { element, x: ev.clientX, y: ev.clientY };

    function handleDragMove(e: MouseEvent) {
      dragState = { element, x: e.clientX, y: e.clientY };
    }
    function handleDragEnd() {
      onAdd(dragState.element, dragState.x, dragState.y);
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      dragState = null;
    }
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  }
</script>

<div class="w-60 bg-main-800 h-full p2 space-y-2 flex-shrink-0">
  {#each LIBRARY as libraryElement}
    <button
      class="relative b b-black/10 rounded-md bg-black/5 w-full"
      on:click={() => onAdd(libraryElement)}
    >
      <div
        on:dragstart={(ev) => handleDragStart(libraryElement.elementType, ev)}
        draggable={true}
        class={cx('text-4xl h12 absolute left-0 top-0 w-full', {})}
      >
        <div class="flexcc h12 w12">{libraryElement.icon}</div>
      </div>
      <div class="flex-grow text-left text-lg ml12 h12 w-full flexcs">{libraryElement.label}</div>
    </button>
  {/each}
</div>
{#if dragState}
  <div
    class="fixed z-100 flexcc h12 w12 -top-6 -left-6 text-4xl cursor-pointer text-black/100"
    style={`transform: translate(${dragState.x}px, ${dragState.y}px)`}
  >
    {dragState.element.icon}
  </div>
{/if}
