<script lang="ts">
  import { onMount } from 'svelte';

  import { type WAL, weaveUrlFromWal } from '@theweave/api';

  import { type GElement, type LockConfig } from './types.d';
  import PieceConfig from './elements/PieceConfig.svelte';
  import ImageConfig from './elements/ImageConfig.svelte';
  import CommonConfigButtons from './CommonConfigButtons.svelte';
  import WalsControls from './WalsControls.svelte';

  export let x: number;
  export let y: number;
  export let onUpdateEl: (el: GElement) => void;
  export let onClose: () => void;
  export let el: GElement;

  let element: HTMLDivElement;
  onMount(() => {
    function handleClick(ev: MouseEvent) {
      if (element && !element.contains(ev.target as Node)) {
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

  // let pieceAttachmentDialog: PieceAttachmentDialog;
  async function handleAddAttachment(weaveUrl: string) {
    onUpdateEl({ ...el, wals: [...el.wals, weaveUrl] });
  }

  function handleRemoveAttachment(index: number) {
    const newWals = el.wals.filter((_, i) => i !== index);
    onUpdateEl({ ...el, wals: newWals });
  }
</script>

<div
  bind:this={element}
  class="fixed left-0 top-0 min-w-70 rounded-md bg-white shadow-md b b-black/10 p2"
  style={`
    top: ${y}px;
    left: ${x}px;
  `}
>
  <!-- <PieceAttachmentDialog {activeBoard} bind:this={pieceAttachmentDialog}></PieceAttachmentDialog> -->
  <CommonConfigButtons onLock={handleLockUpdate} lockConfig={el.lock} />

  {#if el.type == 'Piece'}
    <PieceConfig {el} onUpdate={onUpdateEl} />
  {:else if el.type == 'Image'}
    <ImageConfig {el} onUpdate={onUpdateEl} />
  {/if}

  <WalsControls
    attachments={el.wals}
    onAddAttachment={handleAddAttachment}
    onRemoveAttachment={handleRemoveAttachment}
    locked={el.lock.wals}
  />
</div>
