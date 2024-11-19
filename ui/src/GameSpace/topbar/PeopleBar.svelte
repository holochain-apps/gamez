<script lang="ts">
  import cx from 'classnames';
  import UsersIcon from '~icons/fa6-solid/users';
  import { decodeHashFromBase64 } from '@holochain/client';
  import Avatar from '~/shared/Avatar.svelte';
  import AgentAvatar from '~/shared/AgentAvatar.svelte';
  import type { PlayerSlot } from '~/store/types';

  export let canJoinGame: boolean;
  export let canLeaveGame: boolean;
  export let participants: Uint8Array[];
  export let playersSlots: PlayerSlot[];
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
  {#each playersSlots as playerSlot}
    <div
      class="w10 h10 rounded-full b-2 b-black/10 flexcc"
      style={'background-color: ' + playerSlot.color}
    >
      {#if playerSlot.pubKey}
        <AgentAvatar size={30} pubKey={decodeHashFromBase64(playerSlot.pubKey)} />
      {/if}
    </div>
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
    <div class="bg-main-900 p4 rounded-bl-md top-full w-60 absolute flex flex-col space-y-2 z-1000">
      <div>Sync Session Participants</div>
      {#each participants as participant}
        <div class="">
          <Avatar showNickname={true} size={32} agentPubKey={participant} />
        </div>
      {/each}
    </div>
  {/if}
</div>
