<script lang="ts">
  import PenIcon from '~icons/fa6-solid/pen';
  import WandIcon from '~icons/fa6-solid/wand-magic-sparkles';
  import EllipsisVIcon from '~icons/fa6-solid/ellipsis-vertical';
  import type { GameSpace } from '~/store';
  import { tooltip } from '~/shared/tooltip';
  import FloatingMenu from '~/shared/FloatingMenu.svelte';
  import MiniView from '~/GameSpace/MiniView.svelte';

  export let gameSpace: GameSpace;
  export let onPlay = () => {};
  export let isLocked: boolean;
  export let onEditCopy = () => {};
  export let onDuplicate = () => {};
  export let onEdit = () => {};
  export let onArchive = () => {};
  export let onDelete = () => {};
  export let onUnarchive = () => {};
  export let onExport = () => {};

  let menuOpen = false;
  let menuButtonEl: HTMLButtonElement;

  type MenuCommands =
    | 'edit'
    | 'edit-copy'
    | 'duplicate'
    | 'archive'
    | 'delete'
    | 'unarchive'
    | 'export';

  function onSelectMenu(command: MenuCommands) {
    switch (command) {
      case 'edit':
        onEdit();
        break;
      case 'edit-copy':
        onEditCopy();
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

  const btnClass =
    'bg-main-850 rounded-md size-full hover:(bg-main-900 scale-105 transition-none) transition-transform flexcc b b-white/20';
</script>

<div class="w-1/2 p1">
  <div class={'bg-main-800 w-full b b-white/20 rounded-md relative overflow-hidden shadow-sm'}>
    <div class="w-full h28">
      <MiniView {gameSpace} />
    </div>
    <h2 class="text-xl text-black/70 p1 text-center">
      {gameSpace.name}
    </h2>
    <div class="grid p1 grid-cols-3 gap-1 h12 text-xl">
      <button
        use:tooltip={'Enter edit mode'}
        on:click={() => (isLocked ? onEditCopy() : onEdit())}
        class={btnClass}
      >
        <PenIcon class="h50%" />
      </button>
      <button
        use:tooltip={'Create new space from this and enter'}
        on:click={gameSpace.isArchived ? null : onPlay}
        class={btnClass}
      >
        <WandIcon class="h50%" />
      </button>

      <button bind:this={menuButtonEl} on:click={() => (menuOpen = true)} class={btnClass}>
        <EllipsisVIcon class="h50%" />
      </button>
    </div>
  </div>
</div>

{#if menuOpen}
  <FloatingMenu
    options={isLocked
      ? [['duplicate', 'Duplicate']]
      : [
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
