import { getContext as sGetContext, setContext as sSetContext } from 'svelte';
import { get, type Readable, type Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { v1 as uuidv1 } from 'uuid';

import { asyncDerived, pipe, sliceAndJoin, toPromise } from '@holochain-open-dev/stores';
import { LazyHoloHashMap } from '@holochain-open-dev/utils';
import {
  DocumentStore,
  SessionStore,
  SynClient,
  SynStore,
  WorkspaceStore,
} from '@holochain-syn/core';
import {
  type AgentPubKey,
  type AgentPubKeyB64,
  type AppClient,
  encodeHashToBase64,
  type EntryHash,
  type EntryHashB64,
  type Timestamp,
} from '@holochain/client';

import type { GameSpace } from './types';

const GAME_SPACE_TAG = 'game-space';

export type GameSpaceStore = ReturnType<typeof createGameSpaceStore>;

export type GameSpaceDelta = { type: 'set-name'; name: string };

const gameSpaceGrammar = {
  initialState(pubKey: Uint8Array) {
    const state: GameSpace = {
      name: 'Game Space',
      creator: encodeHashToBase64(pubKey),
      elements: [],
      wals: [],
      isStewarded: false,
      status: 'draft',
      minMaxPlayers: [1, 4],
    };
    return state;
  },

  applyDelta(delta: GameSpaceDelta, status: GameSpace) {
    switch (delta.type) {
      case 'set-name':
        status.name = delta.name;
        break;
    }
  },
};

export class GameSpaceSyn {
  session: SessionStore<any, any> | null;
  state = writable<GameSpace>(null);

  constructor(
    public document: DocumentStore<any, any>,
    public workspace: WorkspaceStore<any, any>,
  ) {
    workspace.latestState.subscribe((state) => {
      console.log('Workspace latest state', state);
      if (state.status === 'complete') {
        this.state.set(state.value);
      }
    });
    workspace.latestSnapshot.subscribe((snapshot) => {
      console.log('Workspace latest snapshot', snapshot);
      if (snapshot.status === 'complete') {
        this.state.set(snapshot.value);
      }
    });
  }

  // subscribe(sub: any, inv: any) {
  //   console.log('Subscribing!?', sub, inv);
  //   // return this.state.subscribe(sub, inv);
  // }

  async join() {
    this.session = await this.workspace.joinSession();
    this.session.state.subscribe((state) => {
      console.log('Game Space Session State!', state);
      this.state.set(state);
    });
  }

  async leave() {
    this.session.leaveSession();
    this.session = null;
  }

  async change(delta: GameSpaceDelta | GameSpaceDelta[]) {
    const deltas = Array.isArray(delta) ? delta : [delta];
    console.log('GameSpace changes', deltas);
    if (this.session) {
      this.session.change((state, _eph) => {
        for (const delta of deltas) {
          gameSpaceGrammar.applyDelta(delta, state);
        }
      });
    }
  }
}

export function createGameSpaceStore(appClient: AppClient) {
  const synStore = new SynStore(new SynClient(appClient, 'gamez', 'syn'));

  async function createGameSpace() {
    const initialState = gameSpaceGrammar.initialState(synStore.client.client.myPubKey);
    const document = await synStore.createDocument(initialState, {});
    const workspace = await document.createWorkspace(`${new Date()}`, undefined);
    synStore.client.tagDocument(document.documentHash, GAME_SPACE_TAG);

    return new GameSpaceSyn(document, workspace);
  }

  const gameSpaceDataHashMap = new LazyHoloHashMap((docHash) => {
    const document = synStore.documents.get(docHash);
    return pipe(document.allWorkspaces, (workspaces) => {
      return new GameSpaceSyn(
        document,
        new WorkspaceStore(document, Array.from(workspaces.keys())[0]),
      );
    });
  });

  function getAllGameSpaces() {
    const gameSpacesHashes = asyncDerived(synStore.documentsByTag.get(GAME_SPACE_TAG), (x) =>
      Array.from(x.keys()),
    );

    const gameSpacesData = pipe(gameSpacesHashes, (docHashes) =>
      sliceAndJoin(gameSpaceDataHashMap, docHashes),
    );
    return toPromise(gameSpacesData);
  }

  return { synStore, createGameSpace, getAllGameSpaces };
}

export const setContext = (getter: () => GameSpaceStore) =>
  sSetContext('gameSpaceStore', { store: getter });
export const getContext = () =>
  sGetContext<{ store: () => GameSpaceStore }>('gameSpaceStore').store();
