<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import TrashIcon from '~icons/fa6-solid/trash';
  import CloneIcon from '~icons/fa6-solid/clone';

  import {
    type GElement,
    type CanConfig,
    CAN_ALL,
    DEFAULT_CAN_CONFIG,
    type GameSpace,
    type GameSpaceSyn,
  } from '~/store';
  import CanConfigEl from './CanConfig.svelte';
  import ZConfig from './ZConfig.svelte';
  import WalsControls from './WalsControls.svelte';

  import * as E from '../elements';
  import { tooltip } from '~/shared/tooltip';
  import clients from '~/clients';

  export let x: number;
  export let y: number;
  export let onUpdateEl: (el: Partial<GElement>) => void;
  export let onMoveZ: (z: 'top' | 'bottom' | 'up' | 'down') => void;
  export let onRemoveEl: () => void;
  export let onClose: () => void;
  export let onDuplicate: () => void;
  export let el: GElement;

  const gameSpaceStore = getContext('game-space-store') as GameSpaceSyn;
  const gameSpace = getContext('game-space') as GameSpace;

  $: editMode = gameSpaceStore.editMode;
  $: resolvedCan = { ...DEFAULT_CAN_CONFIG, ...el.can };
  $: resolvedEl = { ...el, can: resolvedCan } as any;

  let element: HTMLDivElement;
  let adjustX = 0;
  let adjustY = 0;
  onMount(() => {
    if (element) {
      const { width, height, left, top } = element.getBoundingClientRect();
      const docW = document.documentElement.clientWidth;
      const docH = document.documentElement.clientHeight;
      if (left + width > docW) {
        adjustX = left + width - docW;
      }
      if (top + height > docH) {
        adjustY = top + height - docH;
      }
      function handleClick(ev: MouseEvent) {
        if (element && !element.contains(ev.target as Node)) {
          onClose();
        }
      }
      window.addEventListener('mousedown', handleClick);
      return () => {
        window.removeEventListener('mousedown', handleClick);
      };
    } else {
      onClose();
    }
  });

  function handleCanUpdate(canConfig: CanConfig) {
    onUpdateEl({ uuid: el.uuid, can: canConfig });
  }

  async function handleAddAttachment(weaveUrl: string) {
    onUpdateEl({ uuid: el.uuid, wals: [...el.wals, weaveUrl] });
  }

  function handleRemoveAttachment(index: number) {
    const newWals = el.wals.filter((_, i) => i !== index);
    onUpdateEl({ uuid: el.uuid, wals: newWals });
  }

  $: shouldBeShown =
    $editMode || Object.values(resolvedCan).some((v) => v) || resolvedEl.wals.length > 0;
</script>

{#if shouldBeShown}
  <div
    bind:this={element}
    class="fixed left-0 top-0 min-w-70 rounded-md bg-gray-50 shadow-md b b-black/10 p2"
    style={`
    top: ${y - adjustY}px;
    left: ${x - adjustX}px;
  `}
  >
    {#if $editMode}
      <CanConfigEl onCanChange={handleCanUpdate} canConfig={resolvedCan} />
    {/if}
    {#if $editMode || resolvedCan.move || resolvedCan.duplicate || resolvedCan.remove}
      <div class="flex space-x-2 mb2">
        {#if $editMode || resolvedCan.move}
          <ZConfig {onMoveZ} disabled={false} />
        {/if}

        {#if $editMode || resolvedCan.duplicate}
          <button
            on:click={onDuplicate}
            use:tooltip={'Duplicate'}
            class="flexcc w-12 text-black/60 hover:text-main-600"
          >
            <CloneIcon />
          </button>
        {/if}
        {#if $editMode || resolvedCan.remove}
          <button
            on:click={onRemoveEl}
            disabled={false}
            use:tooltip={'Delete'}
            class={`
              flexcc
              w-12
            text-black/60 hover:text-red-500
              disabled:(opacity-50 saturate-50 text-black/60)
            `}
          >
            <TrashIcon /></button
          >
        {/if}
      </div>
    {/if}

    {#if $editMode || resolvedCan.configurate}
      <svelte:component
        this={E[resolvedEl.type].ConfigMenu}
        el={resolvedEl}
        onUpdate={(el) => onUpdateEl({ ...el, uuid: resolvedEl.uuid })}
        gameSpace={gameSpaceStore}
      />
    {/if}

    {#if clients.weave && ($editMode || resolvedCan.attach || resolvedEl.wals.length > 0)}
      <WalsControls
        attachments={el.wals}
        onAddAttachment={handleAddAttachment}
        onRemoveAttachment={handleRemoveAttachment}
        canModify={$editMode || resolvedCan.attach}
      />
    {/if}
  </div>
{/if}
