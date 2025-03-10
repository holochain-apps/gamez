import { decode, encode } from '@msgpack/msgpack';
import Automerge from 'automerge';
import { onMount } from 'svelte';

import { type Commit, type Document } from '@holochain-syn/dev/packages/client/dist/types';

import clients from '~/clients';
import { b64ToHash, hashToB64 } from '~/lib/util';

const ROOT_TAG = 'default';

function stateFromDocument<T>(document: Document) {
  const documentInitialState = decode(document.initial_state) as Automerge.BinaryDocument;
  const state = Automerge.load<T>(documentInitialState);
  return state;
}

function createMainStore<T>() {
  // let documentsHashes = $state<string[]>([]);
  // let loadedDocuments = $state<{ [key: string]: Automerge.Doc<T> }>({});
  let docs = $state<{
    [key: string]: ReturnType<typeof createDocumentStore<T>> | null;
  }>({});

  onMount(() => {
    function pollDocuments() {
      clients.syn.getDocumentsWithTag(ROOT_TAG).then((links) => {
        links
          .map((link) => hashToB64(link.target))
          .forEach((hash) => {
            if (!docs[hash]) {
              docs[hash] = null;
            }
          });
      });
    }
    // TODO: Listen to LinkCreated and LinkDeleted signals
    pollDocuments();
    const interval = setInterval(pollDocuments, 5000);
    return () => clearInterval(interval);
  });

  $effect(() => {
    for (let hash in docs) {
      const doc = docs[hash];
      if (!doc) {
        clients.syn.getDocument(b64ToHash(hash)).then((doc) => {
          console.log('DOCUMENT', stateFromDocument(doc.entry));
          docs[hash] = createDocumentStore<T>(stateFromDocument<T>(doc.entry));
          docs[hash].setHash(hash);
        });
      }
    }
  });

  async function createDocument(initialState: T): Promise<string> {
    // Create the document
    console.log('Creating new document');
    const newStore = createDocumentStore(Automerge.from(initialState));
    // let doc: Automerge.Doc<T> = Automerge.from(initialState);

    const entryRecord = await clients.syn.createDocument({
      initial_state: newStore.encodedDoc(),
      meta: undefined,
    });
    console.log('Document entry record', entryRecord);

    console.log('Tagging document');

    await clients.syn.tagDocument(entryRecord.actionHash, ROOT_TAG);

    const hash = hashToB64(entryRecord.actionHash);
    newStore.setHash(hash);

    docs = { ...docs, [hash]: newStore };

    return hash;
  }

  return {
    get docs() {
      return docs;
    },
    createDocument,
  };
}

function createDocumentStore<T>(initialDoc: ReturnType<typeof Automerge.from<T>>) {
  let hash = $state<string>(null!);
  let doc = $state<Automerge.Doc<T>>(initialDoc);
  let participants = $state<string[] | null>(null);
  let isSyncing = $state<boolean>(false);

  function enterSync() {}

  function leaveSync() {}

  async function update(fun: (state: T) => void) {
    // if (!isSyncing) return;
    console.log(`Updating document ${hash}`);
    const newDoc = Automerge.change(doc, fun);
    const stateChanges = Automerge.getChanges(doc, newDoc);
    console.log('State changes', stateChanges);
    doc = newDoc;
    const commit: Commit = {
      authors: [clients.agent],
      meta: null,
      previous_commit_hashes: [],
      state: encodedDoc(),
      witnesses: [],
      document_hash: b64ToHash(hash),
    };

    const newCommit = await clients.syn.createCommit(commit);
    console.log('Created commit', newCommit);
  }

  function setHash(newHash: string) {
    hash = newHash;
  }

  function encodedDoc() {
    return encode(Automerge.save(doc));
  }

  return {
    update,
    setHash,
    enterSync,
    leaveSync,
    encodedDoc,
    get isSyncing() {
      return isSyncing;
    },
    get doc() {
      return doc;
    },
    get participants() {
      return participants;
    },
  };
}

export { createMainStore, createDocumentStore };
