import { getContext as sGetContext, setContext as sSetContext } from 'svelte';

import { hash } from '@holochain-open-dev/utils';

import clients from '~/clients';

import { createDocsStore, type DocStore } from './docs.svelte';
import { initialState } from './grammar';
import presets from './presets';
// import * as syn from './syn-store.svelte';
import { type GameSpace } from './types';
import validateGameSpace from './validateGameSpace';

export type MainStore = ReturnType<typeof createMainStore>;

type GameSpacesMap = { [key: string]: DocStore<GameSpace> };

function createMainStore() {
  const docs = createDocsStore<GameSpace>();
  // const synStore = syn.createMainStore<GameSpace>();

  Object.entries(presets).forEach(([hash, preset]) => {
    if (!docs[hash]) {
      docs.setDocument(hash, preset);
    }
  });

  type Cmd =
    | ['create-document', GameSpace]
    | ['create-gamespace', Partial<GameSpace>]
    | ['import-from-json']
    | ['delete-gamespace', string]
    | ['archive', string]
    | ['unarchive', string]
    | ['export-as-json', string];

  async function commands(...cmd: Cmd) {
    switch (cmd[0]) {
      case 'create-gamespace': {
        return docs.createDocument(cmd[1] ? { ...initialState(), ...cmd[1] } : initialState());
        break;
      }
      case 'import-from-json': {
        return await importFromJson();
        break;
      }
      case 'export-as-json': {
        const { doc } = docs.docs[cmd[1]]!;
        const filename = doc.name.toLocaleLowerCase().replaceAll(/\s+/g, '-') + '.json';
        const jsonString = JSON.stringify($state, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
      }
      case 'create-document': {
        return docs.createDocument(cmd[1]);
        break;
      }
      case 'delete-gamespace': {
        docs.deleteDocument(cmd[1]);
        break;
      }
      case 'archive': {
        docs.docs[cmd[1]].update({ isArchived: true });
      }
      case 'unarchive': {
        docs.docs[cmd[1]].update({ isArchived: false });
      }
    }
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
            resolve(commands('create-document', validState));
          } else {
            reject(new Error('Invalid game space'));
          }
        };
        reader.readAsText(file);
      });
      input.click();
    });
  }

  let gameSpaces = $derived(
    Object.entries(docs.docs).reduce((all, [hash, doc]) => {
      if (!doc.doc.isLibraryItem && !doc.doc.isArchived) {
        all[hash] = doc;
      }
      return all;
    }, {} as GameSpacesMap),
  );

  let libraryItems = $derived(
    Object.entries(docs.docs).reduce((all, [hash, doc]) => {
      if (doc.doc.isLibraryItem && !doc.doc.isArchived) {
        all[hash] = doc;
      }
      return all;
    }, {} as GameSpacesMap),
  );

  let archivedGameSpaces = $derived(
    Object.entries(docs.docs).reduce((all, [hash, doc]) => {
      if (!doc.doc.isLibraryItem && doc.doc.isArchived) {
        all[hash] = doc;
      }
      return all;
    }, {} as GameSpacesMap),
  );

  let archivedLibraryItems = $derived(
    Object.entries(docs.docs).reduce((all, [hash, doc]) => {
      if (doc.doc.isLibraryItem && doc.doc.isArchived) {
        all[hash] = doc;
      }
      return all;
    }, {} as GameSpacesMap),
  );

  return {
    cmd: commands,
    get gameSpaces() {
      return gameSpaces;
    },
    get libraryItems() {
      return libraryItems;
    },
    get archivedGameSpaces() {
      return archivedGameSpaces;
    },
    get archivedLibraryItems() {
      return archivedLibraryItems;
    },
    get docs() {
      return docs.docs;
    },
  };
}

export const createStoreContext = () => sSetContext('main-store', createMainStore());
export const getContext = () => sGetContext<MainStore>('main-store');
