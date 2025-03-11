<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import GearIcon from '~icons/fa6-solid/gear';
  import CubesIcon from '~icons/fa6-solid/cubes';
  import ArrowLeftIcon from '~icons/fa6-solid/arrow-left';
  import BookIcon from '~icons/fa6-solid/book';

  import PocketIcon from '~/shared/icons/PocketIcon.svelte';
  import R from '~/lib/routes.svelte';

  import {
    // type GameSpaceSyn,
    type GElement,
    // type LibraryElement,
    type PlayerSlot,
    createElement,
    getContext,
  } from '~/store';

  import Surface from './Surface.svelte';
  // import PeopleBar from './topbar/PeopleBar.svelte';
  import SidebarToggleButton from './topbar/SidebarToggleButton.svelte';
  import ElementsLibrary from './sidebar/ElementsLibrary.svelte';
  import SpaceConfigurator from './sidebar/SpaceConfigurator.svelte';
  // import ConfigMenu from './ConfigMenu';
  import { tooltip } from '~/shared/tooltip';
  import { cloneDeep } from 'lodash';
  import { b64ToHash, COLORS, colorSequence, uuid } from '~/lib/util';
  import NameTitleInput from './ui/NameTitleInput.svelte';
  // import ActivityLog from './topbar/ActivityLog.svelte';
  import Instructions from './ui/Instructions.svelte';
  import clients from '~/clients';
  import type { LibraryElement } from '~/store/library';

  const { hash, useAssetView }: { hash: string; useAssetView: boolean } = $props();
  const S = getContext();

  console.log(hash, S.docs, S.docs[hash]);

  const GS = $derived(S.docs[hash]);

  let sidebar = $state<'none' | 'elementsLibrary' | 'configurator'>(
    useAssetView ? 'none' : 'elementsLibrary',
  );

  onMount(async () => {
    GS.cmd('join-session');
  });

  onDestroy(() => {
    GS.cmd('leave-session');
  });

  const toggleSidebar = (value: typeof sidebar) => {
    if (sidebar === value) {
      sidebar = 'none';
    } else {
      sidebar = value;
    }
  };

  let contextMenuState = $state<{ id: string; x: number; y: number } | null>(null);
  function handleContextMenu(id: string, x: number, y: number) {
    contextMenuState = { id, x, y };
  }

  function closeContextMenu() {
    contextMenuState = null;
  }

  function handleUpdateElement(el: Partial<GElement>) {
    GS.cmd('update-element', el);
  }

  function handleRemoveElement(id: string) {
    GS.cmd('remove-element', id);
    closeContextMenu();
  }

  function handleDuplicateElement(id: string) {
    const el = GS.elements.find((el) => el.uuid === id);
    if (!el) return;
    const newEl = cloneDeep(el);
    newEl.uuid = uuid();
    newEl.x += 5;
    newEl.y += 5;
    GS.cmd('add-element', newEl);
    contextMenuState = { id: newEl.uuid, x: contextMenuState.x + 5, y: contextMenuState.y + 5 };
  }

  function handleAddElementFromLibrary(element: LibraryElement, x?: number, y?: number) {
    const surfaceCoords = x && y ? GS.getSurfaceCoordinates(x, y) : GS.getCurrentCenter();
    if (surfaceCoords) {
      GS.cmd('add-element', createElement(element, surfaceCoords.x, surfaceCoords.y, GS));
    }
  }

  function handleNameChange(name: string) {
    GS.cmd('update', { name });
    // gameSpace.change({ type: 'set-name', name });
  }

  function handleIconChange(icon: string) {
    GS.cmd('update', { icon });
  }

  function handleMaxPlayersSlotsChange(maxPlayersSlots: number) {
    if (maxPlayersSlots === 0 || maxPlayersSlots === GS.playersSlots.length) {
      return;
    }

    let newPlayersSlots = GS.playersSlots.slice(0, maxPlayersSlots);
    if (newPlayersSlots.length < maxPlayersSlots) {
      for (let i = newPlayersSlots.length; i < maxPlayersSlots; i++) {
        newPlayersSlots.push({ color: COLORS[0], pubKey: null });
      }
    }

    GS.cmd('update', { playersSlots: newPlayersSlots });
  }

  function handleApplyColors() {
    let newPlayersSlots = { ...GS.playersSlots };

    for (let i = 0; i < newPlayersSlots.length; i++) {
      newPlayersSlots[i].color = colorSequence(i, newPlayersSlots.length);
    }

    GS.cmd('update', { playersSlots: newPlayersSlots });
  }

  function handlePlayersSlotsChange(playersSlots: PlayerSlot[]) {
    GS.cmd('update', { playersSlots });
  }
