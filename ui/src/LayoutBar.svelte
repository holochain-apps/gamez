<script lang="ts">
  import { getContext } from 'svelte';
  import { get } from 'svelte/store';
  import CircleInfoIcon from '~icons/fa6-solid/circle-info';
  import BugIcon from '~icons/fa6-solid/bug';
  import ArrowLeftIcon from '~icons/fa6-solid/arrow-left';
  import UserGroupIcon from '~icons/fa6-solid/user-group';

  import type { ProfilesStore } from '@holochain-open-dev/profiles';
  import { isWeContext } from '@lightningrodlabs/we-applet';

  import { tooltip } from './Home/tooltip';
  import type { GamezStore } from './store';
  import Avatar from './Avatar.svelte';
  import AboutDialog from './AboutDialog.svelte';
  import AvatarDialog from './AvatarDialog.svelte';
  import ParticipantsDialog from './ParticipantsDialog.svelte';
  import { type Board } from './board';

  const { getStore }: any = getContext('gzStore');
  const store: GamezStore = getStore();

  export let activeBoard: Board;

  let aboutDialog;
  let editAvatarDialog;
  let participantsDialog;
  $: boardState = activeBoard ? activeBoard.readableState() : undefined;
  $: console.log('NAV ACTIVE BOARD', activeBoard, boardState);
  //@ts-ignore
  $: myProfile = get(store.profilesStore.myProfile).value;
  $: myName = myProfile ? myProfile.nickname : '';

  const closeBoard = async () => {
    await store.boardList.closeActiveBoard(false);
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

  {#if activeBoard != undefined}
    <button class="h12 w12 flexcc hover:bg-black/10 rounded-full" on:click={closeBoard}>
      <ArrowLeftIcon />
    </button>
  {/if}
  <h1 class="font-bold text-2xl" style="text-shadow: 0 1px 0 rgba(0,0,0,.5)">
    {#if activeBoard && $boardState}{$boardState.name}
    {:else}BoardGamez{/if}
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
