import {
  AppletServices,
  type AppletView,
  initializeHotReload,
  isWeaveContext,
  type WAL,
  WeaveClient,
} from '@theweave/api';

import { ProfilesStore } from '@holochain-open-dev/profiles';
import { ProfilesClient } from '@holochain-open-dev/profiles/dist/profiles-client.js';
import { SynClient } from '@holochain-syn/core';
import { AdminWebsocket, type AppClient, AppWebsocket } from '@holochain/client';
import { CellType, type DnaHash, encodeHashToBase64, type HoloHash } from '@holochain/client';

type Context = {
  weave: WeaveClient | null;
  app: AppClient;
  profiles: ProfilesClient;
  profilesStore: ProfilesStore;
  agentKey: HoloHash;
  agentKeyB64: string;
  dnaHash: DnaHash;
  syn: SynClient;
  view: Extract<AppletView, { type: 'main' | 'asset' | 'creatable' }>;
};

let context: Context = null!;

const HAPP = import.meta.env.VITE_APP_ID ?? 'gamez';
const ROLE = 'gamez';
const APP_PORT = import.meta.env.VITE_APP_PORT ?? 8888;
const ADMIN_PORT = import.meta.env.VITE_ADMIN_PORT;

async function connect(appletServices: AppletServices): Promise<void> {
  if (import.meta.env.DEV) {
    try {
      console.log('Initializing hot reload');
      await initializeHotReload();
    } catch (e) {
      console.warn('Could not initialize Weave applet hot-reloading');
    }
  }

  let appClient: AppClient;
  let profilesClient: ProfilesClient;
  let weaveClient: WeaveClient | null = null;
  if (isWeaveContext()) {
    weaveClient = await WeaveClient.connect(appletServices);

    if (weaveClient.renderInfo.type !== 'applet-view') {
      throw 'Not running in Weave applet view';
    }

    appClient = weaveClient.renderInfo.appletClient;
    profilesClient = weaveClient.renderInfo.profilesClient;
  } else {
    console.log('APP PORT', APP_PORT);
    console.log('ADMIN PORT', ADMIN_PORT);
    const adminWebsocket = await AdminWebsocket.connect({
      url: new URL(`ws://localhost:${ADMIN_PORT}`),
    });
    let tokenResp: any = {};
    try {
      console.log('HAPP', HAPP);
      tokenResp = await adminWebsocket.issueAppAuthenticationToken({
        installed_app_id: HAPP,
      });
    } catch (e) {
      console.log('ERROR CONNECTING TO APP WEBSOCKET', e);
      throw e;
    }

    const x = await adminWebsocket.listApps({});
    console.log('Apps', x);
    const cellIds = await adminWebsocket.listCellIds();
    console.log('CELL IDS', cellIds);
    await adminWebsocket.authorizeSigningCredentials(cellIds[0]);

    console.log('appPort and Id is', APP_PORT, HAPP);

    appClient = await AppWebsocket.connect({
      url: new URL(`ws://localhost:${APP_PORT}`),
      token: tokenResp.token,
    });

    profilesClient = new ProfilesClient(appClient, HAPP);
  }

  const appInfo = await appClient.appInfo();
  if (!appInfo) {
    console.log('App info was null?');
    throw 'App info was null for some reason';
  }
  const dnaHash = (appInfo.cell_info[HAPP][0] as any)[CellType.Provisioned].cell_id[0];

  console.log('FINISHED SETTING UP CLIENTS');

  const syn = new SynClient(appClient, ROLE, 'syn');

  const view = weaveClient?.renderInfo.view || { type: 'main' };

  let wal: WAL | null = null;
  switch (view.type) {
    case 'main':
      // Nothing to do
      break;
    case 'asset':
      if (!view.recordInfo) {
        throw new Error(
          'Gamez does not implement asset views pointing to DNAs instead of Records.',
        );
      }

      if (view.recordInfo.roleName !== ROLE) {
        throw new Error('Unknown role name:' + view.recordInfo.roleName);
      }

      if (view.recordInfo.integrityZomeName !== 'syn_integrity') {
        throw new Error('Unknown integrity zome:' + view.recordInfo.integrityZomeName);
      }

      if (view.recordInfo.entryType !== 'document') {
        throw new Error('Unknown entry type:' + view.recordInfo.entryType);
      }

      console.log('Rendering as asset', view.wal.hrl);
      console.log('CONTEXT:', view.wal.context);

      wal = view.wal;
      break;
    case 'creatable':
      console.log(view);
      if (view.name !== 'Game') {
        throw new Error('Unknown creatable: ' + view.name);
      }
      break;
    default:
      throw new Error(`Unsupported applet-view type ${view.type}`);
  }

  const profilesStore = new ProfilesStore(profilesClient);

  context = {
    weave: weaveClient,
    app: appClient,
    profiles: profilesClient,
    profilesStore,
    agentKey: appClient.myPubKey,
    agentKeyB64: encodeHashToBase64(appClient.myPubKey),
    dnaHash,
    syn,
    view,
  };
}

export default {
  connect,
  get weave() {
    return context.weave;
  },
  get app() {
    return context.app;
  },
  get profiles() {
    return context.profiles;
  },
  get profilesStore() {
    return context.profilesStore;
  },
  get agent() {
    return context.agentKey;
  },
  get agentKeyB64() {
    return context.agentKeyB64;
  },
  get dnaHash() {
    return context.dnaHash;
  },
  get syn() {
    return context.syn;
  },
  get view() {
    return context.view;
  },
};
