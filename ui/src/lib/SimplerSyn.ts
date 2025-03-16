import { isEqual } from 'lodash';
import { derived } from 'svelte/store';

import { get, pipe, toPromise, writable } from '@holochain-open-dev/stores';
import { DocumentStore, SessionStore, SynStore, WorkspaceStore } from '@holochain-syn/core';
import { decodeHashFromBase64, encodeHashToBase64 } from '@holochain/client';

import { VERSION } from '~/store/types';

import clients from '../clients';

export const ROOT_TAG = `simpler-syn-${VERSION}`;

export default class SimplerSyn {
  docs = writable<{ [key: string]: SynDoc }>({});
  pubKey: string;
  synStore: SynStore;

  constructor(
    private onDocsLoaded: (synDocs: SynDoc[], deletedDocs: string[]) => void,
    private migrationFun: (state: any) => any = (state) => state,
    private documentVersion: number = 0,
  ) {
    this.pubKey = clients.agentKeyB64;
    this.synStore = new SynStore(clients.syn);
    let prevDocsHashes: string[] = null;
    this.synStore.documentsByTag.get(ROOT_TAG).subscribe(async (latestDocs) => {
      if (latestDocs.status === 'complete') {
        const currentDocs = get(this.docs);

        const newDocs = Array.from(latestDocs.value.values()).filter(
          (doc) => !currentDocs[encodeHashToBase64(doc.documentHash)],
        );

        const synDocs = await Promise.all(
          newDocs
            .map((doc) => {
              return pipe(doc.allWorkspaces, (workspacesMap) => {
                const firstWorkspaceHash = Array.from(workspacesMap.keys())[0];
                const workspace = new WorkspaceStore(doc, firstWorkspaceHash);
                const synDoc = new SynDoc(
                  this.pubKey,
                  doc,
                  workspace,
                  null,
                  this.migrationFun,
                  this.documentVersion,
                );
                return synDoc;
              });
            })
            .map(toPromise),
        );

        // Find deleted docs
        const newDocsHashes = Array.from(latestDocs.value.keys()).map(encodeHashToBase64);
        let deletedDocs: string[] = [];
        if (!prevDocsHashes) {
          prevDocsHashes = newDocsHashes;
        } else {
          deletedDocs = [...prevDocsHashes];
          newDocsHashes.forEach((hash) => {
            if (deletedDocs.includes(hash)) {
              deletedDocs.splice(deletedDocs.indexOf(hash), 1);
            }
          });
          prevDocsHashes = newDocsHashes;
        }

        this.docs.update((val) => {
          const newVal = { ...val };
          synDocs.forEach((synDoc) => {
            newVal[synDoc.hash] = synDoc;
          });
          return newVal;
        });
        this.onDocsLoaded(synDocs, deletedDocs);
      }
    });
  }

  public async createDoc(initialState: any) {
    const document = await this.synStore.createDocument(initialState, {});
    const workspace = await document.createWorkspace(`${new Date()}`, undefined);
    const synDoc = new SynDoc(
      this.pubKey,
      document,
      workspace,
      initialState,
      this.migrationFun,
      this.documentVersion,
    );
    this.synStore.client.tagDocument(document.documentHash, ROOT_TAG);
    this.docs.update((val) => {
      return { ...val, [synDoc.hash]: synDoc };
    });
    this.onDocsLoaded([synDoc], []);
    return synDoc;
  }

  public async removeDoc(hash: string) {
    await clients.syn.removeDocumentTag(decodeHashFromBase64(hash), ROOT_TAG);
    this.onDocsLoaded([], [hash]);
  }
}

export class SynDoc {
  state = writable<any>(null);
  private _ephemeral = writable<any>(null);
  ephemeral = derived(this._ephemeral, ($ephemeral) => $ephemeral);
  migratedState = writable<any>(null);
  private session: SessionStore<any, any> | null = null;

  private document: DocumentStore<any, any>;
  private workspace: WorkspaceStore<any, any>;
  hash: string;
  pubKey: string;
  participants = writable<{ active: Uint8Array[]; idle: Uint8Array[]; offline: Uint8Array[] }>(
    null,
  );

  constructor(
    pubKey: string,
    document: DocumentStore<any, any>,
    workspace: WorkspaceStore<any, any>,
    preloadedState: any,
    private migrationFun: (state: any) => any = (state) => state,
    private documentVersion: number = 0,
  ) {
    this.pubKey = pubKey;
    this.document = document;
    this.workspace = workspace;

    this.hash = encodeHashToBase64(this.document.documentHash);
    if (preloadedState) this.state.set(preloadedState);

    workspace.latestState.subscribe((state) => {
      if (state.status === 'complete') {
        if (!this.session) {
          const $state = get(this.state);
          if (!isEqual(state.value, $state)) {
            // console.log(state.value, $state);
            console.log('Setting state from latestState', state.value);
            this.state.set(state.value);
          }
        }
      }
    });

    // workspace.latestSnapshot.subscribe((snapshot) => {
    //   if (snapshot.status === 'complete') {
    //     if (!this.session) {
    //       console.log('Setting state from latestSnapshot', snapshot);
    //       this.state.set(snapshot.value);
    //     }
    //   }
    // });

    // If the document has a different version from the document version, run migration
    this.state.subscribe(async (state) => {
      if (state) {
        if (state.version !== undefined && state.version !== this.documentVersion) {
          console.log("Document version doesn't match, running migration");
          await this.change(this.migrationFun);
          console.log('Migration done');
        }
      }
    });
  }

  public async joinSession() {
    if (!this.session) this.session = await this.workspace.joinSession();
    // Should I clean up after the session is left?
    this.session.state.subscribe((state) => {
      // console.log('SESSION STATE', state);
      this.state.set(state);
    });
    this.session.ephemeral.subscribe((state) => {
      this._ephemeral.set(state);
    });
    this.session.participants.subscribe(($participants) => {
      this.participants.set($participants);
    });
  }

  public async leaveSession() {
    if (this.session) {
      this.session.leaveSession();
      this.session = null;
      this.participants.set(null);
    }
  }

  public inSession() {
    return !!this.session;
  }

  public async change(updateFn: (state: any, ephState: any) => void, force: boolean = false) {
    const wasInSession = !!this.session;
    if (!wasInSession && !force) {
      console.warn(
        'Attempting to run a change while not in session; use force = true for this; which will join the session temporarily',
      );
      return;
    }
    if (!wasInSession) {
      console.log('Joining session temporarily for change');
      await this.joinSession();
    }
    this.session.change(updateFn);

    if (!wasInSession) {
      // How do I wait until the changes are finished?
      setTimeout(async () => {
        if (!wasInSession) {
          console.log('Leaving session temporarily for change');
          await this.leaveSession();
        }
      }, 2000);
    }
  }
}
