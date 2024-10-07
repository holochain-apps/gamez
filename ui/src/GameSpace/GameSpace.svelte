<script lang="ts">
  import cx from 'classnames';
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import GearIcon from '~icons/fa6-solid/gear';
  import CubesIcon from '~icons/fa6-solid/cubes';

  import Surface from './Surface.svelte';

  import { type GameSpace, type GElement } from './types.d';
  import { type GameSpaceSyn } from './store/GameSpaceSyn';
  import { type LibraryElement, createElement } from './store/library';
  import LayoutBar from '~/Layout/LayoutBar.svelte';
  import PeopleBar from './topbar/PeopleBar.svelte';
  import SidebarToggleButton from './topbar/SidebarToggleButton.svelte';
  import ElementsLibrary from './sidebar/ElementsLibrary.svelte';
  import SpaceConfigurator from './sidebar/SpaceConfigurator.svelte';
  import ConfigMenu from './ConfigMenu';

  export let gameSpace: GameSpaceSyn;
  $: state = get(gameSpace.state);
  $: participants = [] as Uint8Array[];
  $: canJoinGame = gameSpace.canJoinGame;
  $: canLeaveGame = gameSpace.canLeaveGame;
  $: isSteward = gameSpace.isSteward;
  $: isCreator = state.creator === gameSpace.pubKeyB64;
  $: isPlaying = $canLeaveGame;

  let sidebar: 'none' | 'elementsLibrary' | 'configurator' = 'elementsLibrary';

  onMount(async () => {
    await gameSpace.joinSession();

    gameSpace.state.subscribe((latestState) => {
      state = latestState;
    });

    gameSpace.session.participants.subscribe((allParticipants) => {
      participants = allParticipants.active;
    });
  });

  onDestroy(() => {
    gameSpace.leaveSession();
  });

  const toggleSidebar = (value: typeof sidebar) => {
    if (sidebar === value) {
      sidebar = 'none';
    } else {
      sidebar = value;
    }
  };

  let contextMenuState: { id: string; x: number; y: number } | null = null;
  function handleContextMenu(id: string, x: number, y: number) {
    contextMenuState = { id, x, y };
  }

  function closeContextMenu() {
    contextMenuState = null;
  }

  function handleUpdateElement(el: Partial<GElement>) {
    gameSpace.change({ type: 'update-element', element: { ...el } });
  }

  function handleRemoveElement(id: string) {
    gameSpace.change({ type: 'remove-element', uuid: id });
  }

  // Handle closing the context menu if an item was deleted
  $: {
    if (contextMenuState && !state.elements.find((e) => e.uuid === contextMenuState.id)) {
      closeContextMenu();
    }
  }

  let surfaceEl: Surface;
  function handleAddElementFromLibrary(element: LibraryElement, x?: number, y?: number) {
    const surfaceCoords =
      x && y ? surfaceEl.getSurfaceCoordinates(x, y) : surfaceEl.getCurrentCenter();
    console.log('SURFACE COORDs', surfaceCoords);
    if (surfaceCoords) {
      gameSpace.change({
        type: 'add-element',
        element: createElement(element, surfaceCoords.x, surfaceCoords.y),
      });
    }
  }
</script>

{#if state}
  <LayoutBar title={state.name || 'Game Space'} />
  <div class="h-full flex flex-col">
    <div class="bg-main-700 h-14 flex relative">
      <SidebarToggleButton current={sidebar} value="configurator" onClick={toggleSidebar}>
        <GearIcon />
      </SidebarToggleButton>
      {#if $isSteward}
        <SidebarToggleButton current={sidebar} value="elementsLibrary" onClick={toggleSidebar}>
          <CubesIcon />
        </SidebarToggleButton>
      {/if}

      <PeopleBar
        canJoinGame={$canJoinGame}
        canLeaveGame={$canLeaveGame}
        players={state.players}
        {participants}
        onJoin={() => gameSpace.joinGame()}
        onLeave={() => gameSpace.leaveGame()}
      />
    </div>
    <div class="flex flex-grow">
      {#if sidebar === 'elementsLibrary' && $isSteward}
        <ElementsLibrary onAdd={handleAddElementFromLibrary} />
      {:else if sidebar === 'configurator'}
        {#if state}
          <SpaceConfigurator
            isSteward={$isSteward}
            creator={state.creator}
            name={state.name}
            onNameChange={(name) => gameSpace.change({ type: 'set-name', name })}
            isStewarded={state.isStewarded}
            onIsStewardedChange={(isStewarded) =>
              gameSpace.change({ type: 'set-is-stewarded', isStewarded })}
          />
        {/if}
      {/if}
      <Surface
        bind:this={surfaceEl}
        {gameSpace}
        elements={state.elements}
        onMoveElement={(uuid, x, y) => {
          gameSpace.change({ type: 'move-element', uuid, x, y });
        }}
        onResizeElement={(uuid, width, height) => {
          gameSpace.change({ type: 'resize-element', uuid, width, height });
        }}
        onRotateElement={(uuid, rotation) => {
          gameSpace.change({ type: 'rotate-element', uuid, rotation });
        }}
        onContextMenu={handleContextMenu}
        {isCreator}
        isSteward={$isSteward}
        {isPlaying}
      />
    </div>
  </div>
  {#if contextMenuState}
    <ConfigMenu
      x={contextMenuState.x}
      y={contextMenuState.y}
      onClose={closeContextMenu}
      el={(() => {
        state; // trigger reactivity
        return gameSpace.el(contextMenuState.id);
      })()}
      {gameSpace}
      allElements={state.elements}
      onUpdateEl={handleUpdateElement}
      {isCreator}
      isSteward={$isSteward}
      {isPlaying}
      onMoveZ={(z) => gameSpace.change({ type: 'move-z', uuid: contextMenuState.id, z })}
      onRemoveEl={() => handleRemoveElement(contextMenuState.id)}
    />
  {/if}
{/if}
