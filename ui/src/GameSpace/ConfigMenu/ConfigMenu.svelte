<script lang="ts">
  import { tick } from 'svelte';
  import TrashIcon from '~icons/fa6-solid/trash';
  import CloneIcon from '~icons/fa6-solid/clone';

  import { type GElement, type CanConfig, DEFAULT_CAN_CONFIG, getGSS } from '~/store';
  import CanConfigEl from './CanConfig.svelte';
  import ZConfig from './ZConfig.svelte';
  import WalsControls from './WalsControls.svelte';

  import * as E from '~/elements';
  import { tooltip } from '~/center/lib/tooltip';
  import clients from '~/clients';
  import CanConfigView from './CanConfigView.svelte';

  export let x: number;
  export let y: number;
  export let onUpdateEl: (el: Partial<GElement>) => void;
  export let onMoveZ: (z: 'top' | 'bottom' | 'up' | 'down') => void;
  export let onRemoveEl: () => void;
  export let onClose: () => void;
  export let onDuplicate: () => void;
  export let el: GElement;

  const GSS = getGSS();

  $: mode = GSS.mode;
  $: resolvedCan = { ...DEFAULT_CAN_CONFIG, ...el.can };
  $: resolvedEl = { ...el, can: resolvedCan } as any;
  $: editMode = $mode === 'edit';
  $: shouldBeShown =
    editMode || Object.values(resolvedCan).some((v) => v) || resolvedEl.wals.length > 0;

  let element: HTMLDivElement;
  let adjustX = 0;
  let adjustY = 0;

  $: {
    x && y && el; // Reactivity stuff
    if (shouldBeShown && element) {
      adjustX = 0;
      adjustY = 0;
      tick().then(() => {
        const { width, height, left, top } = element.getBoundingClientRect();
        const docW = document.documentElement.clientWidth;
        const docH = document.documentElement.clientHeight;
        if (left + width > docW) {
          adjustX = left + width - docW;
        }
        if (top + height > docH) {
          adjustY = top + height - docH;
        }
      });
    }
  }

  $: handleClick = (ev: MouseEvent) => {
    if (element && !element.contains(ev.target as Node)) {
      onClose();
    }
  };

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
</script>

<svelte:window on:mousedown={handleClick} />

{#if shouldBeShown}
  <div
    bind:this={element}
    class="fixed left-0 z-1000 top-0 min-w-70 rounded-md bg-gray-50 shadow-md b b-black/10 p2"
    style={`
    top: ${y - adjustY}px;
    left: ${x - adjustX}px;
  `}
    on:contextmenu={(ev) => {
      ev.stopPropagation();
      ev.preventDefault();
    }}
  >
    {#if editMode}
      <CanConfigEl onCanChange={handleCanUpdate} canConfig={resolvedCan} />
    {:else}
      <CanConfigView canConfig={resolvedCan} />
    {/if}
    {#if editMode || resolvedCan.move || resolvedCan.duplicate || resolvedCan.remove}
      <div class="flex space-x-2 mb2">
        {#if editMode || resolvedCan.move}
          <ZConfig {onMoveZ} disabled={false} />
        {/if}

        {#if editMode || resolvedCan.duplicate}
          <button
            on:click={onDuplicate}
            use:tooltip={'Duplicate'}
            class="flexcc w-12 text-black/60 hover:text-main-600"
          >
            <CloneIcon />
          </button>
        {/if}
        {#if editMode || resolvedCan.remove}
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

    {#if editMode || resolvedCan.configurate}
      <svelte:component
        this={E[resolvedEl.type].ConfigMenu}
        el={resolvedEl}
        onUpdate={(el) => onUpdateEl({ ...el, uuid: resolvedEl.uuid })}
        gameSpace={GSS}
      />
    {/if}

    {#if clients.weave && (editMode || resolvedCan.attach || resolvedEl.wals.length > 0)}
      <WalsControls
        attachments={el.wals}
        onAddAttachment={handleAddAttachment}
        onRemoveAttachment={handleRemoveAttachment}
        canModify={editMode || resolvedCan.attach}
      />
    {/if}
  </div>
{/if}
