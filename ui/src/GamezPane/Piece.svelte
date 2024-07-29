<script lang="ts">
  import { decodeHashFromBase64 } from "@holochain/client";
  import { type Piece, PieceDef, PieceType } from "../board";
  import Avatar from "../Avatar.svelte";

  const PLAYER_PIECE_ID_STARTS = "uhCA";
  const PLAYER_PIECE_SIZE = 30;

  type PieceDisplayType =
    | {
        type: "pieceDefPlayer";
        id: string;
      }
    | { type: "pieceDefPiece"; pieceDef: PieceDef }
    | { type: "piece"; piece: Piece };

  export let displayPiece: PieceDisplayType;
  export let pieceDefs: { [key: string]: PieceDef } = null;
  export let dragEnabled: boolean;

  let piece: Piece;
  let pieceDef: PieceDef;
  let pieceDefImage: string;

  // Player pieces are stored as normal pieces but they use a player ID instead of a pieceDef ID
  $: playerPieceId =
    displayPiece.type === "pieceDefPlayer"
      ? displayPiece.id
      : displayPiece.type === "piece" &&
          displayPiece.piece.typeId.startsWith(PLAYER_PIECE_ID_STARTS)
        ? displayPiece.piece.typeId
        : null;

  $: {
    if (displayPiece.type === "pieceDefPiece") {
      piece = null;
      pieceDef = displayPiece.pieceDef;
      pieceDefImage = pieceDef.images[0];
    } else if (displayPiece.type === "piece" && playerPieceId) {
      piece = displayPiece.piece;
      pieceDef = null;
      pieceDefImage = null;
    } else if (displayPiece.type === "piece" && !playerPieceId) {
      piece = displayPiece.piece;
      if (!pieceDefs) throw new Error("Missing pieceDefs");
      pieceDef = pieceDefs[piece.typeId];
      pieceDefImage = pieceDef.images[piece.imageIdx];
    }
  }

  $: pieceName = pieceDef?.name || "Player";
  $: pieceWH = playerPieceId
    ? { w: PLAYER_PIECE_SIZE, h: PLAYER_PIECE_SIZE }
    : { w: pieceDef.width, h: pieceDef.height };
  $: stylePosition = piece
    ? `position: absolute; top: ${piece.y}px; left: ${piece.x}px;`
    : "";
  $: attachmentsLength = piece?.attachments?.length;
</script>

<div
  class="piece"
  on:dblclick
  draggable={dragEnabled}
  class:draggable={dragEnabled}
  on:dragstart
  on:dragend
  on:drop
  on:dragover
  title={attachmentsLength
    ? `This ${pieceName} piece has ${attachmentsLength} attachment(s)`
    : pieceName}
  style={`
    ${stylePosition}
    font-size:${pieceWH.h - 2}px;
    width: ${pieceWH.w}px;
    height: ${pieceWH.h}px;
  `}
>
  {#if attachmentsLength}
    <div class="piece-has-attachment">{attachmentsLength}</div>
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
      <span style="margin-top: 1px;">{pieceDefImage}</span>
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
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0; /* Fixes avatar element extra spacing */
  }

  .draggable {
    cursor: move;
  }

  .piece-has-attachment {
    position: absolute;
    bottom: 0px;
    right: 0px;
    z-index: 10;
    font-size: 12px;
    font-weight: bold;
    color: blue;
    padding-right: 5px;
    padding-left: 5px;
    border-radius: 5px;
    background-color: rgba(0, 255, 0, 0.5);
  }
</style>
