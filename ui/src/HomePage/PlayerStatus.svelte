<script lang="ts">
  import { type AgentPubKey } from '@holochain/client';
  import cx from 'classnames';
  import AgentAvatar from '~/center/static/AgentAvatar.svelte';
  import { tooltip } from '~/center/lib/tooltip';

  export let agent: string | AgentPubKey;
  export let isPlaying: boolean;
  export let isCreator: boolean;
</script>

<div
  class="relative mr2"
  use:tooltip={`${isCreator ? 'Creator.' : ''} ${isPlaying ? 'Playing.' : ''}`}
>
  <AgentAvatar
    class={cx('relative z-20', {
      // 'opacity-30': !inRoom,
      'outline outline-4 outline-yellow-400 outline-dashed': isCreator,
    })}
    pubKey={agent}
    size={20}
  />
  {#if isPlaying}
    <div class="absolute z-10 inset-0 rounded-full outline outline-2 outline-main-500"></div>
  {/if}
</div>
