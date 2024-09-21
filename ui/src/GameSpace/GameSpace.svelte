<script lang="ts">
  import cx from 'classnames';
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import GearIcon from '~icons/fa6-solid/gear';
  import CubesIcon from '~icons/fa6-solid/cubes';
  import UsersIcon from '~icons/fa6-solid/users';
  import Avatar from '~/shared/Avatar.svelte';

  import { decodeHashFromBase64 } from '@holochain/client';

  import Input from './ui/Input.svelte';
  import ElementWrapper from './ElementWrapper.svelte';

  import { type GameSpaceSyn } from './store';
  import { GameSpace } from './types';
  import LayoutBar from '~/Layout/LayoutBar.svelte';
  import ElementsLibrary from './ElementsLibrary.svelte';

  export let gameSpace: GameSpaceSyn;
  let gameSpaceState: GameSpace;
  let participants: Uint8Array[] = [];
  $: canJoinGame = gameSpace.canJoinGame;
  $: canLeaveGame = gameSpace.canLeaveGame;
  $: isSteward = gameSpace.isSteward;

  let sidebar: 'none' | 'elementsLibrary' | 'configurator' = 'elementsLibrary';
  let showingParticipants = false;

  onMount(async () => {
    gameSpaceState = get(gameSpace.state);
    await gameSpace.join();

    gameSpace.state.subscribe((latestState) => {
      gameSpaceState = latestState;
    });

    gameSpace.session.participants.subscribe((allParticipants) => {
      participants = allParticipants.active;
    });
  });

  onDestroy(() => {
    gameSpace.leave();
  });

  const toggleSidebar = (value: typeof sidebar) => {
    if (sidebar === value) {
      sidebar = 'none';
    } else {
      sidebar = value;
    }
  };

  const toggleParticipants = () => {
    showingParticipants = !showingParticipants;
  };
</script>

<LayoutBar title={gameSpaceState.name || 'Game Space'} />
<div class="h-full flex flex-col">
  <div class="bg-main-700 h-14 flex">
    <button
      class={cx('h14 w14 flexcc b b-black/10', {
        'bg-black/30 text-white': sidebar === 'configurator',
        'bg-white/20': sidebar !== 'configurator',
      })}
      on:click={() => toggleSidebar('configurator')}><GearIcon /></button
    >
    {#if $isSteward}
      <button
        class={cx('h14 w14 flexcc b b-black/10', {
          'bg-black/30 text-white': sidebar === 'elementsLibrary',
          'bg-white/20': sidebar !== 'elementsLibrary',
        })}
        on:click={() => toggleSidebar('elementsLibrary')}><CubesIcon /></button
      >
    {/if}
    <div class="flex-grow flexce space-x-2 relative">
      {#if $canJoinGame}
        <button
          class="bg-main-400 h10 px2 py1 rounded-md text-white"
          on:click={() => {
            gameSpace.joinGame();
          }}>Join Game</button
        >
      {/if}
      {#if $canLeaveGame}
        <button
          class="bg-gray-400 h10 px2 py1 rounded-md text-white"
          on:click={() => {
            gameSpace.leaveGame();
          }}>Leave Game</button
        >
      {/if}
      {#if gameSpaceState}
        {#each gameSpaceState.players as player}
          <Avatar showNickname={false} size={32} agentPubKey={decodeHashFromBase64(player)} />
        {/each}
      {/if}
      <button
        class={cx('relative h14 w14 flexcc b b-black/10 ', {
          'bg-black/30 text-white': showingParticipants,
          'bg-white/20 hover:bg-white/30': !showingParticipants,
        })}
        on:click={toggleParticipants}
      >
        <UsersIcon />

        <div
          class="bg-red-500 text-sm text-white h4 w4 flexcc rounded-full absolute bottom-2 right-2"
        >
          {participants.length}
        </div>
      </button>
      {#if showingParticipants}
        <div class="bg-main-900 p4 rounded-bl-md top-full w-60 absolute flex flex-col space-y-2">
          <div>Sync Session Participants</div>
          {#each participants as participant}
            <div class="">
              <Avatar showNickname={true} size={32} agentPubKey={participant} />
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  <div class="flex flex-grow">
    {#if sidebar === 'elementsLibrary' && $isSteward}
      <ElementsLibrary onAdd={(el) => gameSpace.change({ type: 'add-element', element: el })} />
    {:else if sidebar === 'configurator'}
      <div class="w-60 bg-main-800 h-full flex-shrink-0">
        {#if gameSpaceState}
          <div class="h16 p2 relative bg-white/10 b b-black/10 flexcs">
            <div class="absolute right-2 top-1 opacity-50">Creator</div>
            <Avatar
              showNickname={true}
              size={32}
              agentPubKey={decodeHashFromBase64(gameSpaceState.creator)}
            />
          </div>
          <div class="p4 flex flex-col space-y-4">
            <Input
              value={gameSpaceState.name}
              label="Name"
              disabled={!$isSteward}
              onInput={(value) => {
                gameSpace.change({ type: 'set-name', name: value });
              }}
            />
            <label>
              <input
                type="checkbox"
                checked={gameSpaceState.isStewarded}
                disabled={!$isSteward}
                class="mr2"
                on:change={({ currentTarget }) => {
                  gameSpace.change({
                    type: 'set-is-stewarded',
                    isStewarded: currentTarget.checked,
                  });
                }}
              /> Stewarded?
            </label>
          </div>
        {/if}
      </div>
    {/if}
    <div class="flex-grow bg-main-400 bg-[url('/noise20.png')] relative">
      {#if gameSpaceState}
        {#each gameSpaceState.elements as element}
          <ElementWrapper el={element} />
        {/each}
      {/if}
    </div>
  </div>
</div>
