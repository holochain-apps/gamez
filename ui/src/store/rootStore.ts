import { cloneDeep } from 'lodash';
import { getContext as sGetContext, setContext as sSetContext } from 'svelte';
import { derived, get, type Readable, writable } from 'svelte/store';

import { ProfilesStore } from '@holochain-open-dev/profiles';
import { SynStore } from '@holochain-syn/core';

import clients from '~/clients';
import SimplerSyn from '~/lib/SimplerSyn';
import { hashToWAL } from '~/lib/util';

import { createGameSpaceSynStore, type GameSpaceSyn } from './gameSpaceStore';
import { initialState } from './grammar';
import migration from './migration';
import { type GameSpace, VERSION } from './types';
import validateGameSpace from './validateGameSpace';

export function createRootStore() {
  const gameDocs = writable<{ [key: string]: GameSpaceSyn }>({});
  const statesMap = writable<{ [key: string]: GameSpace }>({});

  const loadedGameSpaceStores = derived(
    [gameDocs, statesMap],
    ([gameSpaceStores, gameSpaceStoresStates]) => {
      return Object.entries(gameSpaceStores).reduce(
        (all, [hash, store]) => {
          if (gameSpaceStoresStates[hash]) {
            all[hash] = store;
          }
          return all;
        },
        {} as { [key: string]: GameSpaceSyn },
      );
    },
  );

  const simplerSyn = new SimplerSyn(
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

  async function createGameSpace(from: Partial<GameSpace> = {}) {
    const doc = await simplerSyn.createDoc({ ...initialState(clients.agentKeyB64), ...from });
    return doc.hash;
  }

  async function cloneGameSpace(hash: string, extendWith: Partial<GameSpace> = {}) {
    const $statesMap = get(statesMap);
    const $state = $statesMap[hash];
    const $clonedState = cloneDeep($state);
    $clonedState.lastChangeAt = Date.now();
    $clonedState.creator = clients.agentKeyB64;
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
        const file = e.currentTarget.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target.result as string;
          const state = JSON.parse(text) as GameSpace;
          const validState = validateGameSpace(state);
          if (validState) {
            validState.playersSlots = validState.playersSlots.map((s) => ({ ...s, pubKey: null }));
            validState.creator = clients.agentKeyB64;
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

  return {
    createGameSpace,
    gameDocs,
    gameSpaceStores: gameDocs,
    loadedGameSpaceStores,
    readyGameSpace,
    cloneGameSpace,
    deleteGameSpace,
    importFromJson,
    statesMap,
  };
}

export type RootStore = ReturnType<typeof createRootStore>;

export const createRootStoreContext = () => sSetContext('rootStore', createRootStore());
export const getContext = () => sGetContext<RootStore>('rootStore');
