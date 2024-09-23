<script lang="ts">
  import cx from 'classnames';
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import GearIcon from '~icons/fa6-solid/gear';
  import CubesIcon from '~icons/fa6-solid/cubes';
  import Avatar from '~/shared/Avatar.svelte';

  import { decodeHashFromBase64 } from '@holochain/client';

  import Input from './ui/Input.svelte';
  import ElementWrapper from './ElementWrapper.svelte';
  import Surface from './Surface.svelte';

  import { type GameSpaceSyn } from './store';
  import { type GameSpace } from './types.d';
  import LayoutBar from '~/Layout/LayoutBar.svelte';
  import ElementsLibrary from './ElementsLibrary.svelte';
  import PeopleBar from './PeopleBar.svelte';

  export let gameSpace: GameSpaceSyn;
  $: state = get(gameSpace.state);
  $: participants = [] as Uint8Array[];
  $: canJoinGame = gameSpace.canJoinGame;
  $: canLeaveGame = gameSpace.canLeaveGame;
  $: isSteward = gameSpace.isSteward;

  let sidebar: 'none' | 'elementsLibrary' | 'configurator' = 'elementsLibrary';

  onMount(async () => {
    await gameSpace.join();

    gameSpace.state.subscribe((latestState) => {
      state = latestState;
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

  $: console.log('Is steward?', $isSteward);
</script>

{#if state}
  <LayoutBar title={state.name || 'Game Space'} />
  <div class="h-full flex flex-col">
    <div class="bg-main-700 h-14 flex relative">
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

      <PeopleBar
        canJoinGame={$canJoinGame}
        canLeaveGame={$canLeaveGame}
        players={state.players}
        {participants}
        onJoin={() => gameSpace.join()}
        onLeave={() => gameSpace.leave()}
      />
    </div>
    <div class="flex flex-grow">
      {#if sidebar === 'elementsLibrary' && $isSteward}
        <ElementsLibrary onAdd={(el) => gameSpace.change({ type: 'add-element', element: el })} />
      {:else if sidebar === 'configurator'}
        <div class="w-60 bg-main-800 h-full flex-shrink-0">
          {#if state}
            <div class="h16 p2 relative bg-white/10 b b-black/10 flexcs">
              <div class="absolute right-2 top-1 opacity-50">Creator</div>
              <Avatar
                showNickname={true}
                size={32}
                agentPubKey={decodeHashFromBase64(state.creator)}
              />
            </div>
            <div class="p4 flex flex-col space-y-4">
              <Input
                value={state.name}
                label="Name"
                disabled={!$isSteward}
                onInput={(value) => {
                  gameSpace.change({ type: 'set-name', name: value });
                }}
              />
              <label>
                <input
                  type="checkbox"
                  checked={state.isStewarded}
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
      <Surface
        elements={state.elements}
        onMoveElement={(uuid, x, y, z) => {
          gameSpace.change({ type: 'move-element', uuid, x, y, z });
        }}
      />
    </div>
  </div>
{/if}
