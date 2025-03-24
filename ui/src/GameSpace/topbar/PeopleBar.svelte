<script lang="ts">
  import { type Placement, tooltip as svooltip } from 'svooltip';
  import { derived, readable } from 'svelte/store';
  import UsersIcon from '~icons/fa6-solid/users';
  import { hashToB64 } from '~/lib/util';
  import AgentAvatar from '~/shared/AgentAvatar.svelte';
  import AgentName from '~/shared/AgentName.svelte';
  import type { PlayerSlot } from '~/store/types';

  import TopBarDropButton from '../ui/TopBarDropButton.svelte';
  import PlayersSlots from './PlayersSlots.svelte';
  import AgentNameTooltip from '~/shared/AgentNameTooltip.svelte';

  export let pubKey: string;
  export let canJoinGame: boolean;
  export let canLeaveGame: boolean;
  export let participants: Uint8Array[];
  export let playersSlots: PlayerSlot[];
  export let onJoin: () => void;
  export let onLeave: () => void;
  export let onChangePlayersSlots: (playersSlots: PlayerSlot[]) => void;
  export let canChangeSlots: boolean;

  $: participantsB64 = participants.map(hashToB64);
  $: playersInSlots = playersSlots.map((ps) => ps.pubKey);

  $: playersNotInSlots = participantsB64.filter((participant) => {
    return !playersSlots.some((playerSlot) => {
      return playerSlot.pubKey === participant;
    });
  });
</script>

<div class="flex-grow flexce space-x-2 relative mr2">
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
  <PlayersSlots
    connected={participantsB64}
    {pubKey}
    {playersSlots}
    {canJoinGame}
    onChange={onChangePlayersSlots}
    {canChangeSlots}
  />
  {#if playersNotInSlots.length > 0}
    <span class="text-lg text-white/50 px2">|</span>
    {#each playersNotInSlots as participant}
      <div class="relative">
        <AgentNameTooltip pubKey={participant}>
          <AgentAvatar pubKey={participant} size={26} />
        </AgentNameTooltip>
        <div class="h2.5 w2.5 rounded-full bg-green-500 absolute -top-.5 -left-.5"></div>
      </div>
    {/each}
  {/if}
</div>
