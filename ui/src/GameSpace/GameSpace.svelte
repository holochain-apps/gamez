<script lang="ts">
  import { onMount, onDestroy, setContext } from 'svelte';
  import { derived, get, readonly } from 'svelte/store';
  import GearIcon from '~icons/fa6-solid/gear';
  import CubesIcon from '~icons/fa6-solid/cubes';

  import ArrowLeftIcon from '~icons/fa6-solid/arrow-left';
  import BookIcon from '~icons/fa6-solid/book';

  import PocketIcon from '~/shared/icons/PocketIcon.svelte';
  import { goBack } from '~/lib/routes';

  import {
    type GameSpaceSyn,
    type GElement,
    type LibraryElement,
    type PlayerSlot,
    createElement,
  } from '~/store';

  import Surface from './Surface.svelte';
  import PeopleBar from './topbar/PeopleBar.svelte';
  import SidebarToggleButton from './topbar/SidebarToggleButton.svelte';
  import ElementsLibrary from './sidebar/ElementsLibrary.svelte';
  import SpaceConfigurator from './sidebar/SpaceConfigurator.svelte';
  import ConfigMenu from './ConfigMenu';
  import { tooltip } from '~/shared/tooltip';
  import { cloneDeep } from 'lodash';
  import { addGameSpaceToPocket, COLORS, colorSequence, uuid } from '~/lib/util';
  import NameTitleInput from './ui/NameTitleInput.svelte';
  import ActivityLog from './topbar/ActivityLog.svelte';
  import Instructions from './ui/Instructions.svelte';
  import clients from '~/clients';

  export let GSS: GameSpaceSyn;
  export let asAsset: boolean = false;
  $: GS = GSS.state;
  $: allParticipants = GSS.participants;
  $: participants = derived(allParticipants, ($p) => $p?.active || []);
  $: canJoinGame = GSS.canJoinGame;
  $: canLeaveGame = GSS.canLeaveGame;
  $: isSteward = GSS.isSteward;
  $: permissions = GSS.permissions;
  $: editMode = GSS.editMode;

  setContext('game-space-store', GSS);
  setContext('game-space', GS);

  let sidebar: 'none' | 'elementsLibrary' | 'configurator' = asAsset ? 'none' : 'elementsLibrary';

  onMount(async () => {
    await GSS.joinSession();
  });

  onDestroy(() => {
    GSS.leaveSession();
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
    console.log('Context Menu');
    contextMenuState = { id, x, y };
  }

  function closeContextMenu() {
    contextMenuState = null;
  }

  function handleUpdateElement(el: Partial<GElement>) {
    GSS.change({ type: 'update-element', element: { ...el } });
  }

  function handleRemoveElement(id: string) {
    GSS.change({ type: 'remove-element', uuid: id });
    closeContextMenu();
  }

  function handleDuplicateElement(id: string) {
    const el = $GS.elements.find((el) => el.uuid === id);
    if (!el) return;
    const newEl = cloneDeep(el);
    newEl.uuid = uuid();
    newEl.x += 5;
    newEl.y += 5;
    console.log(newEl);
    GSS.change({ type: 'add-element', element: newEl });
    contextMenuState = { id: newEl.uuid, x: contextMenuState.x + 5, y: contextMenuState.y + 5 };
  }

  function handleAddElementFromLibrary(element: LibraryElement, x?: number, y?: number) {
    const surfaceCoords = x && y ? GSS.getSurfaceCoordinates(x, y) : GSS.getCurrentCenter();
    if (surfaceCoords) {
      GSS.change({
        type: 'add-element',
        element: createElement(element, surfaceCoords.x, surfaceCoords.y, GSS),
      });
    }
  }

  function handleNameChange(name: string) {
    GSS.change({ type: 'set-name', name });
  }

  function handleIconChange(icon: string) {
    GSS.change({ type: 'set-icon', icon });
  }

  function handleMaxPlayersSlotsChange(maxPlayersSlots: number) {
    if (maxPlayersSlots === 0 || maxPlayersSlots === $GS.playersSlots.length) {
      return;
    }

    let newPlayersSlots = cloneDeep($GS.playersSlots).slice(0, maxPlayersSlots);
    if (newPlayersSlots.length < maxPlayersSlots) {
      for (let i = newPlayersSlots.length; i < maxPlayersSlots; i++) {
        newPlayersSlots.push({ color: COLORS[0], pubKey: null });
      }
    }

    GSS.change({ type: 'set-players-slots', playersSlots: newPlayersSlots });
  }

  function handleApplyColors() {
    let newPlayersSlots = cloneDeep($GS.playersSlots);

    for (let i = 0; i < newPlayersSlots.length; i++) {
      newPlayersSlots[i].color = colorSequence(i, newPlayersSlots.length);
    }

    GSS.change({ type: 'set-players-slots', playersSlots: newPlayersSlots });
  }

  function handlePlayersSlotsChange(playersSlots: PlayerSlot[]) {
    GSS.change({ type: 'set-players-slots', playersSlots });
  }
</script>

{#if $GS}
  <Instructions />
  <div class="h-full flex flex-col">
    <!-- ████████╗ ██████╗ ██████╗     ██████╗  █████╗ ██████╗
        ╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗
          ██║   ██║   ██║██████╔╝    ██████╔╝███████║██████╔╝
          ██║   ██║   ██║██╔═══╝     ██╔══██╗██╔══██║██╔══██╗
         ██║   ╚██████╔╝██║         ██████╔╝██║  ██║██║  ██║
         ╚═╝    ╚═════╝ ╚═╝         ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
                                                            -->
    <div class="bg-main-400 h-12 pl1 flexcc relative">
      {#if !asAsset}
        <button
          class="h10 w10 flexcc mr1 hover:bg-black/10 rounded-full text-white"
          on:click={goBack}
        >
          <ArrowLeftIcon />
        </button>
        {#if clients.weave && !$GS.isArchived}
          <button
            on:click={() => addGameSpaceToPocket(GSS.hash)}
            use:tooltip={'Add to pocket'}
            class="h-10 w-10 p2 mr1 flexcc hover:bg-black/10 rounded-full text-white"
          >
            <PocketIcon class="h-full w-full" />
          </button>
        {/if}
      {/if}

      {#if !$GS.isArchived && $GS.isLibraryItem}
        <SidebarToggleButton current={sidebar} value="configurator" onClick={toggleSidebar}>
          <GearIcon />
        </SidebarToggleButton>
        {#if $isSteward}
          <SidebarToggleButton current={sidebar} value="elementsLibrary" onClick={toggleSidebar}>
            <CubesIcon />
          </SidebarToggleButton>
        {/if}
      {/if}
      {#if $GS.isLibraryItem}
        <div use:tooltip={'This is a library item'} class="p1 bg-blue-400 ml2 text-white rounded-md"
          ><BookIcon /></div
        >
      {/if}
      {#if !asAsset}
        <NameTitleInput
          value={$GS.name}
          disabled={$permissions.isArchived}
          onChange={handleNameChange}
        />
      {/if}
      <div class="flex-grow"></div>
      {#if !$permissions.isArchived}
        <PeopleBar
          pubKey={GSS.pubKey}
          canJoinGame={$canJoinGame}
          canLeaveGame={$canLeaveGame}
          playersSlots={$GS.playersSlots}
          participants={$participants}
          onJoin={() => GSS.joinGame()}
          onLeave={() => GSS.leaveGame()}
          onChangePlayersSlots={handlePlayersSlotsChange}
          canChangeSlots={$GS.isLibraryItem}
        />
      {/if}
      {#if !$GS.isLibraryItem}
        <ActivityLog gameSpace={GSS} />
      {/if}
    </div>

    <!-- ███╗   ███╗ █████╗ ██╗███╗   ██╗    ███████╗██████╗  █████╗  ██████╗███████╗
        ████╗ ████║██╔══██╗██║████╗  ██║    ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝
        ██╔████╔██║███████║██║██╔██╗ ██║    ███████╗██████╔╝███████║██║     █████╗
        ██║╚██╔╝██║██╔══██║██║██║╚██╗██║    ╚════██║██╔═══╝ ██╔══██║██║     ██╔══╝
       ██║ ╚═╝ ██║██║  ██║██║██║ ╚████║    ███████║██║     ██║  ██║╚██████╗███████╗
      ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝    ╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝
                                                                                 -->
    <div class="flex flex-grow relative">
      {#if !$permissions.isArchived && $GS.isLibraryItem}
        {#if sidebar === 'elementsLibrary' && $isSteward}
          <ElementsLibrary
            onAdd={handleAddElementFromLibrary}
            canAdd={$permissions.canAddComponents}
          />
        {:else if sidebar === 'configurator'}
          <SpaceConfigurator
            creator={$GS.creator}
            name={$GS.name}
            onNameChange={handleNameChange}
            icon={$GS.icon}
            onIconChange={handleIconChange}
            maxPlayersSlots={$GS.playersSlots.length}
            onMaxPlayersSlotsChange={handleMaxPlayersSlotsChange}
            onApplyColors={handleApplyColors}
            canEdit={$permissions.canEditSpace}
          />
        {/if}
      {/if}
      <Surface
        gameSpace={GSS}
        elements={$GS.elements}
        onMoveElement={(uuid, x, y) => {
          GSS.change({ type: 'move-element', uuid, x, y });
        }}
        onResizeElement={(uuid, width, height) => {
          GSS.change({ type: 'resize-element', uuid, width, height });
        }}
        onRotateElement={(uuid, rotation) => {
          GSS.change({ type: 'rotate-element', uuid, rotation });
        }}
        canOpenConfigMenu={$GS.isLibraryItem}
        onContextMenu={handleContextMenu}
      />
    </div>
  </div>
  {#if contextMenuState}
    <!-- <div class="fixed top-50 left-50 z-1000 h-50 w-50 bg-red-500">
      <select-asset-menu weave-client={weaveClient}></select-asset-menu>
    </div> -->
    <ConfigMenu
      x={contextMenuState.x}
      y={contextMenuState.y}
      onClose={closeContextMenu}
      el={(() => {
        GS; // trigger reactivity
        return GSS.el(contextMenuState.id);
      })()}
      onUpdateEl={handleUpdateElement}
      onMoveZ={(z) => GSS.change({ type: 'move-z', uuid: contextMenuState.id, z })}
      onRemoveEl={() => handleRemoveElement(contextMenuState.id)}
      onDuplicate={() => handleDuplicateElement(contextMenuState.id)}
    />
  {/if}
{/if}
