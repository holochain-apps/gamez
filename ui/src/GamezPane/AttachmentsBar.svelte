<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import EyeIcon from '~icons/fa6-solid/eye';
  import EyeSlashIcon from '~icons/fa6-solid/eye-slash';
  import CheckIcon from '~icons/fa6-solid/check';
  import PenToSquareIcon from '~icons/fa6-solid/pen-to-square';

  import AttachmentsList from '../AttachmentsList.svelte';
  import { tooltip } from '../Home/tooltip';
  import { type AssetSpec } from '../util';

  const dispatcher = createEventDispatcher();

  export let boundTo: string[];
  export let attachments: AssetSpec[];
  export let showEmbed: boolean;
  export let embedsEditable: boolean;

  $: showAttachments = attachments && attachments.length > 0 && typeof attachments[0] != 'string';
  $: showBar = showAttachments || boundTo?.length > 0;
</script>

{#if showBar}
  <div class="flex h-12 bg-main-500 @dark:bg-main-400 flexcc px4">
    {#if boundTo && boundTo.length > 0}
      <div class="flexcc">
        <span class="mr4">Attached To:</span>
        <AttachmentsList allowDelete={false} attachments={boundTo} />
      </div>
    {/if}
    {#if showAttachments}
      <div class="flexcc">
        <span class="mr4">Attachments:</span>
        <AttachmentsList
          allowDelete={true}
          attachments={attachments.map((a) => a.weaveUrl)}
          on:remove-attachment
        />
      </div>
      <div class="flex-grow"></div>
      {#if showEmbed}
        <button
          class="h10 w10 flexcc rounded-full hover:bg-white/20"
          use:tooltip={embedsEditable ? 'Save Changes' : 'Edit Asset Pane'}
          on:click={() => dispatcher('toggle-embeds-editable')}
        >
          {#if embedsEditable}<CheckIcon />{:else}<PenToSquareIcon />{/if}
        </button>
      {/if}
      <button
        class="h10 w10 flexcc rounded-full hover:bg-white/20 ml4"
        use:tooltip={showEmbed ? 'Hide Asset Pane' : 'Show Asset Pane'}
        on:click={() => dispatcher('toggle-show-embed')}
      >
        {#if showEmbed}<EyeSlashIcon />{:else}<EyeIcon />{/if}
      </button>
    {/if}
  </div>
{/if}
