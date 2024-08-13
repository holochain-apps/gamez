<script lang="ts">
  // External
  import { createEventDispatcher } from 'svelte';
  // Organizational
  import { decodeHashFromBase64 } from '@holochain/client';

  // Local
  import Avatar from '~/shared/Avatar.svelte';
  import { tooltip } from '~/shared/tooltip';

  const dispatcher = createEventDispatcher();
  const MAX_PLAYERS_IN_HEADER = 5;

  export let minPlayers: number;
  export let players: string[];
  export let showPlayers: boolean;
  export let turnsEnabled: boolean;
  export let turn: number;
  export let canJoin: boolean;
  export let isCurrentAgentTurn: boolean;
  export let currentAgentIsPlaying: boolean;
</script>

{#if minPlayers}
  <div class="h-20 bg-main-800 @dark:bg-main-400 flexcc px4">
    <!-- PLAYERS LIST -->
    {#if showPlayers || turnsEnabled}
      <div class="flex-basis-1 flexcs">
        <h3>Players:</h3>
        <div style="display:flex; align-items:end; margin-left: 10px;">
          {#each players as player, index}
            {@const thisPlayersTurn = turnsEnabled && index == (turn | 0)}
            <div
              use:tooltip={thisPlayersTurn ? `This player's turn!` : ''}
              class="mr4 flexcc relative"
            >
              {#if thisPlayersTurn}
                <div
                  class="bg-lime-400 b b-lime-500 rounded-full absolute z-20 -top-1 left-1/2 -translate-x-4 h4 w4"
                ></div>
              {/if}
              <Avatar
                agentPubKey={decodeHashFromBase64(player)}
                namePosition="column"
                size={25}
                showNickname={players.length < MAX_PLAYERS_IN_HEADER}
                tooltip={players.length < MAX_PLAYERS_IN_HEADER}
              />
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div>
      {#if players.length < minPlayers}
        <div class="w-30"
          >Waiting for {minPlayers - players.length} player{minPlayers - players.length > 1
            ? 's'
            : ''} to join
        </div>
      {:else if isCurrentAgentTurn}
        <button
          class="bg-main-500 rounded-md px4 py2 hover:brightness-110"
          on:click={() => {
            dispatcher('end-turn');
          }}
        >
          End Turn
        </button>
      {/if}
    </div>
    <div class="flex-grow"></div>
    <!-- GAME ACTIONS BUTTONS -->
    <div class="flex-basis-1 flex">
      {#if canJoin}
        <button
          class="bg-lime-600 text-white rounded-md px4 py2 hover:brightness-110 whitespace-nowrap"
          on:click={() => {
            dispatcher('join');
          }}
        >
          Join Game
        </button>
      {/if}

      {#if currentAgentIsPlaying}
        <button
          class="bg-red-600 text-white rounded-md px4 py2 hover:brightness-110 whitespace-nowrap"
          on:click={() => {
            dispatcher('leave-game');
          }}
        >
          Leave Game
        </button>
      {/if}
    </div>
  </div>
{/if}
