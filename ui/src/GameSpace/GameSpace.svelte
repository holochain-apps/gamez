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
    type PlayerSlot,
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
  import { cloneDeep } from 'lodash';
  import { colorSequence, uuid } from '~/lib/util';

  export let gameSpace: GameSpaceSyn;
  export let asAsset: boolean = false;
  $: state = gameSpace.state;
  $: allParticipants = gameSpace.participants;
  $: participants = derived(allParticipants, ($p) => $p?.active || []);
  $: canJoinGame = gameSpace.canJoinGame;
  $: canLeaveGame = gameSpace.canLeaveGame;
  $: isSteward = gameSpace.isSteward;
  $: permissions = gameSpace.permissions;

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
    closeContextMenu();
  }

  function handleDuplicateElement(id: string) {
    const el = $state.elements.find((el) => el.uuid === id);
    if (!el) return;
    const newEl = cloneDeep(el);
    newEl.uuid = uuid();
    newEl.x += 5;
    newEl.y += 5;
    console.log(newEl);
    gameSpace.change({ type: 'add-element', element: newEl });
    contextMenuState = { id: newEl.uuid, x: contextMenuState.x + 5, y: contextMenuState.y + 5 };
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

  function handleNameChange(name: string) {
    gameSpace.change({ type: 'set-name', name });
  }

  function handleMaxPlayersSlotsChange(maxPlayersSlots: number) {
    if (maxPlayersSlots === 0 || maxPlayersSlots === $state.playersSlots.length) {
      return;
    }

    let newPlayersSlots = cloneDeep($state.playersSlots).slice(0, maxPlayersSlots);
    if (newPlayersSlots.length < maxPlayersSlots) {
      for (let i = newPlayersSlots.length; i < maxPlayersSlots; i++) {
        newPlayersSlots.push({ color: '#000', pubKey: null });
      }
    }

    for (let i = 0; i < newPlayersSlots.length; i++) {
      newPlayersSlots[i].color = colorSequence(i, maxPlayersSlots);
    }

    gameSpace.change({ type: 'set-players-slots', playersSlots: newPlayersSlots });
  }

  function handlePlayersSlotsChange(playersSlots: PlayerSlot[]) {
    gameSpace.change({ type: 'set-players-slots', playersSlots });
  }
</script>

{#if $state}
  {#if !asAsset}
    <LayoutBar
      onChangeTitle={handleNameChange}
      canChangeTitle={$permissions.canEditSpace}
      title={$state.name}
      sub={$permissions.isArchived ? ' (view only)' : ''}
    />
  {/if}
  <div class="h-full flex flex-col">
    {#if !$permissions.isArchived}
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
          playersSlots={$state.playersSlots}
          participants={$participants}
          onJoin={() => gameSpace.joinGame()}
          onLeave={() => gameSpace.leaveGame()}
          onChangePlayersSlots={handlePlayersSlotsChange}
        />
      </div>
    {/if}
    <div class="flex flex-grow relative">
      {#if !$permissions.isArchived}
        {#if sidebar === 'elementsLibrary' && $isSteward}
          <ElementsLibrary
            onAdd={handleAddElementFromLibrary}
            canAdd={$permissions.canAddComponents}
          />
        {:else if sidebar === 'configurator'}
          {#if state}
            <SpaceConfigurator
              creator={$state.creator}
              name={$state.name}
              onNameChange={handleNameChange}
              maxPlayersSlots={$state.playersSlots.length}
              onMaxPlayersSlotsChange={handleMaxPlayersSlotsChange}
              canEdit={$permissions.canEditSpace}
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
      onUpdateEl={handleUpdateElement}
      onMoveZ={(z) => gameSpace.change({ type: 'move-z', uuid: contextMenuState.id, z })}
      onRemoveEl={() => handleRemoveElement(contextMenuState.id)}
      onDuplicate={() => handleDuplicateElement(contextMenuState.id)}
    />
  {/if}
{/if}
