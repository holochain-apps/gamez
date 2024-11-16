import { type WAL, type WeaveClient } from '@theweave/api';
import { cloneDeep, zipObject } from 'lodash';
import { getContext as sGetContext, setContext as sSetContext } from 'svelte';
import { derived, get, type Readable, writable } from 'svelte/store';

import { ProfilesStore } from '@holochain-open-dev/profiles';
import { SynClient, SynStore } from '@holochain-syn/core';
import {
  type AppClient,
  decodeHashFromBase64,
  type DnaHash,
  encodeHashToBase64,
} from '@holochain/client';

import SimplerSyn from '~/lib/SimplerSyn';
import { getMyDna } from '~/lib/util';

import { createGameSpaceSynStore, type GameSpaceSyn } from './gameSpaceStore';
import { initialState } from './grammar';
import migration from './migration';
import { type GameSpace, VERSION } from './types';
import validateGameSpace from './validateGameSpace';

export type RootStore = ReturnType<typeof createRootStore>;

const ROLE_NAME = 'gamez';

export function createRootStore(
  appClient: AppClient,
  profilesStore: ProfilesStore,
  weaveClient: WeaveClient | null,
) {
  const synClient = new SynClient(appClient, ROLE_NAME, 'syn');
  const synStore = new SynStore(synClient);
  const pubKey = encodeHashToBase64(synStore.client.client.myPubKey);
  const _dnaHash = writable<DnaHash | null>(null);
  const dnaHash = derived(_dnaHash, ($dnaHash) => $dnaHash);

  const gameDocs = writable<{ [key: string]: GameSpaceSyn }>({});
  const statesMap = writable<{ [key: string]: GameSpace }>({});
  const simplerSyn = new SimplerSyn(
    appClient,
    (synDocs, deletedDocs) => {
      gameDocs.update((val) => {
        const newVal = { ...val };
        synDocs.forEach((doc) => (newVal[doc.hash] = createGameSpaceSynStore(doc)));
        deletedDocs.forEach((hash) => delete newVal[hash]);
        return newVal;
      });
      statesMap.update((val) => {
        const newVal = { ...val };
        synDocs.forEach((doc) => (newVal[doc.hash] = get(doc.state)));
        deletedDocs.forEach((hash) => delete newVal[hash]);
        return newVal;
      });

      const states = synDocs.map((doc) => [doc.hash, doc.state] as [string, Readable<any>]);
      states.forEach(([hash, state]) => {
        state.subscribe(($state) => {
          statesMap.update(($statesMap) => {
            return { ...$statesMap, [hash]: $state };
          });
        });
      });
    },
    migration,
    VERSION,
  );

  getMyDna(ROLE_NAME, appClient).then((hash) => {
    _dnaHash.set(hash);
  });

  async function createGameSpace(from: Partial<GameSpace> = {}) {
    const doc = await simplerSyn.createDoc({ ...initialState(pubKey), ...from });
    return doc.hash;
  }

  async function cloneGameSpace(hash: string, extendWith: Partial<GameSpace> = {}) {
    const $statesMap = get(statesMap);
    const $state = $statesMap[hash];
    const $clonedState = cloneDeep($state);
    $clonedState.lastChangeAt = Date.now();
    $clonedState.creator = pubKey;
    $clonedState.name = `Clone of ${$state.name}`;

    const $states = Object.values(get(statesMap));
    let number = 1;
    while ($states.find(($state) => $state.name === $clonedState.name)) {
      number++;
      $clonedState.name = `Clone of ${$state.name} ${number}`;
    }

    const doc = await simplerSyn.createDoc({ ...$clonedState, ...extendWith });
    return doc.hash;
  }

  async function deleteGameSpace(hash: string) {
    console.log('Deleting game space', hash);
    gameDocs.update(($gameDocs) => {
      const $newGameDocs = { ...$gameDocs };
      delete $newGameDocs[hash];
      return $newGameDocs;
    });
    statesMap.update(($statesMap) => {
      const $newStatesMap = { ...$statesMap };
      delete $newStatesMap[hash];
      return $newStatesMap;
    });
    await simplerSyn.removeDoc(hash);
  }

  function importFromJson(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.addEventListener('change', (e: any) => {
        console.log('READING!');
        const file = e.currentTarget.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target.result as string;
          const state = JSON.parse(text) as GameSpace;
          const validState = validateGameSpace(state);
          if (validState) {
            validState.creator = pubKey;
            resolve(createGameSpace(validState));
          } else {
            reject(new Error('Invalid game space'));
          }
        };
        reader.readAsText(file);
      });
      input.click();
    });
  }

  function readyGameSpace(hash: string): Readable<GameSpaceSyn | null> {
    return derived([gameDocs, statesMap], ([$gameDocs, $statesMap]) =>
      $statesMap[hash] ? $gameDocs[hash] : null,
    );
  }

  function addToPocket(gameSpace: GameSpaceSyn) {
    const $dnaHash = get(dnaHash);
    if ($dnaHash && weaveClient) {
      const attachment: WAL = {
        hrl: [$dnaHash, decodeHashFromBase64(gameSpace.hash)],
        context: {},
      };
      weaveClient.walToPocket(attachment);
    } else {
      console.log('Tried adding to pocket before the DNA hash was loaded');
    }
  }

  return {
    createGameSpace,
    gameDocs,
    weaveClient,
    profilesStore,
    pubKey,
    readyGameSpace,
    cloneGameSpace,
    deleteGameSpace,
    importFromJson,
    statesMap,
    addToPocket,
    dnaHash,
  };
}

export const setContext = (getter: () => RootStore) => sSetContext('rootStore', { store: getter });
export const getContext = () => sGetContext<{ store: () => RootStore }>('rootStore').store();
