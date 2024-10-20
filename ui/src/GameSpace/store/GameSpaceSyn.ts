import { derived, get, type Writable, writable } from 'svelte/store';

import { type SynDoc } from '~/lib/SimplerSyn';

import { type GameSpace } from '../types';
import { applyDelta, type Delta } from './grammar';

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

  // const $state = get(synDoc.state);

  // console.log('STATE FROM CREATION', $state);

  // ██████╗ ███████╗██████╗ ██╗██╗   ██╗███████╗██████╗
  // ██╔══██╗██╔════╝██╔══██╗██║██║   ██║██╔════╝██╔══██╗
  // ██║  ██║█████╗  ██████╔╝██║██║   ██║█████╗  ██║  ██║
  // ██║  ██║██╔══╝  ██╔══██╗██║╚██╗ ██╔╝██╔══╝  ██║  ██║
  // ██████╔╝███████╗██║  ██║██║ ╚████╔╝ ███████╗██████╔╝
  // ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝╚═════╝

  const elements = derived(state, (st) => st.elements);
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
    return $state.creator === this.pubKeyB64;
  });

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

  async function change(delta: Delta | Delta[]) {
    const deltas = Array.isArray(delta) ? delta : [delta];
    console.log('GameSpace changes', deltas);

    if (synDoc.inSession()) {
      console.time('Running session change');
      synDoc.change((state, _eph) => {
        console.time('Running deltas');
        for (const delta of deltas) {
          applyDelta(delta, state);
        }
        console.timeEnd('Running deltas');
      });
      console.timeEnd('Running session change');
    }
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
    joinSession: synDoc.joinSession,
    leaveSession: synDoc.leaveSession,

    // DERIVED
    elements,
    canJoinGame,
    canLeaveGame,
    isSteward,

    // UI STATE
    ui,
    getSurfaceCoordinates,
    getCurrentCenter,
    topZ,

    // CHANGES
    change,
    joinGame,
    leaveGame,
  };
}

// export class GameSpaceSyn {
//   state = writable<GameSpace>(null);

//   pubKeyB64: string;
//   pubKey: string;

//   constructor(public synDoc: SynDoc) {
//     this.pubKeyB64 = synDoc.pubKey;
//     this.pubKey = synDoc.pubKey;
//     this.synDoc.state.subscribe((state) => {
//       this.state.set(state);
//     });
//   }

//   el(pieceId) {
//     return get(this.state).elements.find((v) => v.uuid === pieceId);
//   }

//   // ██╗   ██╗██╗    ███████╗████████╗ █████╗ ████████╗███████╗
//   // ██║   ██║██║    ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝
//   // ██║   ██║██║    ███████╗   ██║   ███████║   ██║   █████╗
//   // ██║   ██║██║    ╚════██║   ██║   ██╔══██║   ██║   ██╔══╝
//   // ╚██████╔╝██║    ███████║   ██║   ██║  ██║   ██║   ███████╗
//   //  ╚═════╝ ╚═╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝

//   ui = writable<UiState>({ zoom: 1, panX: 0, panY: 0, surfaceContainer: null });

//   updateUiState(uiState: UiState) {
//     this.ui.set(uiState);
//   }

//   getSurfaceCoordinates(clientX, clientY): { x: number; y: number } | null {
//     const ui = get(this.ui);
//     const { left, top, width, height } = ui.surfaceContainer.getBoundingClientRect();
//     if (clientX < left || clientX > left + width || clientY < top || clientY > top + height) {
//       return null;
//     }
//     const surfaceX = clientX - left;
//     const surfaceY = clientY - top;
//     return { x: surfaceX / ui.zoom - ui.panX, y: surfaceY / ui.zoom - ui.panY };
//   }

//   getCurrentCenter(): { x: number; y: number } {
//     const ui = get(this.ui);
//     const { width, height } = ui.surfaceContainer.getBoundingClientRect();
//     return {
//       x: width / 2 / ui.zoom - ui.panX,
//       y: height / 2 / ui.zoom - ui.panY,
//     };
//   }

//   topZ(pieceId: string = null) {
//     const elements = get(this.state).elements;
//     const piece = pieceId ? elements.find((v) => v.uuid === pieceId) : null;
//     const maxZ = elements.reduce((max, el) => (el.z > max ? el.z : max), 0);
//     const maxZCount = elements.filter((v) => v.z === maxZ).length;
//     const shouldIncreaseZ = piece ? piece.z < maxZ || (piece.z === maxZ && maxZCount > 1) : true;
//     return shouldIncreaseZ ? maxZ + 1 : piece.z;
//   }

//   // ███████╗██╗   ██╗███╗   ██╗    ██████╗  ██████╗  ██████╗
//   // ██╔════╝╚██╗ ██╔╝████╗  ██║    ██╔══██╗██╔═══██╗██╔════╝
//   // ███████╗ ╚████╔╝ ██╔██╗ ██║    ██║  ██║██║   ██║██║
//   // ╚════██║  ╚██╔╝  ██║╚██╗██║    ██║  ██║██║   ██║██║
//   // ███████║   ██║   ██║ ╚████║    ██████╔╝╚██████╔╝╚██████╗
//   // ╚══════╝   ╚═╝   ╚═╝  ╚═══╝    ╚═════╝  ╚═════╝  ╚═════╝

//   get hash() {
//     return this.synDoc.hash;
//   }

//   get participants() {
//     return this.synDoc.participants;
//   }

//   async joinSession() {
//     await this.synDoc.joinSession();
//   }

//   async leaveSession() {
//     this.synDoc.leaveSession();
//   }

//   async change(delta: Delta | Delta[]) {
//     const deltas = Array.isArray(delta) ? delta : [delta];
//     console.log('GameSpace changes', deltas);

//     if (this.synDoc.inSession()) {
//       console.time('Running session change');
//       this.synDoc.change((state, _eph) => {
//         console.time('Running deltas');
//         for (const delta of deltas) {
//           applyDelta(delta, state);
//         }
//         console.timeEnd('Running deltas');
//       });
//       console.timeEnd('Running session change');
//     }
//   }

//   joinGame() {
//     this.change({ type: 'add-player', player: this.pubKeyB64 });
//   }

//   leaveGame() {
//     this.change({ type: 'remove-player', player: this.pubKeyB64 });
//   }

//   // ██████╗ ███████╗██████╗ ██╗██╗   ██╗███████╗██████╗
//   // ██╔══██╗██╔════╝██╔══██╗██║██║   ██║██╔════╝██╔══██╗
//   // ██║  ██║█████╗  ██████╔╝██║██║   ██║█████╗  ██║  ██║
//   // ██║  ██║██╔══╝  ██╔══██╗██║╚██╗ ██╔╝██╔══╝  ██║  ██║
//   // ██████╔╝███████╗██║  ██║██║ ╚████╔╝ ███████╗██████╔╝
//   // ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝╚═════╝

//   canJoinGame = derived(this.state, (latestState) => {
//     const alreadyJoined = !!latestState.players.find((v) => v === this.pubKeyB64);
//     if (alreadyJoined) return false;
//     const v = latestState.players.length;
//     const max = latestState.minMaxPlayers[1];
//     if (v >= max) return false;
//     return true;
//   });

//   canLeaveGame = derived(this.state, (latestState) => {
//     const alreadyJoined = !!latestState.players.find((v) => v === this.pubKeyB64);
//     if (!alreadyJoined) return false;
//     return true;
//   });

//   isSteward = derived(this.state, (latestState) => {
//     if (!latestState.isStewarded) return true;
//     return latestState.creator === this.pubKeyB64;
//   });
// }
