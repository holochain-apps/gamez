<script lang="ts">
  import { onMount } from 'svelte';

  import { type GElement, type LockConfig } from './types.d';

  import PieceConfig from './elements/PieceConfig.svelte';
  import ImageConfig from './elements/ImageConfig.svelte';
  import CommonConfigButtons from './CommonConfigButtons.svelte';

  export let x: number;
  export let y: number;
  export let onUpdateEl: (el: GElement) => void;
  export let onClose: () => void;
  export let el: GElement;

  let element: HTMLDivElement;
  onMount(() => {
    function handleClick(ev: MouseEvent) {
      console.log('Closing!!!?', element, ev.target, element.contains(ev.target as Node));
      if (element && !element.contains(ev.target as Node)) {
        console.log('CLOSING!!!');
        onClose();
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('mousedown', handleClick);
    };
  });

  function handleLockUpdate(lockConfig: LockConfig) {
    onUpdateEl({ ...el, lock: lockConfig });
  }

  $: console.log('New lock', el.lock);
</script>

<div
  bind:this={element}
  class="fixed left-0 top-0 min-w-70 rounded-md bg-white shadow-md b b-black/10 p2"
  style={`
    top: ${y}px;
    left: ${x}px;
  `}
>
  <CommonConfigButtons onLock={handleLockUpdate} lockConfig={el.lock} />

  {#if el.type == 'Piece'}
    <PieceConfig {el} onUpdate={onUpdateEl} />
  {:else if el.type == 'Image'}
    <ImageConfig {el} onUpdate={onUpdateEl} />
  {/if}
</div>
