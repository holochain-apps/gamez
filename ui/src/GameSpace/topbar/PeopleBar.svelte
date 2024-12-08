<script lang="ts">
  import cx from 'classnames';
  import UsersIcon from '~icons/fa6-solid/users';
  import AgentAvatar from '~/shared/AgentAvatar.svelte';
  import AgentName from '~/shared/AgentName.svelte';
  import type { PlayerSlot } from '~/store/types';

  import PlayersSlots from './PlayersSlots.svelte';

  export let pubKey: string;
  export let canJoinGame: boolean;
  export let canLeaveGame: boolean;
  export let participants: Uint8Array[];
  export let playersSlots: PlayerSlot[];
  export let onJoin: () => void;
  export let onLeave: () => void;
  export let onChangePlayersSlots: (playersSlots: PlayerSlot[]) => void;

  let showingParticipants = false;

  const toggleParticipants = () => {
    showingParticipants = !showingParticipants;
  };
</script>

<div class="flex-grow flexce space-x-2 relative">
  {#if canJoinGame}
    <button
      class="bg-main-400 h10 px2 py1 rounded-md text-white hover:bg-main-500 b b-black/10"
      on:click={() => {
        onJoin();
      }}>Join Game</button
    >
  {/if}
  {#if canLeaveGame}
    <button
      class="bg-gray-400 h10 px2 py1 rounded-md text-white b b-black/10 hover:brightness-110"
      on:click={() => {
        onLeave();
      }}>Leave Game</button
    >
  {/if}
  <PlayersSlots {pubKey} {playersSlots} {canJoinGame} onChange={onChangePlayersSlots} />
  <button
    class={cx('relative h14 w14 flexcc b b-black/10 ', {
      'bg-black/30 text-white': showingParticipants,
      'bg-white/20 hover:bg-white/30': !showingParticipants,
    })}
    on:click={toggleParticipants}
  >
    <UsersIcon />

    <div class="bg-red-500 text-sm text-white h4 w4 flexcc rounded-full absolute bottom-2 right-2">
      {participants.length}
    </div>
  </button>
  {#if showingParticipants}
    <div class="bg-main-900 p4 rounded-bl-md top-full w-60 absolute flex flex-col space-y-2 z-1000">
      <div>In the space</div>
      {#each participants as participant}
        <div class="flexcs">
          <AgentAvatar pubKey={participant} size={32} />
          <AgentName class="ml2" pubKey={participant} />
        </div>
      {/each}
    </div>
  {/if}
</div>
