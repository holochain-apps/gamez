<script lang="ts">
  import cx from 'classnames';
  import UsersIcon from '~icons/fa6-solid/users';
  import { decodeHashFromBase64 } from '@holochain/client';
  import Avatar from '~/shared/Avatar.svelte';

  export let canJoinGame: boolean;
  export let canLeaveGame: boolean;
  export let participants: Uint8Array[];
  export let players: string[];
  export let onJoin: () => void;
  export let onLeave: () => void;

  let showingParticipants = false;

  const toggleParticipants = () => {
    showingParticipants = !showingParticipants;
  };
</script>

<div class="flex-grow flexce space-x-2 relative">
  {#if canJoinGame}
    <button
      class="bg-main-400 h10 px2 py1 rounded-md text-white"
      on:click={() => {
        onJoin();
      }}>Join Game</button
    >
  {/if}
  {#if canLeaveGame}
    <button
      class="bg-gray-400 h10 px2 py1 rounded-md text-white"
      on:click={() => {
        onLeave();
      }}>Leave Game</button
    >
  {/if}
  {#each players as player}
    <Avatar showNickname={false} size={32} agentPubKey={decodeHashFromBase64(player)} />
  {/each}
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
    <div class="bg-main-900 p4 rounded-bl-md top-full w-60 absolute flex flex-col space-y-2">
      <div>Sync Session Participants</div>
      {#each participants as participant}
        <div class="">
          <Avatar showNickname={true} size={32} agentPubKey={participant} />
        </div>
      {/each}
    </div>
  {/if}
</div>
