import type { WAL, WeaveClient } from '@theweave/api';
import { derived, get, type Readable, readonly, type Writable, writable } from 'svelte/store';

import clients from '~/clients';
import { type SynDoc } from '~/lib/SimplerSyn';
import { hashToWAL } from '~/lib/util';

import { applyDelta, type Delta } from './grammar';
import { type GameSpace } from './types';

type UiState = {
  zoom: number;
  panX: number;
  panY: number;
  surfaceContainer: HTMLDivElement;
};

export type GameSpaceSyn = ReturnType<typeof createGameSpaceSynStore>;

export function createGameSpaceSynStore(synDoc: SynDoc) {
  console.log('SYN DOC', synDoc);
  const state = synDoc.state as Writable<GameSpace>;
  const pubKey = synDoc.pubKey;
  const hash = synDoc.hash;
  const participants = synDoc.participants;

  // ██████╗ ███████╗██████╗ ██╗██╗   ██╗███████╗██████╗
  // ██╔══██╗██╔════╝██╔══██╗██║██║   ██║██╔════╝██╔══██╗
  // ██║  ██║█████╗  ██████╔╝██║██║   ██║█████╗  ██║  ██║
  // ██║  ██║██╔══╝  ██╔══██╗██║╚██╗ ██╔╝██╔══╝  ██║  ██║
  // ██████╔╝███████╗██║  ██║██║ ╚████╔╝ ███████╗██████╔╝
  // ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝╚═════╝

  const elements = derived(state, (st) => st.elements);

  function el(pieceId) {
    return get(elements).find((v) => v.uuid === pieceId);
  }
  // const elementsById: {[key: string]: Writable<GElement>} = {};

  // function processElements($elements: GElement[]) {
  //   $elements.forEach((el) => {
  //     if (elementsById[el.uuid]) {
  //       elementsById[el.uuid].set(el);
  //     } else {
  //       elementsById[el.uuid] = writable(el);
  //     }
  //   })
  // }
  // processElements(get(elements));
  // elements.subscribe(processElements)

  const canJoinGame = derived(state, ($state) => {
    if ($state.isLibraryItem) return false;
    const alreadyJoined = !!$state.playersSlots.find((s) => s.pubKey === pubKey);
    if (alreadyJoined) return false;
    const freeSlot = $state.playersSlots.findIndex((p) => p.pubKey === null);
    if (freeSlot === -1) return false;
    return true;
  });

  const canLeaveGame = derived(state, ($state) => {
    const alreadyJoined = !!$state.playersSlots.find((s) => s.pubKey === pubKey);
    if (!alreadyJoined) return false;
    return true;
  });

  const isSteward = derived(state, ($state) => {
    if (!$state.isStewarded) return true;
    return $state.creator === pubKey;
  });

  const permissions = derived(
    [canLeaveGame, state, canJoinGame],
    ([$canLeaveGame, $state, $canJoinGame]) => {
      const params = {
        isCreator: $state.creator === pubKey,
        isPlaying: $canLeaveGame,
        isArchived: $state.isArchived,
      };
      const canEdit =
        ((params.isCreator || params.isPlaying) && !params.isArchived) || $state.isLibraryItem;
      return {
        ...params,
        canJoin: $canJoinGame,
        canLeave: $canLeaveGame,
        canEditComponents: canEdit,
        canAddComponents: canEdit,
        canEditSpace: canEdit,
      };
    },
  );

  // ██╗   ██╗██╗    ███████╗████████╗ █████╗ ████████╗███████╗
  // ██║   ██║██║    ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝
  // ██║   ██║██║    ███████╗   ██║   ███████║   ██║   █████╗
  // ██║   ██║██║    ╚════██║   ██║   ██╔══██║   ██║   ██╔══╝
  // ╚██████╔╝██║    ███████║   ██║   ██║  ██║   ██║   ███████╗
  //  ╚═════╝ ╚═╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝

  type Mode = 'view' | 'play' | 'edit';
  // const mode = writable<'edit' | 'play' | 'view'>('view');
  // const gameSpaceDefaultMode = writable<'edit' | 'play' | 'view'>('view');
  const editModeOverride = writable<boolean>(false);

  const mode = derived([editModeOverride, state], ([$editModeOverride, $state]) => {
    let mode: Mode = 'view';

    if (!$state.isArchived) {
      if ($state.isLibraryItem) {
        mode = 'edit';
      } else if ($state.playersSlots.find((s) => s.pubKey === pubKey)) {
        mode = 'play';
      }

      if ($editModeOverride) {
        mode = 'edit';
      }
    }

    return mode;
  });

  // const modesSorted = ['view' as 'view', 'play' as 'play', 'edit' as 'edit'];

  // function highestMode(modes: Mode[]): Mode {
  //   return modesSorted[modes.map((m) => modesSorted.indexOf(m)).sort((a, b) => b - a)[0]];
  // }
  // const editMode = writable<boolean>(false);
  // const initialModeSet = writable<boolean>(false);

  // state.subscribe((gameSpace) => {
  //   if (get(initialModeSet) === false && gameSpace) {
  //     $state.playersSlots.find((s) => s.pubKey === pubKey)
  //     if (gameSpace.isArchived) {
  //       mode.set('view');
  //     } else if (!gameSpace.isLibraryItem) {
  //       mode.set('play');
  //     } else {
  //       mode.set('edit');
  //     }
  //   }
  // });

  const ui = writable<UiState>({ zoom: 1, panX: 0, panY: 0, surfaceContainer: null });

  function getSurfaceCoordinates(clientX, clientY): { x: number; y: number } | null {
    const $ui = get(ui);
    const { left, top, width, height } = $ui.surfaceContainer.getBoundingClientRect();
    if (clientX < left || clientX > left + width || clientY < top || clientY > top + height) {
      return null;
    }
    const surfaceX = clientX - left;
    const surfaceY = clientY - top;
    return { x: surfaceX / $ui.zoom - $ui.panX, y: surfaceY / $ui.zoom - $ui.panY };
  }

  function getCurrentCenter(): { x: number; y: number } {
    const $ui = get(ui);
    const { width, height } = $ui.surfaceContainer.getBoundingClientRect();
    return {
      x: width / 2 / $ui.zoom - $ui.panX,
      y: height / 2 / $ui.zoom - $ui.panY,
    };
  }

  function topZ(pieceId: string = null) {
    const $elements = get(elements);
    const piece = pieceId ? $elements.find((v) => v.uuid === pieceId) : null;
    const maxZ = $elements.reduce((max, el) => (el.z > max ? el.z : max), 0);
    const maxZCount = $elements.filter((v) => v.z === maxZ).length;
    const shouldIncreaseZ = piece ? piece.z < maxZ || (piece.z === maxZ && maxZCount > 1) : true;
    return shouldIncreaseZ ? maxZ + 1 : piece.z;
  }

  //  ██████╗██╗  ██╗ █████╗ ███╗   ██╗ ██████╗ ███████╗███████╗
  // ██╔════╝██║  ██║██╔══██╗████╗  ██║██╔════╝ ██╔════╝██╔════╝
  // ██║     ███████║███████║██╔██╗ ██║██║  ███╗█████╗  ███████╗
  // ██║     ██╔══██║██╔══██║██║╚██╗██║██║   ██║██╔══╝  ╚════██║
  // ╚██████╗██║  ██║██║  ██║██║ ╚████║╚██████╔╝███████╗███████║
  //  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚══════╝

  async function change(delta: Delta | Delta[], force: boolean = false) {
    const deltas = Array.isArray(delta) ? delta : [delta];
    console.log('GameSpace changes', deltas);

    console.time('Running session change');
    await synDoc.change((state, _eph) => {
      console.time('Running deltas');
      for (const delta of deltas) {
        applyDelta(delta, state, {
          pubKey,
          weaveClient: clients.weave,
          asAsset: () => hashToWAL(hash),
        });
      }
      console.timeEnd('Running deltas');
    }, force);
    console.timeEnd('Running session change');
  }

  function joinGame() {
    change({ type: 'join-game' });
  }

  function leaveGame() {
    change({ type: 'leave-game' });
  }

  // ██████╗ ██╗   ██╗██████╗ ██╗     ██╗ ██████╗
  // ██╔══██╗██║   ██║██╔══██╗██║     ██║██╔════╝
  // ██████╔╝██║   ██║██████╔╝██║     ██║██║
  // ██╔═══╝ ██║   ██║██╔══██╗██║     ██║██║
  // ██║     ╚██████╔╝██████╔╝███████╗██║╚██████╗
  // ╚═╝      ╚═════╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝

  return {
    // SYN
    state: readonly(state),
    pubKey,
    hash,
    participants,
    joinSession: () => synDoc.joinSession(),
    leaveSession: () => synDoc.leaveSession(),

    // DERIVED
    el,
    elements,
    canJoinGame,
    canLeaveGame,
    isSteward,
    permissions,

    // UI STATE
    ui,
    mode: readonly(mode),
    editModeOverride: readonly(editModeOverride),
    toggleEditModeOverride: () => editModeOverride.set(!get(editModeOverride)),
    // editMode: readonly(editMode),
    getSurfaceCoordinates,
    getCurrentCenter,
    topZ,

    // CHANGES
    change,
    joinGame,
    leaveGame,
  };
}

// export function setContext() {
//   setContext('game-space-store', gameSpace);
//   setContext('game-space', state);
// }
