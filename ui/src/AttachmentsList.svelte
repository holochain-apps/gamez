<script lang="ts">
  import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
  import TrashIcon from '~icons/fa6-solid/trash';
  import { createEventDispatcher, getContext } from 'svelte';
  import type { GamezStore } from './store';
  import SvgIcon from './SvgIcon.svelte';
  import { weaveUrlToWAL, type WeaveUrl } from '@lightningrodlabs/we-applet';
  import { hrlToString } from '@holochain-open-dev/utils';

  const dispatch = createEventDispatcher();

  export let attachments: Array<WeaveUrl>;
  export let allowDelete = true;

  const { getStore }: any = getContext('gzStore');
  let store: GamezStore = getStore();
</script>

<div class="attachments-list">
  {#each attachments as attachment, index}
    {@const wal = weaveUrlToWAL(attachment)}
    <div class:attachment-item-with-delete={allowDelete} class:attachment-item={!allowDelete}>
      {#await store.weaveClient.assetInfo(wal)}
        <div
          style="cursor:pointer; padding: 0 5px 0 5px; margin-right:5px"
          title={`Resolving WAL: ${hrlToString(wal.hrl)}?${JSON.stringify(wal.context)}`}
        >
          ...</div
        >
      {:then data}
        {#if data}
          {@const assetInfo = data.assetInfo}
          <sl-button
            size="small"
            on:click={async (e) => {
              e.stopPropagation();
              try {
                //                embedLink = index
                await store.weaveClient.openWal(wal);
              } catch (e) {
                alert(`Error opening link: ${e}`);
              }
            }}
            style="display:flex;flex-direction:row;margin-right:5px"
            ><sl-icon src={assetInfo.icon_src} slot="prefix"></sl-icon>
            {assetInfo.name}
          </sl-button>
        {:else}
          <div
            style="color:red; cursor:pointer; padding: 0 5px 0 5px; border: dashed 1px;margin-right:5px"
            title={`Failed to resolve WAL: ${hrlToString(wal.hrl)}?${JSON.stringify(wal.context)}`}
            >Bad WAL</div
          >
        {/if}
      {:catch error}
        <div style="color:red">Error getting asset info: {error}</div>
      {/await}
      {#if allowDelete}
        <button
          class="flexcc text-white/60 hover:text-white"
          on:click={() => {
            dispatch('remove-attachment', index);
          }}
        >
          <TrashIcon />
        </button>
      {/if}
    </div>
  {/each}
</div>

<style>
  .attachments-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .attachment-item-with-delete {
    background-color: rgba(0, 0, 0, 0.25);
    padding: 4px;
    display: flex;
    margin-right: 4px;
    border-radius: 4px;
  }
</style>
