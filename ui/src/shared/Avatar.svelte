<script lang="ts">
  import UserIcon from '~icons/fa6-solid/user';
  import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';

  import { encodeHashToBase64, type AgentPubKey } from '@holochain/client';
  import '@holochain-open-dev/profiles/dist/elements/agent-avatar.js';

  import { getStoreContext } from '~/lib/context';

  import { tooltip as tooltipDirective } from './tooltip';

  const store = getStoreContext();

  export let agentPubKey: AgentPubKey;
  export let size = 32;
  export let namePosition = 'row';
  export let showAvatar = true;
  export let showNickname = true;
  export let placeholder = false;
  export let disableAvatarPointerEvents = false;
  export let copyable = false;
  export let tooltip = false;
  export let tooltipName = false;

  $: agentPubKey;
  $: agentPubKeyB64 = encodeHashToBase64(agentPubKey);
  $: profile = store.profilesStore.profiles.get(agentPubKey);
  $: nickname =
    $profile.status == 'complete' && $profile.value
      ? $profile.value.entry.nickname
      : agentPubKeyB64.slice(5, 9) + '...';
</script>

<div
  class="avatar-{namePosition}"
  use:tooltipDirective={tooltipName ? nickname : null}
  title={showNickname ? '' : nickname}
>
  {#if $profile.status == 'pending'}
    <sl-skeleton effect="pulse" style={`height: ${size}px; width: ${size}px;`}></sl-skeleton>
  {:else if $profile.status == 'complete'}
    {#if showAvatar}
      {#if placeholder && !$profile.value.entry.fields.avatar}
        <div
          class="bg-gray-200 text-black/60 rounded-full flexcc"
          style={`height: ${size}px; width: ${size}px;`}
        >
          <UserIcon />
        </div>
      {:else}
        <agent-avatar
          class:disable-ptr-events={disableAvatarPointerEvents}
          disable-tooltip={!tooltip}
          disable-copy={!copyable}
          {size}
          agent-pub-key={agentPubKeyB64}
        ></agent-avatar>
      {/if}
    {/if}
    {#if showNickname}
      <div class="nickname">{nickname}</div>
    {/if}
  {/if}
</div>

<style>
  .avatar-column {
    align-items: center;
    display: flex;
    flex-direction: column;
  }
  .avatar-row {
    display: inline-flex;
    flex-direction: row;
    justify-content: center;
    position: relative;
    height: 100%;
    align-items: center;
  }
  .avatar-row .nickname {
    margin-left: 0.5em;
  }
  .disable-ptr-events {
    pointer-events: none;
  }
</style>
