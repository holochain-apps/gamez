<script lang="ts">
  import { get } from 'svelte/store';
  import CircleInfoIcon from '~icons/fa6-solid/circle-info';
  import BugIcon from '~icons/fa6-solid/bug';
  import ArrowLeftIcon from '~icons/fa6-solid/arrow-left';
  import UserGroupIcon from '~icons/fa6-solid/user-group';

  import { isWeContext } from '@lightningrodlabs/we-applet';

  import { type Board } from '~/lib/store';
  import { getStoreContext } from '~/lib/context';
  import { nav, route } from '~/lib/routes';
  import { tooltip } from '~/shared/tooltip';
  import Avatar from '~/shared/Avatar.svelte';

  import AboutDialog from './AboutDialog.svelte';
  import AvatarDialog from './AvatarDialog.svelte';
  import ParticipantsDialog from './ParticipantsDialog.svelte';

  const store = getStoreContext();

  export let activeBoard: Board;
  export let title = 'Board Gamez';

  let aboutDialog;
  let editAvatarDialog;
  let participantsDialog;
  $: boardState = activeBoard ? activeBoard.readableState() : undefined;
  //@ts-ignore
  $: myProfile = get(store.profilesStore.myProfile).value;
  $: myName = myProfile ? myProfile.nickname : '';

  const handleBack = async () => {
    if ($route.id === 'board') {
      await store.boardList.closeActiveBoard(false);
    }
    if ($route.id === 'editBoard') {
      nav({ id: 'board', boardHash: $route.boardHash });
    } else {
      nav({ id: 'home' });
    }
  };

  const editAvatar = () => {
    editAvatarDialog.open();
  };
</script>

<AboutDialog bind:this={aboutDialog} />
<AvatarDialog bind:this={editAvatarDialog} />
<ParticipantsDialog bind:this={participantsDialog} />

<div
  class="flexcc flex-shrink-0 bg-main-400 @dark:bg-main-300 b-black/10 0 b text-white px6 h-16 space-x-2"
>
  <!-- LEFT SIDE BUTTONS -->

  {#if $route.id != 'home'}
    <button class="h12 w12 flexcc hover:bg-black/10 rounded-full" on:click={handleBack}>
      <ArrowLeftIcon />
    </button>
  {/if}
  <h1 class="font-bold text-2xl" style="text-shadow: 0 1px 0 rgba(0,0,0,.5)">
    {#if activeBoard && $boardState}{$boardState.name}
    {:else}{title}{/if}
  </h1>

  <div class="flex-grow"></div>

  <!-- RIGHT SIDE BUTTONS -->

  <button
    title="About BoardGamez!"
    class="h12 w12 flexcc rounded-full hover:(bg-black/10 text-white)"
    on:click={() => aboutDialog.open()}
    use:tooltip={'About BoardGamez'}
  >
    <CircleInfoIcon class="block" />
  </button>

  <a
    class="h12 w12 flexcc rounded-full hover:(bg-black/10 text-white)"
    href="https://github.com/holochain-apps/gamez/issues"
    title="Report a problem in our GitHub repo"
    target="_blank"
    use:tooltip={'Report problem in our GitHub repo'}
  >
    <BugIcon />
  </a>

  <button
    class="h12 w12 flexcc rounded-full hover:(bg-black/10 text-white)"
    on:click={() => {
      participantsDialog.open();
    }}
    title="Show Participants"
    use:tooltip={'Show Participants'}
  >
    <UserGroupIcon />
  </button>

  {#if !isWeContext()}
    <button
      on:click={editAvatar}
      title={myName ? myName : 'Edit Avatar'}
      class="ml4! flexcc hover:brightness-120"
      use:tooltip={'Edit profile'}
    >
      <Avatar size={38} agentPubKey={store.myAgentPubKey} showNickname={false} />
    </button>
  {/if}
</div>
