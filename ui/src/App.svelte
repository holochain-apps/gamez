<script lang="ts">
  import '@shoelace-style/shoelace/dist/themes/light.css';

  import {
    AppWebsocket,
    AdminWebsocket,
    type AppWebsocketConnectionOptions,
  } from '@holochain/client';
  import {
    WeaveClient,
    isWeContext,
    initializeHotReload,
    type Hrl,
    type WAL,
    type AppletView,
  } from '@lightningrodlabs/we-applet';
  import '@holochain-open-dev/profiles/dist/elements/profiles-context.js';
  import '@holochain-open-dev/profiles/dist/elements/profile-prompt.js';
  import '@holochain-open-dev/profiles/dist/elements/create-profile.js';
  import { ProfilesClient, ProfilesStore } from '@holochain-open-dev/profiles';

  import LoadingIndicator from './shared/LoadingIndicator.svelte';

  import Controller from './Controller.svelte';
  import ControllerCreate from './ControllerCreate.svelte';
  import ControllerBoard from './ControllerBoard.svelte';
  import LogoIcon from './icons/LogoIcon.svelte';
  import { appletServices } from './we';
  import { GamezStore } from './shared/store';
  import { setStoreContext } from './lib/context';

  const appId = import.meta.env.VITE_APP_ID ?? 'gamez';
  const roleName = 'gamez';
  const integrityZomeName = 'syn_integrity';
  const creatableName = 'game';
  const appPort = import.meta.env.VITE_APP_PORT ?? 8888;
  const adminPort = import.meta.env.VITE_ADMIN_PORT;
  const url = `ws://localhost:${appPort}`;

  type SupportedAppletViews = Extract<AppletView, { type: 'main' | 'asset' | 'creatable' }>;
  type State =
    | {
        type: 'pending';
      }
    | {
        type: 'standalone';
        client: AppWebsocket;
        profilesStore: ProfilesStore;
      }
    | {
        type: 'weave';
        client: AppWebsocket;
        profilesStore: ProfilesStore;
        weaveClient: WeaveClient;
        view: SupportedAppletViews;
      };

  let state: State = { type: 'pending' };
  let store: GamezStore;
  setStoreContext(() => store);
  initialize();

  async function initialize(): Promise<void> {
    // This must run before using isWeContext
    if ((import.meta as any).env.DEV) {
      try {
        await initializeHotReload();
      } catch (e) {
        console.warn(
          'Could not initialize applet hot-reloading. This is only expected to work in a We context in dev mode.',
        );
      }
    }

    if (!isWeContext()) {
      state = { type: 'standalone', ...(await initStandalone()) };
    } else {
      state = { type: 'weave', ...(await initOnWeave()) };
    }

    store = new GamezStore(
      state.type === 'weave' ? state.weaveClient : undefined,
      state.profilesStore,
      state.client,
      roleName,
    );
  }

  async function initStandalone(): Promise<{ profilesStore: ProfilesStore; client: AppWebsocket }> {
    // If running on Vite DEV mode VITE_ADMIN_PORT will be defined
    // and this seems to give the app some extra permissions for something

    const params: AppWebsocketConnectionOptions = { url: new URL(url) };

    if (adminPort) {
      console.log('VITE_ADMIN_PORT is', adminPort);
      const url = `ws://localhost:${adminPort}`;

      const adminWebsocket = await AdminWebsocket.connect({ url: new URL(url) });
      const tokenResp = await adminWebsocket.issueAppAuthenticationToken({
        installed_app_id: appId,
      });

      const x = await adminWebsocket.listApps({});
      console.log('Apps', x);
      const cellIds = await adminWebsocket.listCellIds();
      console.log('CELL IDS', cellIds);
      await adminWebsocket.authorizeSigningCredentials(cellIds[0]);

      params.token = tokenResp.token;
    }
    console.log('appPort and Id is', appPort, appId);
    const client = await AppWebsocket.connect(params);
    return {
      client,
      profilesStore: new ProfilesStore(new ProfilesClient(client, appId)),
    };
  }

  async function initOnWeave(): Promise<{
    profilesStore: ProfilesStore;
    client: AppWebsocket;
    weaveClient: WeaveClient;
    view: SupportedAppletViews;
  }> {
    const weaveClient = await WeaveClient.connect(appletServices);

    if (weaveClient.renderInfo.type !== 'applet-view') {
      throw new Error(`${weaveClient.renderInfo.type} is not supported`);
    }

    const view = weaveClient.renderInfo.view;

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

        if (view.recordInfo.roleName !== roleName) {
          throw new Error('Unknown role name:' + view.recordInfo.roleName);
        }

        if (view.recordInfo.integrityZomeName !== integrityZomeName) {
          throw new Error('Unknown integrity zome:' + view.recordInfo.integrityZomeName);
        }

        if (view.recordInfo.entryType !== 'document') {
          throw new Error('Unknown entry type:' + view.recordInfo.entryType);
        }
        break;
      case 'creatable':
        if (view.name !== creatableName) {
          throw new Error('Unknown creatable: ' + view.name);
        }
        break;
      default:
        throw new Error(`Unsupported applet-view type ${view.type}`);
    }

    return {
      client: (weaveClient.renderInfo as any).appletClient,
      profilesStore: new ProfilesStore((weaveClient.renderInfo as any).profilesClient),
      weaveClient,
      view,
    };
  }

  $: prof = state.type !== 'pending' ? state.profilesStore.myProfile : undefined;

  $: console.log('APP STATE', state);
</script>

<svelte:head></svelte:head>
{#if state.type !== 'pending' && store}
  <profiles-context store={state.profilesStore} id="root">
    {#if $prof.status == 'pending'}
      <LoadingIndicator textual={false} class="mt40" />
    {:else if $prof.status == 'complete' && $prof.value == undefined}
      <div class="create-profile">
        <div class="welcome-text"><LogoIcon /></div>
        <create-profile on:profile-created={() => {}}></create-profile>
      </div>
    {:else if state.type === 'standalone'}
      <Controller />
    {:else if state.type === 'weave'}
      {#if state.view.type === 'main'}
        <Controller />
      {:else if state.view.type === 'asset'}
        <ControllerBoard view={state.view} />
      {:else if state.view.type === 'creatable'}
        <ControllerCreate view={state.view} />
      {/if}
    {/if}
  </profiles-context>
{:else}
  <LoadingIndicator textual={false} class="mt40" />
{/if}

<style>
  .welcome-text {
    margin-bottom: 40px;
  }
  .create-profile {
    padding-top: 100px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  create-profile {
    box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.15);
  }
</style>
