import { type WeaveClient } from '@theweave/api';
import { getContext as sGetContext, setContext as sSetContext } from 'svelte';

import { ProfilesStore } from '@holochain-open-dev/profiles';
import { get, writable } from '@holochain-open-dev/stores';
import { SynClient, SynStore } from '@holochain-syn/core';
import { type AppClient } from '@holochain/client';

import SimplerSyn from '~/lib/SimplerSyn';

import { createGameSpaceSynStore, type GameSpaceSyn } from './GameSpaceSyn';
import { initialState } from './grammar';

export type GameSpaceStore = ReturnType<typeof createGameSpaceStore>;

export function createGameSpaceStore(
  appClient: AppClient,
  profilesStore: ProfilesStore,
  weaveClient: WeaveClient | null,
) {
  const synClient = new SynClient(appClient, 'gamez', 'syn');
  const synStore = new SynStore(synClient);
  const pubKey = synStore.client.client.myPubKey;

  const gameDocs = writable<{ [key: string]: GameSpaceSyn }>({});
  const simplerSyn = new SimplerSyn(appClient, (synDocs) => {
    gameDocs.update((val) => {
      const newVal = { ...val };
      synDocs.forEach((doc) => (newVal[doc.hash] = createGameSpaceSynStore(doc)));
      return newVal;
    });
  });

  // simplerSyn.docs.subscribe((docs) => {
  //   const currentGameDocs = get(gameDocs);
  //   const newDocsHashes = Object.keys(docs).filter((key) => !currentGameDocs[key]);
  //   if (newDocsHashes.length) {
  //     gameDocs.update((val) => {
  //       const newVal = { ...val };
  //       newDocsHashes.forEach((hash) => {
  //         newVal[hash] = createGameSpaceSynStore(docs[hash]);
  //       });
  //       return newVal;
  //     });
  //   }
  // });

  async function createGameSpace() {
    const doc = await simplerSyn.createDoc(initialState(pubKey));
    return doc.hash;
    // gameDocs.update((val) => {
    //   const newVal = { ...val };
    //   newVal[doc.hash] = createGameSpaceSynStore(doc);
    //   return newVal;
    // });
    // return doc;
  }

  const a = { createGameSpace, gameDocs, weaveClient, profilesStore, pubKey };
  //@ts-ignore
  window.store = a;
  return a;
}

export const setContext = (getter: () => GameSpaceStore) =>
  sSetContext('gameSpaceStore', { store: getter });
export const getContext = () =>
  sGetContext<{ store: () => GameSpaceStore }>('gameSpaceStore').store();
