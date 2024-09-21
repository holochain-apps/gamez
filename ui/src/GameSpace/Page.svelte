<script lang="ts">
  import cx from 'classnames';
  import { onMount } from 'svelte';
  import GearIcon from '~icons/fa6-solid/gear';
  import CubesIcon from '~icons/fa6-solid/cubes';
  import UsersIcon from '~icons/fa6-solid/users';
  import { getContext, GameSpaceSyn } from './store';
  import { type GameSpace } from './types.d';
  import Avatar from '~/shared/Avatar.svelte';
  // import GameSpace from './GameSpace.svelte';

  let sidebar: 'none' | 'elementsLibrary' | 'configurator' = 'elementsLibrary';
  let showingParticipants = false;

  const store = getContext();

  let gameSpace: GameSpaceSyn;
  let gameSpaceState: GameSpace;
  let participants: Uint8Array[] = [];
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
</script>

<div class="h-full flex flex-col">
  <div class="bg-main-700 h-14 flex">
    <button
      class={cx('h14 w14 flexcc b b-black/10', {
        'bg-black/30 text-white': sidebar === 'elementsLibrary',
        'bg-white/20': sidebar !== 'elementsLibrary',
      })}
      on:click={() => toggleSidebar('elementsLibrary')}><CubesIcon /></button
    >
    <button
      class={cx('h14 w14 flexcc b b-black/10', {
        'bg-black/30 text-white': sidebar === 'configurator',
        'bg-white/20': sidebar !== 'configurator',
      })}
      on:click={() => toggleSidebar('configurator')}><GearIcon /></button
    >
    <div class="flex-grow flexce space-x-2 relative">
      <button class="bg-main-400 h10 px2 py1 rounded-md text-white">Join Game</button>
      <div class="h10 w10 rounded-full bg-blue-400 flexcc text-white">Plyr1</div>
      <div class="h10 w10 rounded-full bg-blue-400 flexcc text-white">Plyr2</div>
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
          <div>Name: {gameSpaceState.name}</div>
          <input
            type="text"
            value={gameSpaceState.name}
            on:input={({ currentTarget }) => {
              gameSpace.change({ type: 'set-name', name: currentTarget.value });
            }}
          />
        {/if}
      </div>
    {/if}
    <div class="flex-grow bg-main-400 bg-[url('/noise20.png')]"></div>
  </div>
</div>
