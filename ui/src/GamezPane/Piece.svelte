<script context="module">
  export const PLAYER_PIECE_SIZE = 32;
</script>

<script lang="ts">
  import { decodeHashFromBase64 } from '@holochain/client';

  import { type Piece, PieceDef, PieceType } from '~/lib/board';
  import Avatar from '~/shared/Avatar.svelte';

  import { hollowedToFilledChessPiece, isHollowChessPiece } from './utils';

  const PLAYER_PIECE_ID_STARTS = 'uhCA';

  type PieceDisplayType =
    | {
        type: 'pieceDefPlayer';
        id: string;
      }
    | { type: 'pieceDefPiece'; pieceDef: PieceDef }
    | { type: 'piece'; piece: Piece };

  export let displayPiece: PieceDisplayType;
  export let pieceDefs: { [key: string]: PieceDef } = null;
  export let dragEnabled: boolean;
  export let hidden: boolean = false;

  let piece: Piece;
  let pieceDef: PieceDef;
  let pieceDefImage: string;

  // Player pieces are stored as normal pieces but they use a player ID instead of a pieceDef ID
  $: playerPieceId =
    displayPiece.type === 'pieceDefPlayer'
      ? displayPiece.id
      : displayPiece.type === 'piece' &&
          displayPiece.piece.typeId.startsWith(PLAYER_PIECE_ID_STARTS)
        ? displayPiece.piece.typeId
        : null;

  $: {
    if (displayPiece.type === 'pieceDefPiece') {
      piece = null;
      pieceDef = displayPiece.pieceDef;
      pieceDefImage = pieceDef.images[0];
    } else if (displayPiece.type === 'piece' && playerPieceId) {
      piece = displayPiece.piece;
      pieceDef = null;
      pieceDefImage = null;
    } else if (displayPiece.type === 'piece' && !playerPieceId) {
      piece = displayPiece.piece;
      if (!pieceDefs) throw new Error('Missing pieceDefs');
      pieceDef = pieceDefs[piece.typeId];
      pieceDefImage = pieceDef.images[piece.imageIdx];
    }
  }

  $: pieceName = pieceDef?.name || 'Player';
  $: pieceWH = playerPieceId
    ? { w: PLAYER_PIECE_SIZE, h: PLAYER_PIECE_SIZE }
    : { w: pieceDef.width, h: pieceDef.height };
  $: stylePosition = piece ? `position: absolute; top: ${piece.y}px; left: ${piece.x}px;` : '';
  $: attachmentsLength = piece?.attachments?.length;

  function title() {
    function pluralize(word: string, count: number) {
      return count === 1 ? word : `${word}s`;
    }

    return attachmentsLength
      ? `This ${pieceName} piece has ${attachmentsLength} ${pluralize('attachment', attachmentsLength)}`
      : pieceName;
  }
</script>

<div
  class="piece text-black/100!"
  on:dblclick
  draggable={dragEnabled}
  class:draggable={dragEnabled}
  class:hidden
  on:dragstart
  on:dragend
  on:drop
  on:dragover
  title={title()}
  style={`
    ${stylePosition}
    font-size:${pieceWH.h - 2}px;
    width: ${pieceWH.w}px;
    height: ${pieceWH.h}px;
  `}
>
  {#if attachmentsLength}
    <div class="piece-attachment-count">{attachmentsLength}</div>
  {/if}
  {#if playerPieceId}
    <Avatar
      disableAvatarPointerEvents={dragEnabled}
      agentPubKey={decodeHashFromBase64(playerPieceId)}
      showNickname={false}
      size={PLAYER_PIECE_SIZE}
    />
  {:else}
    {#if pieceDef.type === PieceType.Emoji}
      <div style="margin-top: 1px;">
        <!-- A little hack to make hollowed chess pieces have a white background -->
        {#if isHollowChessPiece(pieceDefImage)}
          <div class="relative z-20 -top-[1px]">{pieceDefImage}</div>
          <div class="absolute z-10 inset-0 flexcc text-white">
            {hollowedToFilledChessPiece(pieceDefImage)}
          </div>
        {:else}
          {pieceDefImage}
        {/if}
      </div>
    {/if}
    {#if pieceDef.type === PieceType.Image}
      <img
        alt={pieceDef.name}
        draggable={false}
        src={pieceDefImage}
        width={pieceDef.width}
        height={pieceDef.height}
      />
    {/if}
  {/if}
</div>

<style>
  .piece {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0; /* Fixes avatar element extra spacing */
  }

  .piece.hidden {
    opacity: 0;
  }

  .piece:hover {
    filter: brightness(1.25) saturate(1.25);
  }

  .draggable {
    cursor: move;
  }

  .piece-attachment-count {
    position: absolute;
    height: 14px;
    display: flex;
    padding: 0 4px;
    align-items: center;
    justify-content: center;
    bottom: -2px;
    right: -2px;
    z-index: 10;
    font-size: 10px;
    font-weight: bold;

    border-radius: 2px;
    color: white;
    background-color: rgba(200, 0, 0, 1);
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
  }
</style>
