<script lang="ts">
  // External
  import { createEventDispatcher } from 'svelte';

  // Organizational
  import { decodeHashFromBase64 } from '@holochain/client';

  // Local
  import Avatar from '../Avatar.svelte';
  import SvgIcon from '../SvgIcon.svelte';
  import { type AssetSpec } from '../util';
  import AttachmentsList from '../AttachmentsList.svelte';

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
  export let isOnWeave: boolean;
  export let attachments: AssetSpec[];

  export let showEmbed: boolean;
  export let embedsEditable: boolean;
</script>

{#if minPlayers}
  <div class="h-20 bg-black/10 flexcc">
    {#if showPlayers || turnsEnabled}
      <h3>Players:</h3>
      <div style="display:flex; align-items:end; margin-left: 10px;">
        {#each players as player, index}
          {@const thisPlayersTurn = turnsEnabled && index == (turn | 0)}
          <div title={thisPlayersTurn ? 'This players turn!' : ''} class="mr4 flexcc relative">
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
    {/if}
    {#if canJoin}
      <sl-button
        on
        on:click={() => {
          dispatcher('join');
        }}
      >
        Join Game
      </sl-button>
    {/if}
    {#if players.length < minPlayers}
      <span style="margin-left:10px"
        >Waiting for {minPlayers - players.length} player{minPlayers - players.length > 1
          ? 's'
          : ''} to join</span
      >
    {:else if isCurrentAgentTurn}
      <sl-button
        style="margin-left: 30px"
        on:click={() => {
          dispatcher('end-turn');
        }}
      >
        End Turn
      </sl-button>
    {/if}
    {#if currentAgentIsPlaying}
      <sl-button
        style="margin-left:10px"
        on:click={() => {
          dispatcher('leave-game');
        }}
      >
        Leave Game
      </sl-button>
    {/if}
    {#if isOnWeave}
      <div class="attachments-area">
        <sl-tooltip content="Attach assets">
          <sl-button
            size="small"
            variant="text"
            on:click={() => {
              dispatcher('add-attachment');
            }}><SvgIcon icon="addAsset" color="white"></SvgIcon></sl-button
          >
        </sl-tooltip>

        {#if attachments && attachments.length > 0 && typeof attachments[0] != 'string'}
          <AttachmentsList
            attachments={attachments.map((a) => a.weaveUrl)}
            allowDelete={true}
            on:remove-attachment
          />
          <sl-tooltip content={showEmbed ? 'Hide Asset Pane' : 'Show Asset Pane'}>
            <sl-button size="small" variant="text" on:click={() => dispatcher('toggle-show-embed')}
              ><SvgIcon icon={showEmbed ? 'hide' : 'show'} color="white"></SvgIcon></sl-button
            >
          </sl-tooltip>
          {#if showEmbed}
            <sl-tooltip content={embedsEditable ? 'Save Changes' : 'Edit Asset Pane'}>
              <sl-button variant="text" on:click={() => dispatcher('toggle-embeds-editable')}
                ><SvgIcon icon={embedsEditable ? 'faCheck' : 'faEdit'} color="black"
                ></SvgIcon></sl-button
              >
            </sl-tooltip>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
{/if}
