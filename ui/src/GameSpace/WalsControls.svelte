<script lang="ts">
  import { type WeaveUrl, weaveUrlFromWal, weaveUrlToWAL, type WAL } from '@theweave/api';
  import AttachmentIcon from '~icons/fa6-solid/paperclip';
  import TrashIcon from '~icons/fa6-solid/trash';
  import { getContext } from './store/store';
  import { hrlToString } from '@holochain-open-dev/utils';

  export let onAddAttachment: (WeaveUrl: string) => void;
  export let onRemoveAttachment: (index: number) => void;
  export let attachments: WeaveUrl[];
  export let locked: boolean;

  const store = getContext();

  async function handleAddAttachment() {
    if (store.weaveClient) {
      const wal = await store.weaveClient.userSelectWal();
      if (wal) {
        const weaveUrl = weaveUrlFromWal(wal);
        onAddAttachment(weaveUrl);
      }
    }
  }

  async function handleOpenWal(wal: WAL) {
    try {
      await store.weaveClient.openWal(wal);
    } catch (e) {
      alert(`Error opening link: ${e}`);
    }
  }
</script>

{#if store.weaveClient}
  <div class="mt2 flex flex-col space-y-2">
    {#each attachments as attachment, index}
      {@const wal = weaveUrlToWAL(attachment)}
      <div class="flexcc">
        {#await store.weaveClient.assetInfo(wal)}
          <div title={`Resolving WAL: ${hrlToString(wal.hrl)}?${JSON.stringify(wal.context)}`}>
            ...</div
          >
        {:then data}
          {#if data}
            {@const assetInfo = data.assetInfo}
            <button
              on:click={() => handleOpenWal(wal)}
              class="flex-grow flexcc rounded-md px2 h10 bg-black/10 b b-black/10 hover:bg-black/5"
            >
              <img src={assetInfo.icon_src} alt={assetInfo.name} class="w6 h6 mr2" />
              <div class="flex-grow text-left">{assetInfo.name}</div>
            </button>
          {:else}
            <div
              title={`Failed to resolve WAL: ${hrlToString(wal.hrl)}?${JSON.stringify(wal.context)}`}
              >Bad WAL</div
            >
          {/if}
        {:catch error}
          <div class="text-red-500">Error getting asset info: {error}</div>
        {/await}
        {#if !locked}
          <button
            on:click={() => onRemoveAttachment(index)}
            class="ml2 h10 flexcc px2 hover:text-red-500 hover:bg-black/10 rounded-md"
          >
            <TrashIcon />
          </button>
        {/if}
      </div>
    {/each}
    {#if !locked}
      <button
        on:click={handleAddAttachment}
        class="flexcc h10 px2 bg-black/10 w-full rounded-md b b-black/10 hover:bg-black/5"
      >
        <AttachmentIcon />
        <div class="flex-grow">Add attachment</div>
      </button>
    {/if}
  </div>
{/if}
