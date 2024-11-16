<script lang="ts">
  import PlayIcon from '~icons/fa6-solid/play';
  import LockIcon from '~icons/fa6-solid/lock';
  import EllipsisVIcon from '~icons/fa6-solid/ellipsis-vertical';
  import type { GameSpace } from '~/store';
  import { tooltip } from '~/shared/tooltip';
  import FloatingMenu from '~/shared/FloatingMenu.svelte';

  export let gameSpace: GameSpace;
  export let onPlay = () => {};
  export let isLocked: boolean;
  export let onEditCopy = () => {};
  export let onDuplicate = () => {};
  export let onEdit = () => {};
  export let onArchive = () => {};
  export let onDelete = () => {};
  export let onUnarchive = () => {};

  let menuOpen = false;
  let menuButtonEl: HTMLButtonElement;

  type MenuCommands = 'edit' | 'edit-copy' | 'duplicate' | 'archive' | 'delete' | 'unarchive';

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
    }
    menuOpen = false;
  }
</script>

<div class={'bg-white/10 h16  b b-white/10 rounded-md w-full flex relative'}>
  <button
    disabled={gameSpace.isArchived}
    class="flexcc group hover:bg-white/10 disabled:pointer-events-none flex-grow"
    on:click={gameSpace.isArchived ? null : onPlay}
  >
    <div class="h14 w14 flex-shrink-0 ml.5 relative b b-black/20 rounded-md overflow-hidden">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Blank_Go_board.svg/600px-Blank_Go_board.svg.png?20140621020717"
        alt=""
      />
      <div class="hidden group-hover:flexcc absolute inset-0 text-2xl text-main-900">
        <PlayIcon />
      </div>
    </div>
    {#if isLocked}
      <div
        class="flexcc absolute top-5.5 -left-1 text-sm text-black"
        use:tooltip={'This is a pre-set space and cannot be edited'}
      >
        <LockIcon />
      </div>
    {/if}
    <h2 class="flex flex-grow pl2 h16 items-center text-xl text-black/70 text-left">
      {gameSpace.name}
    </h2>
  </button>
  <button
    bind:this={menuButtonEl}
    on:click={() => (menuOpen = true)}
    class="w12 flex-shrink-0 bg-white/10 hover:bg-white/20 flexcc b-l b-white/10 h-full text-xl"
  >
    <EllipsisVIcon />
  </button>
</div>

{#if menuOpen}
  <FloatingMenu
    options={isLocked
      ? [
          ['edit-copy', 'Edit copy'],
          ['duplicate', 'Duplicate'],
        ]
      : gameSpace.isArchived
        ? [
            ['edit', 'Inspect'],
            ['unarchive', 'Unarchive'],
            ['delete', 'Delete'],
          ]
        : [
            ['edit', 'Edit'],
            ['duplicate', 'Duplicate'],
            ['archive', 'Archive'],
            ['delete', 'Delete'],
          ]}
    target={menuButtonEl}
    onCancel={() => (menuOpen = false)}
    onSelect={onSelectMenu}
  />
{/if}
