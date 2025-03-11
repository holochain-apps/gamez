<script lang="ts">
  import CaretIcon from '~icons/fa6-solid/caret-down';
  import { getContext, type GameSpace } from '~/store';
  import GamesListItem from './GamesListItem.svelte';
  import R from '~/lib/routes.svelte';
  import { cx } from '~/lib/util';
  import clients from '~/clients';

  const S = getContext();

  async function handlePlay(gameSpaceHash: string) {
    R.nav({ id: 'gameSpace', gameSpaceHash });
  }

  async function handleDuplicate(hash: string) {
    const gameSpace = S.gameSpaces[hash];
    const newGameSpace: GameSpace = {
      ...gameSpace,
      name: `Copy of ${gameSpace.name}`,
      creator: clients.agentKeyB64,
    };
    return await S.cmd('create-gamespace', newGameSpace);
  }

  async function handleDelete(gameSpaceHash: string) {
    await S.cmd('delete-gamespace', gameSpaceHash);
  }

  async function handleArchive(hash: string) {
    await S.cmd('archive', hash);
  }

  async function handleUnarchive(hash: string) {
    await S.cmd('unarchive', hash);
  }

  async function handleExport(hash: string) {
    await S.cmd('export-as-json', hash);
  }

  let showArchive = $state<boolean>(false);
</script>

<div class="flex flex-col px2 pt2 space-y-2 h-full">
  {#each Object.entries(S.gameSpaces) as [hash, gameSpace] (hash)}
    <GamesListItem
      {gameSpace}
      onPlay={() => handlePlay(hash)}
      onDuplicate={() => handleDuplicate(hash)}
      onArchive={() => handleArchive(hash)}
      onDelete={() => handleDelete(hash)}
      onExport={() => handleExport(hash)}
    />
  {/each}

  <div class="flex-grow"></div>
  {#if Object.keys(S.archivedGameSpaces).length > 0}
    <button
      class="bg-main-200 -mx-2 p2 pr3 text-white flexcc text-left"
      onclick={() => (showArchive = !showArchive)}
    >
      <div class="flex-grow">Archive</div>
      <CaretIcon class={cx('transition-transform', { 'rotate-180': !showArchive })} />
    </button>
    {#if showArchive}
      <div class="flex flex-col pb2 space-y-2">
        {#each Object.entries(S.archivedGameSpaces) as [hash, gameSpace] (hash)}
          <GamesListItem
            {gameSpace}
            onEdit={() => handlePlay(hash)}
            onUnarchive={() => handleUnarchive(hash)}
            onDelete={() => handleDelete(hash)}
          />
        {/each}
      </div>
    {/if}
  {/if}
</div>
