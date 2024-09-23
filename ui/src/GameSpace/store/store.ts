import { getContext as sGetContext, setContext as sSetContext } from 'svelte';

import { asyncDerived, pipe, sliceAndJoin, toPromise } from '@holochain-open-dev/stores';
import { LazyHoloHashMap } from '@holochain-open-dev/utils';
import { SynClient, SynStore, WorkspaceStore } from '@holochain-syn/core';
import { type AppClient } from '@holochain/client';

import { GameSpaceSyn } from './GameSpaceSyn';
import { initialState } from './grammar';

const GAME_SPACE_TAG = 'game-space';

export type GameSpaceStore = ReturnType<typeof createGameSpaceStore>;

// export class GameSpaceStore {
//   constructor(private appClient: AppClient) {

//   }
// }

export function createGameSpaceStore(appClient: AppClient) {
  const synStore = new SynStore(new SynClient(appClient, 'gamez', 'syn'));
  const pubKey = synStore.client.client.myPubKey;

  async function createGameSpace() {
    const document = await synStore.createDocument(initialState(pubKey), {});
    const workspace = await document.createWorkspace(`${new Date()}`, undefined);
    synStore.client.tagDocument(document.documentHash, GAME_SPACE_TAG);

    return new GameSpaceSyn(document, workspace, synStore.client.client.myPubKey);
  }

  const gameSpaceDataHashMap = new LazyHoloHashMap((docHash) => {
    const document = synStore.documents.get(docHash);
    return pipe(document.allWorkspaces, (workspaces) => {
      return new GameSpaceSyn(
        document,
        new WorkspaceStore(document, Array.from(workspaces.keys())[0]),
        pubKey,
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

  return { createGameSpace, getAllGameSpaces };
}

export const setContext = (getter: () => GameSpaceStore) =>
  sSetContext('gameSpaceStore', { store: getter });
export const getContext = () =>
  sGetContext<{ store: () => GameSpaceStore }>('gameSpaceStore').store();
