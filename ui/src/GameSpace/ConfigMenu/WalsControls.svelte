<script lang="ts">
  import { type WeaveUrl, weaveUrlFromWal, weaveUrlToWAL, type WAL } from '@theweave/api';
  import AttachmentIcon from '~icons/fa6-solid/paperclip';
  import TrashIcon from '~icons/fa6-solid/trash';
  import CreateIcon from '~icons/fa6-solid/wand-magic-sparkles';
  import PocketIcon from '~icons/fa6-brands/get-pocket';
  import SearchIcon from '~icons/fa6-solid/magnifying-glass';
  import { hrlToString } from '@holochain-open-dev/utils';
  import clients from '~/clients';

  export let onAddAttachment: (WeaveUrl: string) => void;
  export let onRemoveAttachment: (index: number) => void;
  export let attachments: WeaveUrl[];
  export let canModify: boolean;

  async function handleAddAttachment(mode: 'create' | 'pocket' | 'search') {
    const wal = await clients.weave.assets.userSelectAsset(mode);
    if (wal) {
      const weaveUrl = weaveUrlFromWal(wal);
      onAddAttachment(weaveUrl);
    }
  }

  async function handleOpenWal(wal: WAL) {
    try {
      await clients.weave.openAsset(wal);
    } catch (e) {
      alert(`Error opening link: ${e}`);
    }
  }
</script>

{#if attachments.length || canModify}
  <div class="flexcs pb2 pt3">
    <AttachmentIcon class="mr2 ml1" /> <span class="text-lg">Attachments</span>
  </div>
  <div class="mt2 flex flex-col space-y-2">
    {#each attachments as attachment, index}
      {@const wal = weaveUrlToWAL(attachment)}
      <div class="flexcc">
        {#await clients.weave.assets.assetInfo(wal)}
          <div
            class="flex-grow"
            title={`Resolving WAL: ${hrlToString(wal.hrl)}?${JSON.stringify(wal.context)}`}
          >
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
              class="flex-grow bg-red/10 b b-black/10 rounded-md text-black/50 px2"
              title={`Failed to resolve WAL: ${hrlToString(wal.hrl)}?${JSON.stringify(wal.context)}`}
              >Bad WAL</div
            >
          {/if}
        {:catch error}
          <div class="text-red-500">Error getting asset info: {error}</div>
        {/await}
        {#if canModify}
          <button
            on:click={() => onRemoveAttachment(index)}
            class="ml2 h10 flexcc px2 hover:text-red-500 hover:bg-black/10 rounded-md"
          >
            <TrashIcon />
          </button>
        {/if}
      </div>
    {/each}
    {#if canModify}
      <div class="flex space-x-2">
        <button
          on:click={() => handleAddAttachment('search')}
          class="flexcc h10 px2 bg-black/10 w-full rounded-md b b-black/10 hover:bg-black/5"
        >
          <SearchIcon />
          <div class="flex-grow ml2">Search</div>
        </button>

        <button
          on:click={() => handleAddAttachment('pocket')}
          class="flexcc h10 px2 bg-black/10 w-full rounded-md b b-black/10 hover:bg-black/5"
        >
          <PocketIcon />
          <div class="flex-grow ml2">Pocket</div>
        </button>
        <button
          on:click={() => handleAddAttachment('create')}
          class="flexcc h10 px2 bg-black/10 w-full rounded-md b b-black/10 hover:bg-black/5"
        >
          <CreateIcon />
          <div class="flex-grow ml2">Create</div>
        </button>
      </div>
    {/if}
  </div>
{/if}
