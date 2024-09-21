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
  import * as elements from './elements';
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
  $: isSteward = gameSpace?.isSteward;

  type LibraryElement = {
    elementType: string;
    label: string;
    icon: string;
    initialWidth: number;
    initialHeight: number;
  };

  const LIBRARY: LibraryElement[] = [
    {
      elementType: 'Piece',
      label: 'Piece',
      icon: '♟',
      initialHeight: 30,
      initialWidth: 30,
    },
    {
      elementType: 'Image',
      label: 'Image',
      icon: '🖼',
      initialHeight: 250,
      initialWidth: 250,
    },
  ];

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

  function addElement(type: LibraryElement) {
    if (type.elementType === 'Piece') {
      gameSpace.change({
        type: 'add-element',
        element: {
          type: 'Piece',
          uuid: '',
          version: 1,
          x: 0,
          y: 0,
          z: 0,
          width: type.initialWidth,
          height: type.initialHeight,
          wals: [],
          display: { mode: 'emoji', value: '🔥' },
        },
      });
    } else if (type.elementType === 'Image') {
      gameSpace.change({
        type: 'add-element',
        element: {
          type: 'Image',
          uuid: '',
          version: 1,
          x: 0,
          y: 0,
          z: 0,
          width: type.initialWidth,
          height: type.initialHeight,
          wals: [],
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chessboard_green_squares.svg/512px-Chessboard_green_squares.svg.png',
        },
      });
    }
  }
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
      <div class="w-60 bg-main-800 h-full p2 space-y-2 flex-shrink-0">
        {#each LIBRARY as libraryElement}
          <button
            class="b b-black/10 rounded-md bg-black/5 flexcc w-full"
            on:click={() => addElement(libraryElement)}
          >
            <div class="text-4xl h12 w12 flexcc">{libraryElement.icon}</div>
            <div class="flex-grow text-left text-lg">{libraryElement.label}</div>
          </button>
        {/each}
      </div>
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
    <div class="flex-grow bg-main-400 bg-[url('/noise20.png')]">
      {#if gameSpaceState}
        {#each gameSpaceState.elements as element}
          {#if element.type === 'Piece'}
            <svelte:component this={elements.Piece} el={element} />
          {:else if element.type === 'Image'}
            <svelte:component this={elements.Image} el={element} />
          {/if}
        {/each}
      {/if}
    </div>
  </div>
</div>
