<script lang="ts">
  import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
  import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
  import '@holochain-open-dev/stores/dist/debug-store.js';

  import Avatar from '~/shared/Avatar.svelte';
  import { getContext } from '~/store';

  const { profilesStore } = getContext();

  $: agents = profilesStore.agentsWithProfile;

  export const close = () => {
    dialog.hide();
  };
  export const open = () => {
    dialog.show();
  };
  let dialog;
</script>

<sl-dialog label="Participants" bind:this={dialog}>
  <div>
    <div class="overflow-hidden rounded-md -mt5 b b-main-700">
      {#if $agents.status == 'pending'}
        <sl-skeleton effect="pulse" class="h-14 w-full"></sl-skeleton>
      {:else}
        {#each $agents.status == 'complete' ? Array.from($agents.value) : [] as agentPubKey}
          <div class="b-b-2 b-main-700 last:b-0">
            <div class="bg-main-900 p2">
              <Avatar {agentPubKey} size={40} namePosition="row" />
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</sl-dialog>
