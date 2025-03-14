<script lang="ts">
  import DoorIcon from '~icons/fa6-solid/door-open';
  import EllipsisVIcon from '~icons/fa6-solid/ellipsis-vertical';
  import type { GameSpace } from '~/store';
  import FloatingMenu from '~/shared/FloatingMenu.svelte';
  import AgentAvatar from '~/shared/AgentAvatar.svelte';
  import { tooltip } from '~/shared/tooltip';
  import MiniView from '~/GameSpace/MiniView.svelte';

  export let gameSpace: GameSpace;
  export let onPlay = () => {};
  export let onEdit = () => {};
  export let onDuplicate = () => {};
  export let onArchive = () => {};
  export let onDelete = () => {};
  export let onUnarchive = () => {};
  export let onExport = () => {};

  let menuOpen = false;
  let menuButtonEl: HTMLButtonElement;

  type MenuCommands = 'duplicate' | 'edit' | 'archive' | 'delete' | 'unarchive' | 'export';

  function onSelectMenu(command: MenuCommands) {
    switch (command) {
      case 'edit':
        onEdit();
        break;
      case 'duplicate':
        onDuplicate();
        break;
      case 'archive':
        onArchive();
        break;
      case 'delete':
        onDelete();
        break;
      case 'export':
        onExport();
        break;
    }
    menuOpen = false;
  }

  const btnClass =
    'bg-main-850 rounded-md size-full hover:(bg-main-900 scale-105 transition-none) transition-transform flexcc b b-white/20';
</script>

<div class={'bg-main-800 b b-white/20 rounded-md flex shadow-sm overflow-hidden'}>
  <div class="h28 w28 flex-shrink-0 relative rounded-md overflow-hidden">
    <MiniView {gameSpace} />
  </div>
  <div class="flex-grow h-full flex flex-col">
    <div class="flex">
      <h2 class="text-xl p2 text-black/70 text-left flex-grow overflow-hidden">
        {gameSpace.name}
      </h2>
      <div class="flex flex-shrink-0 w-30 p1 space-x-1 h12">
        <button on:click={onPlay} use:tooltip={'Enter space'} class={btnClass}>
          <DoorIcon />
        </button>
        <button bind:this={menuButtonEl} on:click={() => (menuOpen = true)} class={btnClass}>
          <EllipsisVIcon />
        </button>
      </div>
    </div>
    <div class="flex-grow"></div>
    <div class="text-left flexcs p2">
      <div use:tooltip={'Space creator'}>
        <AgentAvatar
          class="outline outline-2 outline-yellow-400"
          pubKey={gameSpace.creator}
          size={24}
        />
      </div>
      <div
        use:tooltip={'Players slots'}
        class="bg-main-500 b b-black/10 flex rounded-md p.5 space-x-.5 ml2"
      >
        {#each gameSpace.playersSlots as playerSlot, i}
          <div class="bg-main-700 shadow-inset relative rounded-full h5 w5 flexcc">
            {#if playerSlot.pubKey}
              <AgentAvatar class="relative z-20" pubKey={playerSlot.pubKey} size={16} />
            {/if}
            <div class="absolute inset-0 z-10 text-xs text-main-500 font-light flexcc">{i + 1}</div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

{#if menuOpen}
  <FloatingMenu
    options={[
      ['duplicate', 'Duplicate'],
      ['export', 'Export'],
      ['archive', 'Archive'],
      ['delete', 'Delete'],
    ]}
    target={menuButtonEl}
    onCancel={() => (menuOpen = false)}
    onSelect={onSelectMenu}
  />
{/if}
