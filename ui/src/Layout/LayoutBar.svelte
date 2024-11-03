<script lang="ts">
  import { get } from 'svelte/store';
  import CircleInfoIcon from '~icons/fa6-solid/circle-info';
  import BugIcon from '~icons/fa6-solid/bug';
  import ArrowLeftIcon from '~icons/fa6-solid/arrow-left';
  import UserGroupIcon from '~icons/fa6-solid/user-group';

  import { isWeaveContext } from '@theweave/api';

  import { type Board } from '~/lib/store';
  import { route, goBack } from '~/lib/routes';
  import { tooltip } from '~/shared/tooltip';
  import { cx } from '~/lib/util';

  import AboutDialog from './AboutDialog.svelte';
  import AvatarDialog from './AvatarDialog.svelte';
  import ParticipantsDialog from './ParticipantsDialog.svelte';
  import { getContext } from '~/store';
  import AgentAvatar from '~/shared/AgentAvatar.svelte';

  const { profilesStore, pubKey } = getContext();

  export let activeBoard: Board = null;
  export let title = 'Board Gamez';
  export let canChangeTitle: boolean = false;
  export let onChangeTitle = (name: string) => {};
  export let sub: string = null;

  let aboutDialog;
  let editAvatarDialog;
  let participantsDialog;
  //@ts-ignore
  $: myProfile = get(profilesStore.myProfile).value;
  $: myName = myProfile ? myProfile.nickname : '';

  const editAvatar = () => {
    editAvatarDialog.open();
  };

  function handleTitleBlur(ev: { currentTarget: HTMLHeadingElement }) {
    onChangeTitle(ev.currentTarget.innerText);
  }

  function handleTitleKeydown(ev: KeyboardEvent & { currentTarget: HTMLHeadingElement }) {
    if (ev.key === 'Enter') {
      ev.currentTarget.blur();
    }
  }
</script>

<AboutDialog bind:this={aboutDialog} />
<AvatarDialog bind:this={editAvatarDialog} />
<ParticipantsDialog bind:this={participantsDialog} />

<div class="flexcc flex-shrink-0 bg-main-400 b-black/10 0 b text-white px6 h-16 space-x-2">
  <!-- LEFT SIDE BUTTONS -->

  {#if $route.id != 'home'}
    <button class="h12 w12 flexcc hover:bg-black/10 rounded-full" on:click={goBack}>
      <ArrowLeftIcon />
    </button>
  {/if}
  <h1
    class={cx('font-bold text-2xl px2 py1 rounded-md outline-main-500', {
      'hocus:(bg-gray-100 text-black/80 text-shadow-none!)': canChangeTitle,
    })}
    on:keydown={handleTitleKeydown}
    style="text-shadow: 0 1px 0 rgba(0,0,0,.5)"
    contenteditable={canChangeTitle}
    on:blur={handleTitleBlur}
  >
    {title}
  </h1>
  {#if sub}
    <span class="opacity-50">{sub}</span>
  {/if}

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

  {#if !isWeaveContext()}
    <button
      on:click={editAvatar}
      title={myName ? myName : 'Edit Avatar'}
      class="ml4! flexcc hover:brightness-120"
      use:tooltip={'Edit profile'}
    >
      <AgentAvatar size={38} {pubKey} />
    </button>
  {:else}
    <AgentAvatar size={38} {pubKey} />
  {/if}
</div>
