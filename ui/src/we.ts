import type {
  AppletHash,
  AppletServices,
  AssetInfo,
  RecordInfo,
  WAL,
  WeaveServices,
} from '@theweave/api';

import { asyncDerived, pipe, sliceAndJoin, toPromise } from '@holochain-open-dev/stores';
import { LazyHoloHashMap } from '@holochain-open-dev/utils';
import { DocumentStore, SynClient, SynStore, WorkspaceStore } from '@holochain-syn/core';
import type { AppClient, RoleName } from '@holochain/client';

import { ROOT_TAG } from './lib/SimplerSyn';
import { getMyDna } from './lib/util';
import { type GameSpace } from './store';

const ROLE_NAME = 'gamez';
const ZOME_NAME = 'syn';

const ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style="enable-background:new 0 0 64 64" xml:space="preserve"><path d="M6 12c0-3.3 2.7-6 6-6h40c3.3 0 6 2.7 6 6v40c0 3.3-2.7 6-6 6H12c-3.3 0-6-2.7-6-6V12z" style="fill:%23fff"/><path d="M4 12c0-4.4 3.6-8 8-8h8v16H8v12h12v12H8v2c0 2.8 5.1 5.1 12 5.8V44h12v7.4c4.4-.7 8.5-2 12-3.8V44h5.6c4-3.3 6.4-7.5 6.4-12h2v20c0 3.3-2.7 6-6 6h-8v2H12c-4.4 0-8-3.6-8-8V12zm28 20v12h12V32H32zm12 0h12V20H44v12zm0-12V8H32v12h12zm-12 0H20v12h12V20z" style="fill:%23acbdc5"/><path d="M32 56H20v-4.2c1.3.1 2.6.2 4 .2 2.8 0 5.4-.2 8-.6V56zm12-8.4V56h12V44h-6.4c-1.6 1.3-3.5 2.6-5.6 3.6z" style="fill:%23597380"/><path d="M20 4h32c4.4 0 8 3.6 8 8v40c0 4.4-3.6 8-8 8h-8v-4h8c2.2 0 4-1.8 4-4V12c0-2.2-1.8-4-4-4H20V4z" style="fill-rule:evenodd;clip-rule:evenodd;fill:%23314a52"/></svg>';

export const appletServices: AppletServices = {
  // Types of attachment that this Applet offers for other Applets to be created
  creatables: {
    // Disable for now
    // game: {
    //   label: 'Game',
    //   icon_src: ICON,
    // },
  },
  // Types of UI widgets/blocks that this Applet supports
  blockTypes: {},
  // bindAsset: async (appletClient: AppClient, srcWal: WAL, dstWal: WAL): Promise<void> => {
  //   console.log('Bind requested.  Src:', srcWal, '  Dst:', dstWal);
  // },

  getAssetInfo: async (
    appletClient: AppClient,
    wal: WAL,
    recordInfo: RecordInfo,
  ): Promise<AssetInfo | undefined> => {
    if (recordInfo) {
      const roleName: RoleName = recordInfo.roleName;
      // const integrityZomeName: ZomeName = recordInfo.integrityZomeName
      const entryType: string = recordInfo.entryType;

      if (entryType == 'document') {
        const synClient = new SynClient(appletClient, roleName, ZOME_NAME);
        const synStore = new SynStore(synClient);
        const documentHash = wal.hrl[1];

        // This doesn't work. Gotta move initialization of the store outside the App component
        // const { statesMap } = getContext();
        // const $statesMap = await waitUntilAvailable(statesMap);
        // const $state = $statesMap[hashToB64(documentHash)];
        // const name = $state.name || '...';

        const docStore = new DocumentStore<GameSpace, unknown>(synStore, documentHash);
        const workspaces = await toPromise(docStore.allWorkspaces);
        const workspace = new WorkspaceStore(docStore, Array.from(workspaces.keys())[0]);
        const latestSnapshot = await toPromise(workspace.latestSnapshot);

        return {
          icon_src: `data:image/svg+xml;utf8,${ICON}`,
          name: latestSnapshot.name,
        };
      } else {
        throw new Error("Gamez doesn't know about entry type:" + entryType);
      }
    } else {
      throw new Error('Null WAL not supported, must supply a recordInfo');
    }
  },
  search: async (
    appletClient: AppClient,
    appletHash: AppletHash,
    weaveServices: WeaveServices,
    searchFilter: string,
  ): Promise<Array<WAL>> => {
    const synClient = new SynClient(appletClient, ROLE_NAME, ZOME_NAME);
    const synStore = new SynStore(synClient);
    const boardHashes = asyncDerived(synStore.documentsByTag.get(ROOT_TAG), (x) =>
      Array.from(x.keys()),
    );

    const boardData = new LazyHoloHashMap((documentHash) => {
      const docStore = synStore.documents.get(documentHash);

      const workspace = pipe(docStore.allWorkspaces, (workspaces) => {
        return new WorkspaceStore(docStore, Array.from(workspaces.keys())[0]);
      });
      const latestState = pipe(workspace, (w) => w.latestSnapshot);
      return latestState;
    });

    const allBoardsAsync = pipe(boardHashes, (docHashes) => sliceAndJoin(boardData, docHashes));

    const allBoards = Array.from((await toPromise(allBoardsAsync)).entries());
    const dnaHash = await getMyDna(ROLE_NAME, appletClient);

    return allBoards
      .filter((r) => !!r)
      .filter((r) => {
        const state = r[1];
        return state.name.toLowerCase().includes(searchFilter.toLowerCase());
      })
      .map((r) => ({ hrl: [dnaHash, r![0]], context: {} }));
  },
};
