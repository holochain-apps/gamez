import { derived, get, writable } from 'svelte/store';

import { DocumentStore, SessionStore, WorkspaceStore } from '@holochain-syn/core';
import { type AgentPubKey, encodeHashToBase64 } from '@holochain/client';

import { type GameSpace } from '../types.d';
import { applyDelta, type Delta } from './grammar';

export class GameSpaceSyn {
  session: SessionStore<any, any> | null;
  state = writable<GameSpace>(null);
  pubKeyB64: string;

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

  // subscribe(sub: any, inv: any) {
  //   console.log('Subscribing!?', sub, inv);
  //   // return this.state.subscribe(sub, inv);
  // }

  async joinSession() {
    this.session = await this.workspace.joinSession();
    this.session.state.subscribe((state) => {
      console.log('SESSION STATE', state);
      // Little migration procedure
      if (!state.version) {
        this.session.change((state: GameSpace) => {
          // @ts-ignore
          state.version = '1';
          state.elements.forEach((el) => {
            el.rotation = 0;
            el.lock = {
              position: false,
              size: false,
              rotation: false,
              wals: false,
              config: false,
            };
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
      this.session.change((state, _eph) => {
        for (const delta of deltas) {
          applyDelta(delta, state);
        }
      });
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
