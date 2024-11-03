import { derived, get, type Readable, type Writable, writable } from 'svelte/store';

import { type SynDoc } from '~/lib/SimplerSyn';

import * as eph from './ephemeralState';
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
  const ephemeral = synDoc.ephemeral as Readable<eph.State>;
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
    const alreadyJoined = !!$state.players.find((v) => v === pubKey);
    if (alreadyJoined) return false;
    const v = $state.players.length;
    const max = $state.minMaxPlayers[1];
    if (v >= max) return false;
    return true;
  });

  const canLeaveGame = derived(state, ($state) => {
    const alreadyJoined = !!$state.players.find((v) => v === pubKey);
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
        isArchived: $state.status === 'archived',
      };
      const canEdit = (params.isCreator || params.isPlaying) && !params.isArchived;
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
        applyDelta(delta, state);
      }
      console.timeEnd('Running deltas');
    }, force);
    console.timeEnd('Running session change');
  }

  async function ephemerealChange(delta: eph.Delta | eph.Delta[]) {
    const deltas = Array.isArray(delta) ? delta : [delta];
    // console.time('Running ephemeral state change');
    await synDoc.change((_state, ephemerealState) => {
      for (const delta of deltas) {
        eph.applyDelta(delta, ephemerealState);
      }
    }, false);
    // console.time('Running ephemeral state change');
  }

  function joinGame() {
    change({ type: 'add-player', player: pubKey });
  }

  function leaveGame() {
    change({ type: 'remove-player', player: pubKey });
  }

  // ██████╗ ██╗   ██╗██████╗ ██╗     ██╗ ██████╗
  // ██╔══██╗██║   ██║██╔══██╗██║     ██║██╔════╝
  // ██████╔╝██║   ██║██████╔╝██║     ██║██║
  // ██╔═══╝ ██║   ██║██╔══██╗██║     ██║██║
  // ██║     ╚██████╔╝██████╔╝███████╗██║╚██████╗
  // ╚═╝      ╚═════╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝

  return {
    // SYN
    state,
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
    getSurfaceCoordinates,
    getCurrentCenter,
    topZ,

    // CHANGES
    change,
    ephemerealChange,
    ephemeral,
    joinGame,
    leaveGame,
  };
}
