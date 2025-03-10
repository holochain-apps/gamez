import {
  AppletServices,
  initializeHotReload,
  isWeaveContext,
  type WAL,
  WeaveClient,
} from '@theweave/api';

import { ProfilesClient } from '@holochain-open-dev/profiles/dist/profiles-client.js';
import { SynClient } from '@holochain-syn/dev/packages/client/dist/client';
import {
  AdminWebsocket,
  type AppClient,
  AppWebsocket,
  type AppWebsocketConnectionOptions,
} from '@holochain/client';
import { CellType, type DnaHash, encodeHashToBase64, type HoloHash } from '@holochain/client';

type Context = {
  weave: WeaveClient | null;
  app: AppClient;
  profiles: ProfilesClient;
  agentKey: HoloHash;
  agentKeyB64: string;
  dnaHash: DnaHash;
  wal: null | WAL;
  syn: SynClient;
};

let context: Context = null!;

const HAPP = 'gamez';
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
  let wal: WAL | null = null;
  if (isWeaveContext()) {
    weaveClient = await WeaveClient.connect(appletServices);

    if (weaveClient.renderInfo.type !== 'applet-view') {
      throw 'Not running in Weave applet view';
    }

    if (weaveClient.renderInfo.view.type === 'asset') {
      console.log('Rendering as asset', weaveClient.renderInfo.view.wal.hrl);
      console.log('CONTEXT:', weaveClient.renderInfo.view.wal.context);

      wal = weaveClient.renderInfo.view.wal;
    } else if (weaveClient.renderInfo.view.type !== 'main') {
      throw 'Only works as asset or main thread';
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

  const syn = new SynClient(appClient, 'gamez', 'syn');

  context = {
    weave: weaveClient,
    app: appClient,
    profiles: profilesClient,
    agentKey: appClient.myPubKey,
    agentKeyB64: encodeHashToBase64(appClient.myPubKey),
    dnaHash,
    wal,
    syn,
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
  get agent() {
    return context.agentKey;
  },
  get agentKeyB64() {
    return context.agentKeyB64;
  },
  get dnaHash() {
    return context.dnaHash;
  },
  get wal() {
    return context.wal;
  },
  get syn() {
    return context.syn;
  },
};
