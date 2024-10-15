import { derived, get, writable } from 'svelte/store';

import { DocumentStore, SessionStore, WorkspaceStore } from '@holochain-syn/core';
import { type AgentPubKey, encodeHashToBase64 } from '@holochain/client';

import { type GameSpace, type GElement } from '../types';
import { applyDelta, type Delta } from './grammar';

type UiState = {
  zoom: number;
  panX: number;
  panY: number;
  surfaceContainer: HTMLDivElement;
};

export class GameSpaceSyn {
  session: SessionStore<any, any> | null;
  state = writable<GameSpace>(null);
  ui = writable<UiState>({ zoom: 1, panX: 0, panY: 0, surfaceContainer: null });
  pubKeyB64: string;
  elements = derived(this.state, (state) => {
    return state.elements.reduce(
      (el, next) => {
        el[next.uuid] = next;
        return el;
      },
      {} as { [key: string]: GElement },
    );
  });

  constructor(
    public document: DocumentStore<any, any>,
    public workspace: WorkspaceStore<any, any>,
    public pubKey: AgentPubKey,
  ) {
    this.pubKeyB64 = encodeHashToBase64(pubKey);
    workspace.latestState.subscribe((state) => {
      if (state.status === 'complete') {
        if (!this.session) {
          // console.log('Setting state from latestState', state);
          this.state.set(state.value);
        }
      }
    });
    workspace.latestSnapshot.subscribe((snapshot) => {
      if (snapshot.status === 'complete') {
        if (!this.session) {
          // console.log('Setting state from latestSnapshot', snapshot);
          this.state.set(snapshot.value);
        }
      }
    });
  }

  updateUiState(uiState: UiState) {
    this.ui.set(uiState);
  }

  getSurfaceCoordinates(clientX, clientY): { x: number; y: number } | null {
    const ui = get(this.ui);
    const { left, top, width, height } = ui.surfaceContainer.getBoundingClientRect();
    if (clientX < left || clientX > left + width || clientY < top || clientY > top + height) {
      return null;
    }
    const surfaceX = clientX - left;
    const surfaceY = clientY - top;
    return { x: surfaceX / ui.zoom - ui.panX, y: surfaceY / ui.zoom - ui.panY };
  }

  getCurrentCenter(): { x: number; y: number } {
    const ui = get(this.ui);
    const { width, height } = ui.surfaceContainer.getBoundingClientRect();
    return {
      x: width / 2 / ui.zoom - ui.panX,
      y: height / 2 / ui.zoom - ui.panY,
    };
  }

  // subscribe(sub: any, inv: any) {
  //   console.log('Subscribing!?', sub, inv);
  //   // return this.state.subscribe(sub, inv);
  // }

  async joinSession() {
    this.session = await this.workspace.joinSession();
    this.session.state.subscribe((state) => {
      console.log('SESSION STATE', state);
      // Little migration procedure
      if (state.version === 2) {
        console.log('MIGRATION');
        this.session.change((state: GameSpace) => {
          // @ts-ignore
          state.version = 3;
          state.elements.forEach((el) => {
            if (el.type === 'PieceSource' && (el.version as any) === 1) {
              console.log('Migrating piece!');
              el.version = 2;
              el.pieceW = 30;
              el.pieceH = 30;
            }
          });
        });
      } else {
        this.state.set(state);
      }
    });
  }

  async leaveSession() {
    this.session.leaveSession();
    this.session = null;
  }

  async change(delta: Delta | Delta[]) {
    const deltas = Array.isArray(delta) ? delta : [delta];
    console.log('GameSpace changes', deltas);
    if (this.session) {
      console.time('Running session change');
      this.session.change((state, _eph) => {
        console.time('Running deltas');
        for (const delta of deltas) {
          applyDelta(delta, state);
        }
        console.timeEnd('Running deltas');
      });
      console.timeEnd('Running session change');
    }
  }

  canJoinGame = derived(this.state, (latestState) => {
    const alreadyJoined = !!latestState.players.find((v) => v === this.pubKeyB64);
    if (alreadyJoined) return false;
    const v = latestState.players.length;
    const max = latestState.minMaxPlayers[1];
    if (v >= max) return false;
    return true;
  });

  canLeaveGame = derived(this.state, (latestState) => {
    const alreadyJoined = !!latestState.players.find((v) => v === this.pubKeyB64);
    if (!alreadyJoined) return false;
    return true;
  });

  joinGame() {
    this.change({ type: 'add-player', player: this.pubKeyB64 });
  }

  leaveGame() {
    this.change({ type: 'remove-player', player: this.pubKeyB64 });
  }

  isSteward = derived(this.state, (latestState) => {
    if (!latestState.isStewarded) return true;
    return latestState.creator === this.pubKeyB64;
  });

  topZ(pieceId: string = null) {
    const elements = get(this.state).elements;
    const piece = pieceId ? elements.find((v) => v.uuid === pieceId) : null;
    const maxZ = elements.reduce((max, el) => (el.z > max ? el.z : max), 0);
    const maxZCount = elements.filter((v) => v.z === maxZ).length;
    const shouldIncreaseZ = piece ? piece.z < maxZ || (piece.z === maxZ && maxZCount > 1) : true;
    return shouldIncreaseZ ? maxZ + 1 : piece.z;
  }

  el(pieceId) {
    return get(this.state).elements.find((v) => v.uuid === pieceId);
  }
}
