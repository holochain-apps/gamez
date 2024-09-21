<script lang="ts">
  import cx from 'classnames';
  import { onMount } from 'svelte';
  import GearIcon from '~icons/fa6-solid/gear';
  import CubesIcon from '~icons/fa6-solid/cubes';
  import UsersIcon from '~icons/fa6-solid/users';
  import { getContext, GameSpaceSyn } from './store';
  import { type GameSpace } from './types.d';
  import Avatar from '~/shared/Avatar.svelte';
  import LayoutBar from '~/Layout/LayoutBar.svelte';
  import { getStoreContext } from '~/lib/context';
  // import GameSpace from './GameSpace.svelte';

  import Input from './ui/Input.svelte';
  import { decodeHashFromBase64 } from '@holochain/client';

  let sidebar: 'none' | 'elementsLibrary' | 'configurator' = 'elementsLibrary';
  let showingParticipants = false;

  const store = getContext();
  const oldStore = getStoreContext();

  let gameSpace: GameSpaceSyn;
  let gameSpaceState: GameSpace;
  let participants: Uint8Array[] = [];
  $: canJoinGame = gameSpace?.canJoinGame;
  $: canLeaveGame = gameSpace?.canLeaveGame;

  // let gameSpaces: any;
  onMount(() => {
    (async () => {
      // If there is no game space, create one
      const gameSpaces = await store.getAllGameSpaces();
      if (gameSpaces.size === 0) {
        gameSpace = await store.createGameSpace();
      } else {
        gameSpace = gameSpaces.values().next().value;
      }

      await gameSpace.join();

      gameSpace.state.subscribe((state) => {
        gameSpaceState = state;
      });

      gameSpace.session.participants.subscribe((allParticipants) => {
        participants = allParticipants.active;
      });

      console.log('Joined session', gameSpace.session);
    })();

    return () => {
      if (gameSpace) {
        console.log('Leaving!');
        gameSpace.leave();
      }
    };
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

  $: console.log('Game Space!', gameSpace);

  $: participantIsSteward =
    gameSpaceState &&
    (!gameSpaceState.isStewarded || gameSpaceState.creator === oldStore.myAgentPubKeyB64);
</script>

<LayoutBar title={gameSpaceState?.name || 'Game Space'} />
<div class="h-full flex flex-col">
  <div class="bg-main-700 h-14 flex">
    <button
      class={cx('h14 w14 flexcc b b-black/10', {
        'bg-black/30 text-white': sidebar === 'configurator',
        'bg-white/20': sidebar !== 'configurator',
      })}
      on:click={() => toggleSidebar('configurator')}><GearIcon /></button
    >
    {#if participantIsSteward}
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
    {#if sidebar === 'elementsLibrary'}
      <div class="w-60 bg-main-800 h-full">Elements Library</div>
    {:else if sidebar === 'configurator'}
      <div class="w-60 bg-main-800 h-full">
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
              disabled={!participantIsSteward}
              onInput={(value) => {
                gameSpace.change({ type: 'set-name', name: value });
              }}
            />
            <label>
              <input
                type="checkbox"
                checked={gameSpaceState.isStewarded}
                disabled={!participantIsSteward}
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
    <div class="flex-grow bg-main-400 bg-[url('/noise20.png')]"></div>
  </div>
</div>
