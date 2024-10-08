<script lang="ts">
  // External
  import { createEventDispatcher } from 'svelte';
  import GearIcon from '~icons/fa6-solid/gear';
  import DoorOpenIcon from '~icons/fa6-solid/door-open';
  import AddAttachmentIcon from '~icons/fa6-solid/window-restore';

  // Organizational
  import { type SessionParticipant } from '@holochain-syn/core';

  // Local
  import Avatar from '~/shared/Avatar.svelte';
  import { tooltip } from '~/shared/tooltip';
  import PocketIcon from '~/shared/icons/PocketIcon.svelte';

  import AttachmentsList from './AttachmentsList.svelte';

  const dispatch = createEventDispatcher();

  export let attachments: string[];
  export let showAddToPocket: boolean;
  export let standAlone: boolean;
  export let boardName: string;
  export let participants: [Uint8Array, SessionParticipant][] | null;
  export let myAgentPubKey: Uint8Array;
</script>

<div class="h-16 flexcc px2 bg-main-800 @dark:bg-main-400 space-x-4">
  {#if showAddToPocket}
    <div class="flex">
      {#if standAlone}
        <div class="text-xl flexcc font-bold mx2">{boardName}</div>
      {/if}

      <button
        class="h10 w10 flexcc rounded-full hover:bg-white/20"
        use:tooltip={'Add Board to Pocket'}
        on:click={() => dispatch('pocket')}
      >
        <PocketIcon class="w8 h8" />
      </button>
      <button
        class="h10 w10 flexcc rounded-full hover:bg-white/20"
        use:tooltip={'Attach asset'}
        on:click={() => dispatch('add-attachment')}
      >
        <AddAttachmentIcon />
      </button>

      {#if attachments.length > 0}
        <div style="margin-left:20px;display:flex; align-items: center">
          <span style="margin-right: 5px;">Bound To:</span>
          <AttachmentsList allowDelete={false} {attachments} />
        </div>
      {/if}
    </div>
  {/if}
  <div
    class="flex-grow flexcs bg-main-700 @dark:bg-main-300 b b-black/10 h-12 rounded-md shadow-inner"
  >
    <div class="ml4 opacity-70 mr2">In the room</div>
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
      on:click={() => dispatch('leave')}
      use:tooltip={'Leave room'}
    >
      <DoorOpenIcon />
    </button>
  </div>
</div>
