<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { derived } from 'svelte/store';
  import { cloneDeep } from 'lodash';
  import GearIcon from '~icons/fa6-solid/gear';
  import CubesIcon from '~icons/fa6-solid/cubes';
  import IconPen from '~icons/fa6-solid/pen';
  import IconPlay from '~icons/fa6-solid/play';
  import EyeIcon from '~icons/fa6-solid/eye';

  import ArrowLeftIcon from '~icons/fa6-solid/arrow-left';
  import BookIcon from '~icons/fa6-solid/book';

  import clients from '~/clients';
  import PocketIcon from '~/center/icons/PocketIcon.svelte';
  import { goBack } from '~/center/lib/routes';
  import { tooltip } from '~/center/lib/tooltip';
  import { addGameSpaceToPocket, COLORS, colorSequence, cx, uuid } from '~/center/lib/util';

  import {
    type GameSpaceSyn,
    type GElement,
    type LibraryElement,
    type PlayerSlot,
    createElement,
    setGameSpaceStoreContext,
  } from '~/store';

  import { Surface } from '~/Surface';

  import NameTitleInput from './center/input/NameTitleInput.svelte';
  import PeopleBar from './topbar/PeopleBar.svelte';
  import SidebarToggleButton from './topbar/SidebarToggleButton.svelte';
  import ElementsLibrary from './sidebar/ElementsLibrary.svelte';
  import SpaceConfigurator from './sidebar/SpaceConfigurator.svelte';
  import ConfigMenu from './ConfigMenu';

  import ActivityLog from './topbar/ActivityLog.svelte';
  import Instructions from './center/static/Instructions.svelte';

  export let GSS: GameSpaceSyn;
  export let asAsset: boolean = false;

  setGameSpaceStoreContext(GSS);

  $: GS = GSS.state;
  $: vp = GSS.vp;
  $: allParticipants = GSS.participants;
  $: participants = derived(allParticipants, ($p) => $p?.active || []);
  $: canJoinGame = GSS.canJoinGame;
  $: canLeaveGame = GSS.canLeaveGame;
  $: isSteward = GSS.isSteward;
  $: permissions = GSS.permissions;
  $: mode = GSS.mode;
  $: editModeOverride = GSS.editModeOverride;

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
  function handleOpenElementMenu(id: string, x: number, y: number) {
    if ($mode !== 'view') {
      contextMenuState = { id, x, y };
    }
  }

  function closeContextMenu() {
    contextMenuState = null;
  }

  function handleUpdateElement(el: Partial<GElement>) {
    GSS.change({ type: 'update-element', element: { ...el } });
  }

  function handleRemoveElement(id: string) {
    GSS.change({ type: 'remove-elements', uuids: [id] });
    closeContextMenu();
  }

  function handleDuplicateElement(id: string) {
    const el = $GS.elements.find((el) => el.uuid === id);
    if (!el) return;
    const newEl = cloneDeep(el);
    newEl.uuid = uuid();
    newEl.x += 5;
    newEl.y += 5;
    GSS.change({ type: 'add-element', element: newEl });
    contextMenuState = { id: newEl.uuid, x: contextMenuState.x + 5, y: contextMenuState.y + 5 };
  }

  function handleAddElementFromLibrary(element: LibraryElement, x: number, y: number) {
    if ($vp.isWithinContainer({ x, y })) {
      const surfaceCoords = $vp.screenToSpace({ x, y });
      const newEl = createElement(element, surfaceCoords.x, surfaceCoords.y, GSS);
      newEl.x -= newEl.width / 2;
      newEl.y -= newEl.height / 2;
      GSS.change({
        type: 'add-element',
        element: newEl,
      });
    }
  }

  function handleNameChange(name: string) {
    GSS.change({ type: 'set-name', name });
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

      {#if $mode === 'edit'}
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
        <NameTitleInput value={$GS.name} disabled={$GS.isArchived} onChange={handleNameChange} />
      {/if}
      <div class="flex-grow"></div>
      {#if !$GS.isArchived}
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
      {#if $mode === 'edit'}
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
            maxPlayersSlots={$GS.playersSlots.length}
            onMaxPlayersSlotsChange={handleMaxPlayersSlotsChange}
            onApplyColors={handleApplyColors}
          />
        {/if}
      {/if}
      {#if !$GS.isArchived && !$GS.isLibraryItem}
        <button
          use:tooltip={$editModeOverride ? 'Back to play mode' : 'Enter edit mode'}
          on:click={() => GSS.toggleEditModeOverride()}
          class={cx('absolute bottom-0 left-0 z-1500  text-white b b-black/10 rounded-tr-md p2', {
            'bg-blue-500 hover:bg-blue-400': !$editModeOverride,
            'bg-green-500 hover:bg-green-400': $editModeOverride,
          })}
        >
          {#if !$editModeOverride}
            <IconPen />
          {:else}
            <IconPlay />
          {/if}
        </button>
      {/if}
      <div class="flex-grow h-full">
        {#if $mode === 'view'}
          <div
            use:tooltip={'You are on view-only mode'}
            class="absolute z-100 top-0 left-50% -translate-x-1/2 px4 py1 text-2xl bg-red-400/80 b-2 b-dashed b-t-0 b-white/40 rounded-b-md text-white"
            on:click={() => GSS.joinGame()}
          >
            <EyeIcon />
          </div>
        {/if}
        <Surface onOpenElementMenu={handleOpenElementMenu}></Surface>
      </div>
    </div>
  </div>
  {#if contextMenuState}
    <ConfigMenu
      x={contextMenuState.x + 2}
      y={contextMenuState.y + 2}
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
