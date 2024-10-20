import { asyncDerived, get, pipe, toPromise, writable } from '@holochain-open-dev/stores';
import {
  DocumentStore,
  SessionStore,
  SynClient,
  SynStore,
  WorkspaceStore,
} from '@holochain-syn/core';
import { type AppClient, encodeHashToBase64 } from '@holochain/client';

const ROOT_TAG = 'simpler-syn';

export default class SimplerSyn {
  synClient: SynClient;
  synStore: SynStore;

  docs = writable<{ [key: string]: SynDoc }>({});
  pubKey: string;

  constructor(
    private appClient: AppClient,
    private onDocsLoaded: (synDoc: SynDoc[]) => void,
  ) {
    this.synClient = new SynClient(appClient, 'gamez', 'syn');
    this.synStore = new SynStore(this.synClient);

    this.pubKey = encodeHashToBase64(this.synClient.client.myPubKey);

    this.synStore.documentsByTag.get(ROOT_TAG).subscribe(async (latestDocs) => {
      if (latestDocs.status === 'complete') {
        const currentDocs = get(this.docs);
        const newDocs = latestDocs.value
          .values()
          .filter((doc) => !currentDocs[encodeHashToBase64(doc.documentHash)]);

        const synDocs = await Promise.all(
          newDocs
            .map((doc) => {
              doc.documentHash;
              return pipe(doc.allWorkspaces, (workspacesMap) => {
                const firstWorkspaceHash = Array.from(workspacesMap.keys())[0];
                const workspace = new WorkspaceStore(doc, firstWorkspaceHash);
                const synDoc = new SynDoc(this.pubKey, doc, workspace);
                return synDoc;
              });
            })
            .map(toPromise)
            .toArray(),
        );

        this.docs.update((val) => {
          const newVal = { ...val };
          synDocs.forEach((synDoc) => {
            newVal[synDoc.hash] = synDoc;
          });
          return newVal;
        });
        this.onDocsLoaded(synDocs);
      }
    });
  }

  public async createDoc(initialState: any) {
    const document = await this.synStore.createDocument(initialState, {});
    const workspace = await document.createWorkspace(`${new Date()}`, undefined);
    const synDoc = new SynDoc(this.pubKey, document, workspace);
    this.synStore.client.tagDocument(document.documentHash, ROOT_TAG);
    this.docs.update((val) => {
      return { ...val, [synDoc.hash]: synDoc };
    });
    this.onDocsLoaded([synDoc]);
    return synDoc;
  }
}

export class SynDoc {
  state = writable<any>(null);
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
  ) {
    this.pubKey = pubKey;
    this.document = document;
    this.workspace = workspace;

    this.hash = encodeHashToBase64(this.document.documentHash);

    workspace.latestState.subscribe((state) => {
      if (state.status === 'complete') {
        if (!this.session) {
          console.log('Setting state from latestState', state);
          this.state.set(state.value);
        }
      }
    });

    workspace.latestSnapshot.subscribe((snapshot) => {
      if (snapshot.status === 'complete') {
        if (!this.session) {
          console.log('Setting state from latestSnapshot', snapshot);
          this.state.set(snapshot.value);
        }
      }
    });
  }

  public async joinSession() {
    this.session = await this.workspace.joinSession();
    this.session.state.subscribe((state) => {
      console.log('SESSION STATE', state);
      this.state.set(state);
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

  public change(updateFn: (state: any, ephState: any) => void) {
    return this.session.change(updateFn);
  }
}
