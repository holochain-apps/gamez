<script lang="ts">
  import '@shoelace-style/shoelace/dist/themes/light.css';
  import 'svooltip/styles.css';

  import {
    AppWebsocket,
    AdminWebsocket,
    type AppWebsocketConnectionOptions,
  } from '@holochain/client';
  import { WeaveClient, isWeaveContext, initializeHotReload, type AppletView } from '@theweave/api';
  import '@holochain-open-dev/profiles/dist/elements/profiles-context.js';
  import '@holochain-open-dev/profiles/dist/elements/profile-prompt.js';
  import '@holochain-open-dev/profiles/dist/elements/create-profile.js';
  import { ProfilesClient, ProfilesStore } from '@holochain-open-dev/profiles';

  import LoadingIndicator from '~/shared/LoadingIndicator.svelte';
  import LogoIcon from '~/shared/icons/LogoIcon.svelte';

  import ControllerMain from './controllers/ControllerMain.svelte';
  import ControllerBoardAsset from './controllers/ControllerBoardAsset.svelte';
  import { createRootStore, type RootStore, setContext as setRootStoreContext } from '~/store';
  import ModalPromptContextWrapper from './shared/ModalPromptContextWrapper.svelte';

  const appId = import.meta.env.VITE_APP_ID ?? 'gamez';
  const roleName = 'gamez';
  const integrityZomeName = 'syn_integrity';
  const creatableName = 'game';
  const appPort = import.meta.env.VITE_APP_PORT ?? 8888;
  const adminPort = import.meta.env.VITE_ADMIN_PORT;
  const url = `ws://localhost:${appPort}`;
  export let weaveClient: WeaveClient | null = null;

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
        view: SupportedAppletViews;
      };

  let state: State = { type: 'pending' };
  let gameSpaceStore: RootStore;
  setRootStoreContext(() => gameSpaceStore);
  initialize();

  async function initialize(): Promise<void> {
    if (weaveClient) {
      state = { type: 'weave', ...(await initOnWeave(weaveClient)) };
    } else {
      state = { type: 'standalone', ...(await initStandalone()) };
    }

    gameSpaceStore = createRootStore(state.client, state.profilesStore, weaveClient);
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

    // Use this to create a cross-group DHT
    // client.createCloneCell()

    return {
      client,
      profilesStore: new ProfilesStore(new ProfilesClient(client, appId)),
    };
  }

  async function initOnWeave(weaveClient: WeaveClient): Promise<{
    profilesStore: ProfilesStore;
    client: AppWebsocket;
    weaveClient: WeaveClient;
    view: SupportedAppletViews;
  }> {
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
</script>

<svelte:head></svelte:head>
{#if state.type !== 'pending'}
  <profiles-context store={state.profilesStore} id="root">
    <ModalPromptContextWrapper>
      {#if $prof.status == 'pending'}
        <LoadingIndicator textual={false} class="mt40" />
      {:else if $prof.status == 'complete' && $prof.value == undefined}
        <div class="create-profile">
          <div class="welcome-text"><LogoIcon /></div>
          <create-profile on:profile-created={() => {}}></create-profile>
        </div>
      {:else if state.type === 'standalone'}
        <ControllerMain />
      {:else if state.type === 'weave'}
        {#if state.view.type === 'main'}
          <ControllerMain />
        {:else if state.view.type === 'asset'}
          <ControllerBoardAsset view={state.view} />
        {:else if state.view.type === 'creatable'}
          <!-- <ControllerCreatable view={state.view} /> -->
        {/if}
      {/if}
    </ModalPromptContextWrapper>
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
