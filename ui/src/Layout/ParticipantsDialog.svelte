<script lang="ts">
  import GamepadIcon from '~icons/fa6-solid/gamepad';
  import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
  import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';

  import '@holochain-open-dev/stores/dist/debug-store.js';

  import { getStoreContext } from '~/lib/context';
  import Avatar from '~/shared/Avatar.svelte';

  const store = getStoreContext();

  $: agents = store.profilesStore.agentsWithProfile;
  $: agentBoards = store.boardList.allAgentBoards;

  //__debugStore(store.boardList.allAgentBoards)
  //.status=="complete" ? sliceAndJoin( store.boardList.boardParticipants, $agents.value): undefined

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
            {#if $agentBoards.status == 'complete' && $agentBoards.value.get(agentPubKey).length}
              <div class="relative p2 py4 flex flexcc flex-wrap bg-main-600 text-white">
                <div
                  class="absolute top-0 right-2 -translate-y-1/2 text-xl bg-main-700 px2 py1 rounded-md b b-main-600"
                  title="Games played"
                >
                  <GamepadIcon />
                </div>
                {#each $agentBoards.value.get(agentPubKey) as board}
                  <button
                    class="bg-black/10 hover:bg-black/20 px1 pb0.5 pt1 rounded-md mr2"
                    style="box-shadow: 0 1px 0 rgba(0,0,0,.3)"
                    on:click={() => {
                      store.boardList.setActiveBoard(board.board.hash);
                      close();
                    }}
                  >
                    {board.latestState.name}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</sl-dialog>

<style>
</style>
