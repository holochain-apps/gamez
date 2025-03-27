<script lang="ts">
  import LoadingIndicator from '~/center/static/LoadingIndicator.svelte';
  import LogoIcon from '~/center/icons/LogoIcon.svelte';

  import clients from './clients';

  import ControllerMain from './controllers/ControllerMain.svelte';
  import ControllerBoardAsset from './controllers/ControllerBoardAsset.svelte';
  import ControllerCreatable from './controllers/ControllerCreatable.svelte';
  import ModalPromptContextWrapper from './center/input/ModalPromptContextWrapper.svelte';

  import { createRootStoreContext } from '~/store';

  createRootStoreContext();

  $: prof = clients.profilesStore.myProfile;
</script>

<svelte:head></svelte:head>
<profiles-context store={clients.profilesStore} id="root">
  <ModalPromptContextWrapper>
    {#if clients.view.type === 'creatable'}
      <ControllerCreatable view={clients.view} />
    {:else if $prof.status == 'pending'}
      <LoadingIndicator textual={false} />
    {:else if $prof.status == 'complete' && $prof.value == undefined}
      <div class="create-profile">
        <div class="welcome-text"><LogoIcon /></div>
        <create-profile on:profile-created={() => {}}></create-profile>
      </div>
    {:else if clients.view.type === 'main'}
      <ControllerMain />
    {:else if clients.view.type === 'asset'}
      <ControllerBoardAsset view={clients.view} />
    {/if}
  </ModalPromptContextWrapper>
</profiles-context>

<!-- <LoadingIndicator textual={false} class="mt40" /> -->

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
