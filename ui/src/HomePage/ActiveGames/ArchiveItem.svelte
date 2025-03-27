<script lang="ts">
  import DoorIcon from '~icons/fa6-solid/door-open';
  import EllipsisVIcon from '~icons/fa6-solid/ellipsis-vertical';
  import UnarchiveIcon from '~icons/fa6-solid/trash-can-arrow-up';
  import DeleteIcon from '~icons/fa6-solid/trash';
  import EyeIcon from '~icons/fa6-solid/eye';
  import type { GameSpace } from '~/store';
  import FloatingMenu from '~/center/input/FloatingMenu.svelte';
  import AgentAvatar from '~/center/static/AgentAvatar.svelte';
  import { tooltip } from '~/center/lib/tooltip';
  import MiniView from '~/Surface/MiniView.svelte';

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
      case 'unarchive':
        onUnarchive();
        break;
      case 'export':
        onExport();
        break;
    }
    menuOpen = false;
  }
</script>

<div class={'bg-white/10 h20  b b-white/10 rounded-md w-full flex relative'}>
  <div class="flexcc flex-grow">
    <div class="h18 w18 flex-shrink-0 ml.5 relative b b-black/20 rounded-md overflow-hidden">
      <MiniView {gameSpace} />
    </div>
    <div class="flex flex-col flex-grow pl2 py1 h-full">
      <h2 class="text-xl text-black/70 text-left">
        {gameSpace.name}
      </h2>
      <div class="flex-grow"></div>
      <div class="text-left flexcs">
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
              <div class="absolute inset-0 z-10 text-xs text-main-500 font-light flexcc"
                >{i + 1}</div
              >
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
  {#if gameSpace.isArchived}
    <button
      use:tooltip={'Inspect space'}
      on:click={onEdit}
      class="w12 flex-shrink-0 bg-white/10 hover:bg-white/20 flexcc b-l b-white/10 h-full text-xl"
    >
      <EyeIcon />
    </button>
    <button
      use:tooltip={'Restore'}
      on:click={onUnarchive}
      class="w12 flex-shrink-0 bg-white/10 hover:bg-white/20 flexcc b-l b-white/10 h-full text-xl"
    >
      <UnarchiveIcon />
    </button>
    <button
      use:tooltip={'Delete permanently'}
      on:click={onDelete}
      class="w12 flex-shrink-0 bg-white/10 hover:bg-white/20 flexcc b-l b-white/10 h-full text-xl"
    >
      <DeleteIcon />
    </button>
  {:else}
    <button
      on:click={onPlay}
      use:tooltip={'Enter space'}
      class="w12 flex-shrink-0 bg-white/10 hover:bg-white/20 flexcc b-l b-white/10 h-full text-xl"
    >
      <DoorIcon />
    </button>
    <button
      bind:this={menuButtonEl}
      on:click={() => (menuOpen = true)}
      class="w12 flex-shrink-0 bg-white/10 hover:bg-white/20 flexcc b-l b-white/10 h-full text-xl"
    >
      <EllipsisVIcon />
    </button>
  {/if}
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
