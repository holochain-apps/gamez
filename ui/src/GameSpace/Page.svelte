<script lang="ts">
  import cx from 'classnames';
  import { onMount } from 'svelte';
  import GearIcon from '~icons/fa6-solid/gear';
  import CubesIcon from '~icons/fa6-solid/cubes';
  import UsersIcon from '~icons/fa6-solid/users';
  import { getContext, GameSpaceSyn } from './store';
  import { type GameSpace } from './types.d';
  // import GameSpace from './GameSpace.svelte';

  let sidebar: 'none' | 'elementsLibrary' | 'configurator' = 'elementsLibrary';

  const store = getContext();

  let gameSpace: GameSpaceSyn;
  let gameSpaceState: GameSpace;
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

      console.log('Joined session', gameSpace.session);
    })();

    return () => {
      if (gameSpace) {
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
    <div class="flex-grow flexce space-x-2">
      <button class="bg-main-400 h10 px2 py1 rounded-md text-white">Join Game</button>
      <div class="h10 w10 rounded-full bg-blue-400 flexcc text-white">Plyr1</div>
      <div class="h10 w10 rounded-full bg-blue-400 flexcc text-white">Plyr2</div>
      <button class="h14 w14 flexcc bg-white/20 b b-black/10"><UsersIcon /></button>
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