</script>

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
    {#if !useAssetView}
      <button
        class="h10 w10 flexcc mr1 hover:bg-black/10 rounded-full text-white"
        onclick={R.goBack}
      >
        <ArrowLeftIcon />
      </button>
      {#if clients.weave && !GS.permissions.isArchived}
        <button
          onclick={() => GS.cmd('add-to-pocket')}
          use:tooltip={'Add to pocket'}
          class="h-10 w-10 p2 mr1 flexcc hover:bg-black/10 rounded-full text-white"
        >
          <PocketIcon class="h-full w-full" />
        </button>
      {/if}
    {/if}

    {#if !GS.permissions.isArchived && GS.isLibraryItem}
      <SidebarToggleButton current={sidebar} value="configurator" onClick={toggleSidebar}>
        <GearIcon />
      </SidebarToggleButton>
      {#if GS.isSteward}
        <SidebarToggleButton current={sidebar} value="elementsLibrary" onClick={toggleSidebar}>
          <CubesIcon />
        </SidebarToggleButton>
      {/if}
    {/if}
    {#if GS.isLibraryItem}
      <div use:tooltip={'This is a library item'} class="p1 bg-blue-400 ml2 text-white rounded-md"
        ><BookIcon /></div
      >
    {/if}
    {#if !useAssetView}
      <NameTitleInput
        value={GS.name}
        disabled={GS.permissions.isArchived}
        onChange={handleNameChange}
      />
    {/if}
    <div class="flex-grow"></div>
    {#if !GS.permissions.isArchived}
      <!-- <PeopleBar
        pubKey={clients.agentKeyB64}
        canJoinGame={GS.canJoinGame}
        canLeaveGame={GS.canLeaveGame}
        playersSlots={GS.playersSlots}
        participants={GS.participants.active.map(b64ToHash)}
        onJoin={() => GS.cmd('join-game')}
        onLeave={() => GS.cmd('leave-game')}
        onChangePlayersSlots={handlePlayersSlotsChange}
        canChangeSlots={GS.isLibraryItem}
      /> -->
    {/if}
    {#if !GS.isLibraryItem}
      <!-- <ActivityLog gameSpace={GS} /> -->
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
    {#if !GS.permissions.isArchived && GS.isLibraryItem}
      {#if sidebar === 'elementsLibrary' && GS.isSteward}
        <ElementsLibrary
          onAdd={handleAddElementFromLibrary}
          canAdd={GS.permissions.canAddComponents}
        />
      {:else if sidebar === 'configurator'}
        <SpaceConfigurator
          creator={GS.creator}
          name={GS.name}
          onNameChange={handleNameChange}
          icon={GS.icon}
          onIconChange={handleIconChange}
          maxPlayersSlots={GS.playersSlots.length}
          onMaxPlayersSlotsChange={handleMaxPlayersSlotsChange}
          onApplyColors={handleApplyColors}
          canEdit={GS.permissions.canEditSpace}
        />
      {/if}
    {/if}
    <Surface
      gameSpace={GS}
      elements={GS.elements}
      onMoveElement={(uuid, x, y) => {
        GS.cmd('update-element', { uuid, x, y });
        // gameSpace.change({ type: 'move-element', uuid, x, y });
      }}
      onResizeElement={(uuid, width, height) => {
        GS.cmd('update-element', { uuid, width, height });
        // gameSpace.change({ type: 'resize-element', uuid, width, height });
      }}
      onRotateElement={(uuid, rotation) => {
        GS.cmd('update-element', { uuid, rotation });
        // gameSpace.change({ type: 'rotate-element', uuid, rotation });
      }}
      canOpenConfigMenu={GS.isLibraryItem}
      onContextMenu={handleContextMenu}
    />
  </div>
</div>
{#if contextMenuState}
  <!-- <ConfigMenu
    x={contextMenuState.x}
    y={contextMenuState.y}
    onClose={closeContextMenu}
    el={GS.el(contextMenuState.id)}
    gameSpace={GS}
    onUpdateEl={handleUpdateElement}
    onMoveZ={(z) => GS.cmd('move-z', contextMenuState.id, z)}
    onRemoveEl={() => handleRemoveElement(contextMenuState.id)}
    onDuplicate={() => handleDuplicateElement(contextMenuState.id)}
  /> -->
{/if}
