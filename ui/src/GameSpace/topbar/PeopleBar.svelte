<script lang="ts">
  import UsersIcon from '~icons/fa6-solid/users';
  import AgentAvatar from '~/shared/AgentAvatar.svelte';
  import AgentName from '~/shared/AgentName.svelte';
  import type { PlayerSlot } from '~/store/types';

  import TopBarDropButton from '../ui/TopBarDropButton.svelte';
  import PlayersSlots from './PlayersSlots.svelte';

  export let pubKey: string;
  export let canJoinGame: boolean;
  export let canLeaveGame: boolean;
  export let participants: Uint8Array[];
  export let playersSlots: PlayerSlot[];
  export let onJoin: () => void;
  export let onLeave: () => void;
  export let onChangePlayersSlots: (playersSlots: PlayerSlot[]) => void;
</script>

<div class="flex-grow flexce space-x-1 relative">
  {#if canJoinGame}
    <button
      class="bg-main-300 h9 px1.5 flexcc rounded-md text-white hover:filter-brightness-120 b b-black/10"
      on:click={() => {
        onJoin();
      }}>Join Game</button
    >
  {/if}
  {#if canLeaveGame}
    <button
      class="bg-main-300 h9 px1.5 flexcc rounded-md text-white hover:filter-brightness-120 b b-black/10"
      on:click={() => {
        onLeave();
      }}>Leave Game</button
    >
  {/if}
  <PlayersSlots {pubKey} {playersSlots} {canJoinGame} onChange={onChangePlayersSlots} />
  <TopBarDropButton title="Participants in space" counter={participants.length}>
    <UsersIcon slot="icon" />
    <div class="w-60">
      {#each participants as participant}
        <div class="flexcs px4 py2 bg-black/5 b-t b-black/10">
          <AgentAvatar pubKey={participant} size={28} />
          <AgentName class="ml2" pubKey={participant} />
        </div>
      {/each}
    </div>
  </TopBarDropButton>
  <!-- <button
    class={cx('h12 w12 text-white flexcc hover:bg-black/10', {
      'bg-black/30!': showingParticipants,
    })}
    on:click={toggleParticipants}
  >
    <UsersIcon />

    <div class="bg-red-500 text-sm text-white h4 w4 flexcc rounded-full absolute bottom-2 right-2">
      {participants.length}
    </div>
  </button>
  {#if showingParticipants}
    <div
      class="bg-main-900 p4 rounded-b-md top-full w-60 absolute flex flex-col space-y-2 z-1000 shadow-lg"
    >
      <div>In the space</div>
      {#each participants as participant}
        <div class="flexcs">
          <AgentAvatar pubKey={participant} size={32} />
          <AgentName class="ml2" pubKey={participant} />
        </div>
      {/each}
    </div>
  {/if} -->
</div>
