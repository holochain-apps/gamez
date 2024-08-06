<script lang="ts">
  // External
  import { createEventDispatcher } from 'svelte';
  import GearIcon from '~icons/fa6-solid/gear';
  import DoorOpenIcon from '~icons/fa6-solid/door-open';
  import ExportIcon from '~icons/fa6-solid/file-arrow-down';
  import PocketIcon from '../icons/PocketIcon.svelte';

  // Organizational
  import { type SessionParticipant } from '@holochain-syn/core';

  // Local
  import { tooltip } from '../Home/tooltip';
  import SvgIcon from '../SvgIcon.svelte';
  import AttachmentsList from '../AttachmentsList.svelte';
  import Avatar from '../Avatar.svelte';

  const dispatch = createEventDispatcher();

  export let attachments: string[];
  export let showAddToPocket: boolean;
  export let standAlone: boolean;
  export let participants: [Uint8Array, SessionParticipant][] | null;
  export let myAgentPubKey: Uint8Array;
</script>

<div class="h-16 flexcc px2 bg-main-500 @dark:bg-main-400 space-x-4 text-white/80!">
  {#if showAddToPocket}
    <div class="">
      <button
        class="h10 w10 flexcc rounded-full hover:bg-white/20"
        use:tooltip={'Add Board to Pocket'}
        on:click={() => dispatch('pocket')}
      >
        <PocketIcon class="w8 h8" />
      </button>

      {#if attachments.length > 0}
        <div style="margin-left:20px;display:flex; align-items: center">
          <span style="margin-right: 5px;">Bound To:</span>
          <AttachmentsList allowDelete={false} {attachments} />
        </div>
      {/if}
    </div>
  {/if}
  <div class="flex-grow flexcs bg-main-300 b b-black/10 h-12 rounded-md shadow-inner">
    <div class="ml4 opacity-50 text-white/80! mr2">In the room</div>
    {#if participants}
      <div class="participants" style="margin-right:20px">
        <div style="display:flex; flex-direction: row">
          <div style="margin-left:5px;">
            <Avatar agentPubKey={myAgentPubKey} showNickname={false} size={25} />
          </div>

          {#each participants as [agentPubKey, sessionData]}
            {#if Date.now() - sessionData.lastSeen < 30000}
              <div style="margin-left:5px;">
                <Avatar {agentPubKey} showNickname={false} size={25} />
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <div class="flex space-x-4">
    <button
      class="h10 w10 flexcc rounded-full hover:bg-white/20"
      on:click={() => dispatch('settings')}
      use:tooltip={'Edit board'}
    >
      <GearIcon />
    </button>
    <button
      class="h10 w10 flexcc rounded-full hover:bg-white/20"
      on:click={() => dispatch('export')}
      use:tooltip={'Export Board'}
    >
      <ExportIcon />
    </button>
    <button
      class="h10 w10 flexcc rounded-full hover:bg-white/20"
      on:click={() => dispatch('leave')}
      use:tooltip={'Leave room'}
    >
      <DoorOpenIcon />
    </button>
  </div>
</div>
