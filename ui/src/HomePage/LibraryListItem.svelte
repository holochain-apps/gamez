<script lang="ts">
  import PenIcon from '~icons/fa6-solid/pen';
  import WandIcon from '~icons/fa6-solid/wand-magic-sparkles';
  import UnarchiveIcon from '~icons/fa6-solid/trash-can-arrow-up';
  import DeleteIcon from '~icons/fa6-solid/trash';
  import EyeIcon from '~icons/fa6-solid/eye';
  import EllipsisVIcon from '~icons/fa6-solid/ellipsis-vertical';
  import type { GameSpace } from '~/store';
  import { tooltip } from '~/shared/tooltip';
  import FloatingMenu from '~/shared/FloatingMenu.svelte';

  const {
    gameSpace,
    onPlay,
    isLocked,
    onEditCopy,
    onDuplicate,
    onEdit,
    onArchive,
    onDelete,
    onUnarchive,
    onExport,
  }: {
    gameSpace: GameSpace;
    isLocked: boolean;
    onPlay?: () => void;
    onEditCopy?: () => void;
    onDuplicate?: () => void;
    onEdit?: () => void;
    onArchive?: () => void;
    onDelete?: () => void;
    onUnarchive?: () => void;
    onExport?: () => void;
  } = $props();

  let menuOpen = $state<boolean>(false);
  let menuButtonEl = $state<HTMLButtonElement>(null!);

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
        onEdit?.();
        break;
      case 'edit-copy':
        onEditCopy?.();
        break;
      case 'duplicate':
        onDuplicate?.();
        break;
      case 'archive':
        onArchive?.();
        break;
      case 'delete':
        onDelete?.();
        break;
      case 'unarchive':
        onUnarchive?.();
        break;
      case 'export':
        onExport?.();
        break;
    }
    menuOpen = false;
  }
</script>

<div class={'bg-white/10 h16  b b-white/10 rounded-md w-full flex relative'}>
  <div class="flexcc flex-grow">
    <div class="h14 w14 flex-shrink-0 ml.5 relative b b-black/20 rounded-md overflow-hidden">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Blank_Go_board.svg/600px-Blank_Go_board.svg.png?20140621020717"
        alt=""
      />
      <div class="absolute inset-0 flexcc text-2xl text-white">{gameSpace.icon}</div>
    </div>
    <h2 class="flex flex-grow pl2 h16 items-center text-xl text-black/70 text-left">
      {gameSpace.name}
    </h2>
  </div>
  {#if !gameSpace.isArchived}
    <button
      use:tooltip={'Create new space from this and enter'}
      onclick={gameSpace.isArchived ? null : onPlay}
      class="w12 flex-shrink-0 bg-white/10 hover:bg-white/20 flexcc b-l b-white/10 h-full text-xl"
    >
      <WandIcon />
    </button>
    <button
      use:tooltip={'Enter edit mode'}
      onclick={() => (isLocked ? onEditCopy() : onEdit())}
      class="w12 flex-shrink-0 bg-white/10 hover:bg-white/20 flexcc b-l b-white/10 h-full text-xl"
    >
      <PenIcon />
    </button>

    <button
      bind:this={menuButtonEl}
      onclick={() => (menuOpen = true)}
      class="w12 flex-shrink-0 bg-white/10 hover:bg-white/20 flexcc b-l b-white/10 h-full text-xl"
    >
      <EllipsisVIcon />
    </button>
  {:else}
    <button
      use:tooltip={'Inspect space'}
      onclick={onEdit}
      class="w12 flex-shrink-0 bg-white/10 hover:bg-white/20 flexcc b-l b-white/10 h-full text-xl"
    >
      <EyeIcon />
    </button>
    <button
      use:tooltip={'Restore'}
      onclick={onUnarchive}
      class="w12 flex-shrink-0 bg-white/10 hover:bg-white/20 flexcc b-l b-white/10 h-full text-xl"
    >
      <UnarchiveIcon />
    </button>
    <button
      use:tooltip={'Delete permanently'}
      onclick={onDelete}
      class="w12 flex-shrink-0 bg-white/10 hover:bg-white/20 flexcc b-l b-white/10 h-full text-xl"
    >
      <DeleteIcon />
    </button>
  {/if}
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
