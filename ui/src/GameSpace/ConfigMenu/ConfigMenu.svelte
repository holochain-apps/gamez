<script lang="ts">
  import { onMount } from 'svelte';
  import TrashIcon from '~icons/fa6-solid/trash';

  import { type GElement, type LockConfig, type GameSpaceSyn } from '~/store';
  import LockConfigEl from './LockConfig.svelte';
  import ZConfig from './ZConfig.svelte';
  import WalsControls from './WalsControls.svelte';

  import * as E from '../elements';

  export let x: number;
  export let y: number;
  export let onUpdateEl: (el: Partial<GElement>) => void;
  export let onMoveZ: (z: 'top' | 'bottom' | 'up' | 'down') => void;
  export let onRemoveEl: () => void;
  export let onClose: () => void;
  export let el: GElement;
  export let gameSpace: GameSpaceSyn;

  $: permissions = gameSpace.permissions;
  $: resolvedLock = !$permissions.canEditComponents
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
    onUpdateEl({ uuid: el.uuid, lock: lockConfig });
  }

  async function handleAddAttachment(weaveUrl: string) {
    onUpdateEl({ uuid: el.uuid, wals: [...el.wals, weaveUrl] });
  }

  function handleRemoveAttachment(index: number) {
    const newWals = el.wals.filter((_, i) => i !== index);
    onUpdateEl({ uuid: el.uuid, wals: newWals });
  }

  $: resolvedEl = { ...el, lock: resolvedLock } as any;
</script>

<div
  bind:this={element}
  class="fixed left-0 top-0 min-w-70 rounded-md bg-gray-50 shadow-md b b-black/10 p2"
  style={`
    top: ${y}px;
    left: ${x}px;
  `}
>
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
  <LockConfigEl
    onLock={handleLockUpdate}
    lockConfig={el.lock}
    canEditLock={$permissions.canEditComponents}
  />

  <svelte:component
    this={E[resolvedEl.type].ConfigMenu}
    el={resolvedEl}
    onUpdate={(el) => onUpdateEl({ ...el, uuid: resolvedEl.uuid })}
    {gameSpace}
  />

  <WalsControls
    attachments={el.wals}
    onAddAttachment={handleAddAttachment}
    onRemoveAttachment={handleRemoveAttachment}
    locked={resolvedLock.wals}
  />
</div>
