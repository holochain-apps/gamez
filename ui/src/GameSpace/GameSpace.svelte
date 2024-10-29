<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { derived, get } from 'svelte/store';
  import GearIcon from '~icons/fa6-solid/gear';
  import CubesIcon from '~icons/fa6-solid/cubes';
  import PocketIcon from '~/shared/icons/PocketIcon.svelte';

  import LayoutBar from '~/Layout/LayoutBar.svelte';
  import {
    type GameSpaceSyn,
    type GElement,
    type LibraryElement,
    createElement,
    getContext,
  } from '~/store';

  import Surface from './Surface.svelte';
  import PeopleBar from './topbar/PeopleBar.svelte';
  import SidebarToggleButton from './topbar/SidebarToggleButton.svelte';
  import ElementsLibrary from './sidebar/ElementsLibrary.svelte';
  import SpaceConfigurator from './sidebar/SpaceConfigurator.svelte';
  import ConfigMenu from './ConfigMenu';
  import { tooltip } from '~/shared/tooltip';

  export let gameSpace: GameSpaceSyn;
  export let asAsset: boolean = false;
  $: state = gameSpace.state;
  $: allParticipants = gameSpace.participants;
  $: participants = derived(allParticipants, ($p) => $p?.active || []);
  $: canJoinGame = gameSpace.canJoinGame;
  $: canLeaveGame = gameSpace.canLeaveGame;
  $: isSteward = gameSpace.isSteward;
  $: isCreator = $state.creator === gameSpace.pubKey;
  $: isPlaying = $canLeaveGame;

  const { addToPocket } = getContext();

  let sidebar: 'none' | 'elementsLibrary' | 'configurator' = asAsset ? 'none' : 'elementsLibrary';

  onMount(async () => {
    await gameSpace.joinSession();
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
    if (contextMenuState && !$state.elements.find((e) => e.uuid === contextMenuState.id)) {
      closeContextMenu();
    }
  }

  function handleAddElementFromLibrary(element: LibraryElement, x?: number, y?: number) {
    const surfaceCoords =
      x && y ? gameSpace.getSurfaceCoordinates(x, y) : gameSpace.getCurrentCenter();
    console.log('SURFACE COORDs', surfaceCoords);
    if (surfaceCoords) {
      gameSpace.change({
        type: 'add-element',
        element: createElement(element, surfaceCoords.x, surfaceCoords.y, gameSpace),
      });
    }
  }

  function handleAddToPocket() {
    addToPocket(gameSpace);
  }

  // Some debug info

  $: ephemeralState = gameSpace.ephemeral;
  $: ephemeralStateChangesCount = 0;
  $: stateChangesCount = 0;
  $: {
    $ephemeralState;
    ephemeralStateChangesCount++;
  }
  $: {
    $state;
    stateChangesCount++;
  }

  $: {
    console.log('EPH change', ephemeralState);
  }
  $: isArchived = $state.status === 'archived';
</script>

{#if $state}
  {#if !asAsset}
    <LayoutBar title={$state.name + (isArchived ? ' (archived)' : '')} />
  {/if}
  <div class="h-full flex flex-col">
    {#if !isArchived}
      <div class="bg-main-700 h-14 flex relative">
        <SidebarToggleButton current={sidebar} value="configurator" onClick={toggleSidebar}>
          <GearIcon />
        </SidebarToggleButton>
        {#if $isSteward}
          <SidebarToggleButton current={sidebar} value="elementsLibrary" onClick={toggleSidebar}>
            <CubesIcon />
          </SidebarToggleButton>
        {/if}
        {#if !asAsset}
          <div class="flexcc px2">
            <button
              on:click={handleAddToPocket}
              use:tooltip={'Add to pocket'}
              class="h-10 w-10 p2 bg-main-400 b b-black/10 hover:bg-main-500 rounded-md text-white"
            >
              <PocketIcon class="h-full w-full" />
            </button>
          </div>
        {/if}

        <PeopleBar
          canJoinGame={$canJoinGame}
          canLeaveGame={$canLeaveGame}
          players={$state.players}
          participants={$participants}
          onJoin={() => gameSpace.joinGame()}
          onLeave={() => gameSpace.leaveGame()}
        />
      </div>
    {/if}
    <div class="flex flex-grow relative">
      {#if !isArchived}
        {#if sidebar === 'elementsLibrary' && $isSteward}
          <ElementsLibrary onAdd={handleAddElementFromLibrary} />
        {:else if sidebar === 'configurator'}
          {#if state}
            <SpaceConfigurator
              isSteward={$isSteward}
              creator={$state.creator}
              name={$state.name}
              onNameChange={(name) => gameSpace.change({ type: 'set-name', name })}
              isStewarded={$state.isStewarded}
              onIsStewardedChange={(isStewarded) =>
                gameSpace.change({ type: 'set-is-stewarded', isStewarded })}
            />
          {/if}
        {/if}
      {/if}
      <Surface
        {gameSpace}
        elements={$state.elements}
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
        {isPlaying}
      />
      <div class="absolute bottom-0 left-0 bg-black/50 text-white rounded-tr-md z-100 p1">
        [{stateChangesCount}] [{ephemeralStateChangesCount}]</div
      >
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
      onUpdateEl={handleUpdateElement}
      {isCreator}
      isSteward={$isSteward}
      {isPlaying}
      onMoveZ={(z) => gameSpace.change({ type: 'move-z', uuid: contextMenuState.id, z })}
      onRemoveEl={() => handleRemoveElement(contextMenuState.id)}
    />
  {/if}
{/if}
