<script lang="ts">
  import { decodeHashFromBase64 } from '@holochain/client';

  import type { Board } from '~/lib/store';

  import Avatar from './Avatar.svelte';

  export let board: Board;
  export let showPlayers = false;
  export let moreAfter = 0;

  $: participants = board ? board.sessionParticipants() : undefined;
  $: latestSnapshot = board ? board.workspace.latestSnapshot : undefined;
  export let size: number = 24;
  let showMorePlayersList = false;
</script>

<div class="wrapper" class:bordered={false}>
  {#if showPlayers}
    {#if $latestSnapshot && $latestSnapshot.status == 'complete'}
      {#each $latestSnapshot.value.props.players as player, index}
        {#if moreAfter == 0 || index < moreAfter || $latestSnapshot.value.turns}
          {#if $latestSnapshot.value.turns && index == ($latestSnapshot.value.props.turn | 0)}
            <div class="my-turn"></div>
          {/if}
          <Avatar {size} agentPubKey={decodeHashFromBase64(player)} showNickname={false} />
        {/if}
      {/each}
      {#if moreAfter > 0 && !$latestSnapshot.value.turns && $latestSnapshot.value.props.players.length > moreAfter}
        <div
          class="more-players"
          on:mouseenter={() => (showMorePlayersList = true)}
          on:mouseleave={() => (showMorePlayersList = false)}
        >
          + {$latestSnapshot.value.props.players.length - moreAfter} more...

          <div class={showMorePlayersList ? 'more-player-list' : 'hidden'}>
            {#each $latestSnapshot.value.props.players as player, index}
              {#if index >= moreAfter}
                <Avatar {size} agentPubKey={decodeHashFromBase64(player)} showNickname={true} />
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  {:else if $participants && $participants.status == 'complete'}
    {#each Array.from($participants.value) as agentPubKey}
      <Avatar {size} {agentPubKey} showNickname={false} />
    {/each}
  {/if}
</div>

<style>
  .bordered {
    border: solid 1px gray;
  }
  .wrapper {
    border-radius: 50%;
    display: flex;
    flex-direction: row;
  }
  .my-turn {
    z-index: 100;
    margin-right: -7px;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    background-color: rgb(139, 212, 30);
  }
  .more-players {
    cursor: pointer;
    position: relative;
  }
  .more-player-list {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 10px;
    left: 5px;
    border: solid 1px black;
    padding: 10px;
    background-color: white;
    border-radius: 5px;
    z-index: 100;
  }
  .hidden {
    display: none;
  }
</style>
