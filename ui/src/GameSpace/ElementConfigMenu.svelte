<script lang="ts">
  import { onMount } from 'svelte';
  import TrashIcon from '~icons/fa6-solid/trash';

  import { type GElement, type LockConfig } from './types.d';
  import { type GameSpaceSyn } from './store/GameSpaceSyn';
  import PieceConfig from './elements/PieceConfig.svelte';
  import ImageConfig from './elements/ImageConfig.svelte';
  import LockConfigEl from './LockConfig.svelte';
  import ZConfig from './ZConfig.svelte';
  import WalsControls from './WalsControls.svelte';
  import PieceSourceConfig from './elements/PieceSourceConfig.svelte';

  export let x: number;
  export let y: number;
  export let onUpdateEl: (el: GElement) => void;
  export let onMoveZ: (z: 'top' | 'bottom' | 'up' | 'down') => void;
  export let onRemoveEl: () => void;
  export let onClose: () => void;
  export let el: GElement;
  export let isCreator: boolean;
  export let isSteward: boolean;
  export let isPlaying: boolean;
  export let gameSpace: GameSpaceSyn;
  export let allElements: GElement[];

  $: canEditLock = isCreator || (isSteward && isPlaying);
  $: everythingLocked = !isCreator && !isPlaying;

  $: resolvedLock = everythingLocked
    ? { position: true, size: true, rotation: true, config: true, wals: true, remove: true }
    : el.lock;

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
  class="fixed left-0 top-0 min-w-70 rounded-md bg-gray-50 shadow-md b b-black/10 p2"
  style={`
    top: ${y}px;
    left: ${x}px;
  `}
>
  <!-- <PieceAttachmentDialog {activeBoard} bind:this={pieceAttachmentDialog}></PieceAttachmentDialog> -->
  <div class="flex space-x-2 mb2">
    <ZConfig {onMoveZ} disabled={resolvedLock.position} />
    <button
      on:click={onRemoveEl}
      disabled={resolvedLock.remove}
      class={`
        flexcc
        w-12
      text-black/60 hover:text-red-500
        disabled:(opacity-50 saturate-50 text-black/60)
      `}
    >
      <TrashIcon /></button
    >
  </div>
  <LockConfigEl onLock={handleLockUpdate} lockConfig={el.lock} {canEditLock} />

  {#if el.type == 'Piece'}
    <PieceConfig el={{ ...el, lock: resolvedLock }} onUpdate={onUpdateEl} />
  {:else if el.type == 'Image'}
    <ImageConfig el={{ ...el, lock: resolvedLock }} onUpdate={onUpdateEl} />
  {:else if el.type === 'PieceSource'}
    <PieceSourceConfig el={{ ...el, lock: resolvedLock }} onUpdate={onUpdateEl} />
  {/if}

  <WalsControls
    attachments={el.wals}
    onAddAttachment={handleAddAttachment}
    onRemoveAttachment={handleRemoveAttachment}
    locked={resolvedLock.wals}
  />
</div>
