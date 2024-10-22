import { type WeaveClient } from '@theweave/api';
import { clone } from 'lodash';
import { getContext as sGetContext, setContext as sSetContext } from 'svelte';

import { ProfilesStore } from '@holochain-open-dev/profiles';
import { get, writable } from '@holochain-open-dev/stores';
import { SynClient, SynStore } from '@holochain-syn/core';
import { type AppClient } from '@holochain/client';

import SimplerSyn from '~/lib/SimplerSyn';

import { createGameSpaceSynStore, type GameSpaceSyn } from './gameSpaceStore';
import { initialState } from './grammar';
import migration from './migration';

export type RootStore = ReturnType<typeof createRootStore>;

export function createRootStore(
  appClient: AppClient,
  profilesStore: ProfilesStore,
  weaveClient: WeaveClient | null,
) {
  const synClient = new SynClient(appClient, 'gamez', 'syn');
  const synStore = new SynStore(synClient);
  const pubKey = synStore.client.client.myPubKey;

  const gameDocs = writable<{ [key: string]: GameSpaceSyn }>({});
  const simplerSyn = new SimplerSyn(
    appClient,
    (synDocs) => {
      gameDocs.update((val) => {
        const newVal = { ...val };
        synDocs.forEach((doc) => (newVal[doc.hash] = createGameSpaceSynStore(doc)));
        return newVal;
      });
    },
    migration,
    4,
  );

  async function createGameSpace() {
    const doc = await simplerSyn.createDoc(initialState(pubKey));
    return doc.hash;
  }

  function cloneGameSpace(hash: string) {}

  const a = { createGameSpace, gameDocs, weaveClient, profilesStore, pubKey, cloneGameSpace };
  //@ts-ignore
  window.store = a;
  return a;
}

export const setContext = (getter: () => RootStore) => sSetContext('rootStore', { store: getter });
export const getContext = () => sGetContext<{ store: () => RootStore }>('rootStore').store();
