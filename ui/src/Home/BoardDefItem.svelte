<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import GearIcon from '~icons/fa6-solid/gear';
  import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';

  import type { EntryHash } from '@holochain/client';

  import type { GamezStore } from '~/shared/store';

  import SidebarButton from './SidebarButton.svelte';

  const dispatch = createEventDispatcher();
  const { getStore }: any = getContext('gzStore');
  let store: GamezStore = getStore();

  export let boardHash: EntryHash;

  $: def = store.defs.get(boardHash);
</script>

<div>
  {#if $def.status == 'complete'}
    {@const boardData = $def.value}
    <div class="flexcc space-x-2">
      <div class="font-bold flex-grow">{boardData.board.name}</div>
      <SidebarButton
        mode={'sm'}
        on:click={() => {
          dispatch('create', boardData);
        }}
      >
        New Game
      </SidebarButton>
      <SidebarButton
        tooltip={'Settings'}
        mode={'icon'}
        on:click={() => dispatch('settings', boardData)}
      >
        <GearIcon />
      </SidebarButton>
    </div>
  {:else if $def.status == 'pending'}
    <div class="h-8 flex space-x-2">
      <sl-skeleton effect="pulse" class="h-8 flex-grow" style="--color: lightgray"></sl-skeleton>
      <sl-skeleton effect="pulse" class="h-8 w-20" style="--color: lightgray"></sl-skeleton>
      <sl-skeleton effect="pulse" class="h-8 w-8" style="--color: lightgray"></sl-skeleton>
    </div>
  {:else if $def.status == 'error'}
    <div class="bg-black/20 rounded-md text-white px4 py2">
      {$def.error || 'Unknown error'}
    </div>
  {/if}
</div>
