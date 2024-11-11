<script lang="ts">
  import EllipsisIcon from '~icons/fa6-solid/ellipsis';
  import { derived } from 'svelte/store';
  import cx from 'classnames';

  import { encodeHashToBase64 } from '@holochain/client';

  import { type GameSpaceSyn, getContext } from '~/store';
  import { nav } from '~/lib/routes';
  import FloatingMenu from '~/shared/FloatingMenu.svelte';

  import PlayerStatus from './PlayerStatus.svelte';
  import { tooltip } from '~/shared/tooltip';

  export let gameSpace: GameSpaceSyn;
  $: state = gameSpace.state; // <GamesList> ensures the state is initialized, not null

  const { cloneGameSpace, deleteGameSpace } = getContext();

  type PlayerStatus = {
    inRoom: boolean;
    isPlaying: boolean;
    isCreator: boolean;
  };
  let playersStatus = derived(
    [gameSpace.state, gameSpace.participants],
    ([$state, $participants]) => {
      let P: { [key: string]: PlayerStatus } = {};
      let inRoomAgents = ($participants?.active || []).map(encodeHashToBase64);
      [$state.creator, ...$state.players, ...inRoomAgents].forEach((agent) => {
        if (!P[agent]) {
          P[agent] = { inRoom: false, isPlaying: false, isCreator: false };
        }
      });
      P[$state.creator].isCreator = true;
      $state.players.forEach((agent) => {
        P[agent].isPlaying = true;
      });
      inRoomAgents.forEach((agent) => {
        P[agent].inRoom = true;
      });
      return P;
    },
  );

  let menuButtonEl: HTMLButtonElement;
  let menuOpen = false;
  let MENU_ITEMS: [string, string][];
  $: MENU_ITEMS = {
    active: [
      ['clone', 'Clone'],
      ['draft', 'To Draft'],
      ['archive', 'To Archive'],
      ['export', 'Export'],
      ['delete', 'Delete'],
    ],
    library: [
      ['clone', 'Clone'],
      ['draft', 'To Draft'],
      ['archive', 'To Archive'],
      ['export', 'Export'],
      ['delete', 'Delete'],
    ],
    draft: [
      ['clone', 'Clone'],
      ['active', 'To Active'],
      ['library', 'To Library'],
      ['archive', 'To Archive'],
      ['export', 'Export'],
      ['delete', 'Delete'],
    ],
    archived: [
      ['active', 'To Active'],
      ['library', 'To Library'],
      ['draft', 'To Draft'],
      ['delete', 'Delete'],
    ],
  }[$state.status];

  async function onSelectMenu(item: string) {
    switch (item) {
      case 'clone':
        await cloneGameSpace(gameSpace.hash);
        break;
      case 'active':
        gameSpace.change({ type: 'set-status', status: 'active' }, true);
        break;
      case 'library':
        gameSpace.change({ type: 'set-status', status: 'library' }, true);
        break;
      case 'draft':
        gameSpace.change({ type: 'set-status', status: 'draft' }, true);
        break;
      case 'archive':
        gameSpace.change({ type: 'set-status', status: 'archived' }, true);
        break;
      case 'delete':
        await deleteGameSpace(gameSpace.hash);
        break;
      case 'export':
        gameSpace.exportAsJson();
        break;
    }
    menuOpen = false;
  }
  function onCancelMenu() {
    menuOpen = false;
  }
  function onOpenMenu() {
    menuOpen = true;
  }

  async function onCreateFromLibrary() {
    const newHash = await cloneGameSpace(gameSpace.hash, { status: 'draft', name: $state.name });
    nav({ id: 'gameSpace', gameSpaceHash: newHash });
  }
</script>

<div
  class={cx('bg-white/10 p2 b b-white/10 rounded-md max-w-screen-sm mx-auto w-full flex', {
    'opacity-80': $state.status === 'draft',
  })}
>
  <div class="h32 w32 flex-shrink-0 mr2 relative">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Blank_Go_board.svg/600px-Blank_Go_board.svg.png?20140621020717"
      alt=""
    />
    {#if $state.status === 'draft'}
      <div
        use:tooltip={'Only you can see this space'}
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-500 text-white rounded-md px2 py1 b b-black/10"
      >
        DRAFT
      </div>
    {:else if $state.status === 'archived'}
      <div
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-500 text-white rounded-md px2 py1 b b-black/10"
      >
        ARCHIVED
      </div>
    {/if}
  </div>
  <div class="flex flex-col flex-grow">
    <div class="flexcs w-full h-8">
      <h2 class="text-xl flex-grow text-black/70">{$state.name}</h2>

      <button
        bind:this={menuButtonEl}
        on:click={onOpenMenu}
        class="flexcc bg-main-500 hover:bg-main-600 rounded-md h8 w8 b b-black/10 text-white"
      >
        <EllipsisIcon />
      </button>
    </div>
    <div class="flex-grow"></div>
    <div class="flex">
      <div class="flexcs flex-grow h8">
        <div
          class="text-sm mt1 mr2 bg-main-500 shadow-[inset_0_1px_0_#0003,inset_0_-1px_0_#fff8,inset_0_0_3px_#0005] bg-gradient-to-b from-white/10 to-white-0 rounded-full px2 py1 mr1 text-white/80"
          >{$state.players.length}/{$state.minMaxPlayers[1]}</div
        >

        {#each Object.entries($playersStatus) as [agent, { inRoom, isPlaying, isCreator }] (agent)}
          <PlayerStatus {agent} {inRoom} {isPlaying} {isCreator} />
        {/each}
      </div>
      {#if $state.status === 'library'}
        <button
          on:click={onCreateFromLibrary}
          class="flexcc bg-main-500 hover:bg-main-600 rounded-md h8 px2 mr2 b b-black/10 text-white uppercase text-sm tracking-wider"
          >Use as template</button
        >
      {/if}
      <button
        on:click={() => nav({ id: 'gameSpace', gameSpaceHash: gameSpace.hash })}
        class="h-full bg-main-500 hover:bg-main-600 b b-black/10 rounded-md uppercase text-sm tracking-wider px2 text-white"
        >Enter space</button
      >
    </div>
  </div>
</div>
{#if menuOpen}
  <FloatingMenu
    options={MENU_ITEMS}
    target={menuButtonEl}
    onCancel={onCancelMenu}
    onSelect={onSelectMenu}
  />
{/if}
