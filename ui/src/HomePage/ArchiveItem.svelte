<script lang="ts">
  import UnarchiveIcon from '~icons/fa6-solid/trash-can-arrow-up';
  import DeleteIcon from '~icons/fa6-solid/trash';
  import EyeIcon from '~icons/fa6-solid/eye';
  import type { GameSpaceSyn } from '~/store';
  import { tooltip } from '~/shared/tooltip';
  import MiniView from '~/GameSpace/MiniView.svelte';

  export let gameSpaceStore: GameSpaceSyn;
  export let onInspect: () => void;
  export let onDelete: () => void;
  export let onUnarchive: () => void;

  $: gameSpace = gameSpaceStore.state;

  const btnClass =
    'bg-main-850 rounded-md size-full hover:(bg-main-900 scale-105 transition-none) transition-transform flexcc b b-white/10';
</script>

{#if $gameSpace}
  <div class="p1 w-full">
    <div class="flex bg-main-800 w-full b b-white/10 rounded-md overflow-hidden shadow-sm">
      <div class="w-full h20 w20">
        <MiniView gameSpace={$gameSpace} />
      </div>
      <div class="flex-grow flex flex-col">
        <h2 class="text-xl text-black/70 p1 text-center">
          {$gameSpace.name}
        </h2>
        <div class="grid grid-cols-3 gap-1 flex-grow p1">
          <button use:tooltip={'Inspect space'} on:click={onInspect} class={btnClass}>
            <EyeIcon />
          </button>
          <button use:tooltip={'Restore'} on:click={onUnarchive} class={btnClass}>
            <UnarchiveIcon />
          </button>
          <button use:tooltip={'Delete permanently'} on:click={onDelete} class={btnClass}>
            <DeleteIcon />
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
