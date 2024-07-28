<script lang="ts">
  import { getContext } from "svelte";
  import type { DragEventHandler } from 'svelte/elements';
  import type { GamezStore } from "./store";
  import { type BoardState, PieceDef, PieceType, Board, type Piece} from "./board";
  import EditBoardDialog from "./EditBoardDialog.svelte";
  import Avatar from "./Avatar.svelte"
  import AttachmentsDialog from "./AttachmentsDialog.svelte"
  import { cloneDeep } from "lodash";
  import sanitize from "sanitize-filename";
  import SvgIcon from "./SvgIcon.svelte";
  import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
  import { decodeHashFromBase64 } from "@holochain/client";
  import { isWeContext, type HrlWithContext } from "@lightningrodlabs/we-applet";
  import { hrlWithContextToB64 } from "./util";
  import AttachmentsList from "./AttachmentsList.svelte";

  // There is 3 coordinates systems
  // - Screen coordinates, relative to top left of document
  // - Canvas coordinates, relative to board container
  // - Board coordinates, relative to board adjusted with pan and zoom



  const download = (filename: string, text: string) => {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  const exportBoard = (state: BoardState) => {
        const prefix = "gamez"
        const fileName = sanitize(`${prefix}_export_${state.name}.json`)
        download(fileName, JSON.stringify(state))
        alert(`Your board was exported to your Downloads folder as: '${fileName}'`)
    }

  const { getStore } :any = getContext("gzStore");
  let store: GamezStore = getStore();
  export let activeBoard: Board
  export let standAlone = false

  $: activeHash = store.boardList.activeBoardHash;
  $: state = activeBoard.readableState()
  $: pieces = $state ? Object.values($state.props.pieces) : undefined;
  $: pieceDefs = $state ? getPieceDefs($state.pieceDefs) : undefined;
  $: attachments = $state ? $state.props.attachments : undefined

  $: myAgentPubKeyB64 = store.myAgentPubKeyB64
  $: myAgentPubKey = store.myAgentPubKey
  $: participants = activeBoard.participants()

  const getPieceDefs = (defs:Array<PieceDef>) => {
    const pieceDefs: {[key: string]: PieceDef} = {}
    defs.forEach(d=>pieceDefs[d.id]=d)
    return pieceDefs
  }

  const closeBoard = async () => {
    await store.boardList.closeActiveBoard(false);
  };

  const leaveBoard = async () => {
    await store.boardList.closeActiveBoard(true);
  };

  let editBoardDialog
  let draggingHandled = true
  let draggedItemId = ""
  let dragOffsetX, dragOffsetY; // The difference between mouse grab position and piece top-left
  let dragType

  let attachmentsDialog : AttachmentsDialog
  function editPieceAttachments(piece: Piece) {
    if (isWeContext())
      attachmentsDialog.open(piece)
  }

  function handleDragStartAdd(e) {
    dragType = "add"
    handleDragStart(e)
  }

  function handleDragStartMove(e) {
    dragType = "move"
    handleDragStart(e)
  }

  type DragEventHandler = DragEvent & {
      currentTarget: EventTarget & HTMLDivElement;
  }
  function handleDragStart(e: DragEventHandler) {
    draggingHandled = false;
    draggedItemId = e.currentTarget.getAttribute('id');
    e.dataTransfer.setDragImage
    e.dataTransfer.setData("text", e.currentTarget.getAttribute('id'));
    const bounds = e.currentTarget.getBoundingClientRect()
    if (dragType === 'move') {
      dragOffsetX = (e.clientX - bounds.left);
      dragOffsetY = (e.clientY - bounds.top);
    } else {
      const {w, h} = pieceSize(draggedItemId);
      dragOffsetX = w / 2;
      dragOffsetY = h / 2;
    }

  }

  function handleDragEnd(e) {
    clearDrag()
    //console.log("handleDragEnd",e )
  }
  function handleDragOver(e) {
    e.preventDefault()

  }

  function pieceSize(pieceId: string) {
    if (isPlayer(pieceId)) {
      return {w: 30, h: 30}
    } else {
      return {w: pieceDefs[pieceId].width, h: pieceDefs[pieceId].height}
    }
  }

  function handleDragDrop(e:DragEvent) {
    e.preventDefault();
    if (draggingHandled) {
      return
    }

    const [canvasX, canvasY] = screenToCanvasPos(e);
    const [boardX, boardY] = canvasToBoardPos([canvasX - dragOffsetX, canvasY - dragOffsetY]);

    if (dragType == "move") {
      activeBoard.requestChanges( [{
        type: "move-piece",
        id: draggedItemId,
        x: boardX,
        y: boardY
      }]);
    }
    else {
      activeBoard.requestChanges( [{
        type: "add-piece",
        pieceType: draggedItemId,
        imageIdx: 0,
        x: boardX,
        y: boardY,
        attachments:[]
      }]);
    }
    clearDrag()
    //console.log("handleDragDropColumn",e, column )
  }
  const clearDrag = () => {
    draggingHandled = true
    draggedItemId = ""
  }
  const DEFAULT_BOARD_IMG = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chessboard_green_squares.svg/512px-Chessboard_green_squares.svg.png"

  $: bgUrl = ($state.props && $state.props.bgUrl) ? $state.props.bgUrl : DEFAULT_BOARD_IMG
  $: bgImage = `background-image: url("`+ bgUrl+`");`

  let img

  const canJoin = (state) => {
    return (state.props.players.length < state.max_players) && !state.props.players.includes(myAgentPubKeyB64)
  }
  const haveJoined = (state) => {
    return state.props.players.includes(myAgentPubKeyB64)
  }

  const myTurn = (state) => {
    return state.turns && state.props.players[state.props.turn | 0] == myAgentPubKeyB64
  }

  const canPlay = (state) => {
    return myTurn(state) || (!state.turns && haveJoined(state))
  }
  $: iCanPlay = canPlay($state)

  const addAttachment = async () => {
    const hrl = await store.weClient.userSelectHrl()
    if (hrl) {
      const props = cloneDeep($state.props)
      if (!props.attachments) {
        props.attachments = []
      }
      props.attachments.push(hrlWithContextToB64(hrl))
      activeBoard.requestChanges([{type: 'set-props', props }])
    }
  }
  const removeAttachment = async (index: number) => {
    const props = cloneDeep($state.props)
    props.attachments.splice(index, 1);
    activeBoard.requestChanges([{type: 'set-props', props }])
  }
  const pieceName = (piece: Piece) => {
    if (isPlayer(piece.typeId)) {
      return "player"
    }
    return pieceDefs[piece.typeId].name
  }
  const isPlayer = (id: string) => {
    return id.startsWith("uhCA")
  }
  const copyHrlToClipboard = () => {
    const attachment: HrlWithContext = { hrl: [store.dnaHash, activeBoard.hash], context: {} }
    store.weClient?.hrlToClipboard(attachment)
  }

  let selectedCommitHash

  // ███████╗ ██████╗  ██████╗ ███╗   ███╗     █████╗ ███╗   ██╗██████╗     ██████╗  █████╗ ███╗   ██╗
  // ╚══███╔╝██╔═══██╗██╔═══██╗████╗ ████║    ██╔══██╗████╗  ██║██╔══██╗    ██╔══██╗██╔══██╗████╗  ██║
  //   ███╔╝ ██║   ██║██║   ██║██╔████╔██║    ███████║██╔██╗ ██║██║  ██║    ██████╔╝███████║██╔██╗ ██║
  //  ███╔╝  ██║   ██║██║   ██║██║╚██╔╝██║    ██╔══██║██║╚██╗██║██║  ██║    ██╔═══╝ ██╔══██║██║╚██╗██║
  // ███████╗╚██████╔╝╚██████╔╝██║ ╚═╝ ██║    ██║  ██║██║ ╚████║██████╔╝    ██║     ██║  ██║██║ ╚████║
  // ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝     ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝

  const maxZoom = 4; // x4 the original size
  const minZoom = 0.5;
  const zoomStep = 0.001; // % zoomed for each deltaY
  let boardContainer: HTMLDivElement;
  let zoom = 1; // From 1 to maxZoom
  let panX = 0;
  let panY = 0;
  let isPanning = false;

  const handleZoomInOut = (ev: WheelEvent) => {
    const prevZoom = zoom;
    zoom += ev.deltaY * zoomStep;
    if (zoom < minZoom) zoom = minZoom;
    if (zoom > maxZoom) zoom = maxZoom;
    const zoomDelta = 1 - (zoom / prevZoom)
    if (zoomDelta !== 0) {
      const screenPos = screenToCanvasPos(ev);
      panX += (screenPos[0] * zoomDelta) / zoom;
      panY += (screenPos[1] * zoomDelta) / zoom;
    }
  }


  const handlePanningStart = (ev: MouseEvent) => {
    if (shouldHandlePanning(ev.target as HTMLElement)) {
      isPanning = true;
      const [panInitialX, panInitialY] = [panX, panY];
      const [panStartX, panStartY] = screenToCanvasPos(ev);

      window.document.addEventListener('mousemove', handleMouseMove);
      window.document.addEventListener('mouseup', handleMouseUp);

      function handleMouseMove(ev: MouseEvent) {
        const [currentX, currentY] = screenToCanvasPos(ev);

        const deltaX = currentX - panStartX;
        const deltaY = currentY - panStartY;

        panX = panInitialX + deltaX / zoom;
        panY = panInitialY + deltaY / zoom;
      }

      function handleMouseUp() {
        isPanning = false;
        window.document.removeEventListener('mousemove', handleMouseMove);
        window.document.removeEventListener('mouseup', handleMouseUp);
      }
    }
  }

  function shouldHandlePanning(mouseDownTarget: HTMLElement): boolean {
    if (mouseDownTarget === boardContainer) return true;

    if (mouseDownTarget.draggable) {
      return false
    } else {
      if (mouseDownTarget.parentElement) {
        return shouldHandlePanning(mouseDownTarget.parentElement);
      } else {
        return false;
      }
    }
  }

  function screenToCanvasPos (ev: {clientX: number; clientY: number}) {
    const imgBox = boardContainer.getBoundingClientRect();
    const relativeX = ev.clientX - imgBox.left;
    const relativeY = ev.clientY - imgBox.top;
    return [relativeX, relativeY] as [number, number];
  }

  function canvasToBoardPos ([x, y]: [number, number]) {
    return [x / zoom - panX, y / zoom - panY] as [number, number];
  }
</script>
<div class="board">
    <EditBoardDialog bind:this={editBoardDialog}></EditBoardDialog>
  <div class="top-bar">
    <div class="left-items">
      <h5>{$state.name}</h5>
      {#if store.weClient}
        <sl-button circle title="Add Board to Pocket" class="attachment-button" style="margin-left:10px" on:click={()=>copyHrlToClipboard()} >
          <SvgIcon icon="addToPocket" size="20px"/>
        </sl-button>

        {#if $state.boundTo.length>0}
          <div style="margin-left:20px;display:flex; align-items: center">
            <span style="margin-right: 5px;">Bound To:</span>
            <AttachmentsList allowDelete={false} attachments={$state.boundTo} />
          </div>
        {/if}
      {/if}
    </div>
    <div class="right-items">
      In the room:
      {#if $participants}
      <div class="participants" style="margin-right:20px">
        <div style="display:flex; flex-direction: row">
          <div style="margin-left:5px;">          <Avatar agentPubKey={store.myAgentPubKey} showNickname={false} size={25} />
          </div>

          {#each Array.from($participants.entries()) as [agentPubKey, sessionData]}
          <div style="margin-left:5px;" class:idle={Date.now()-sessionData.lastSeen >30000}>
            <Avatar agentPubKey={agentPubKey} showNickname={false} size={25} />
          </div>
          {/each}

        </div>
      </div>
    {/if}

    {#if !standAlone}
      <sl-button circle on:click={leaveBoard} title="Exit Game Room">
        <SvgIcon size=18 icon=exit />
      </sl-button>
    {/if}
      <sl-button circle on:click={()=> editBoardDialog.open(cloneDeep($activeHash))} title="Settings">
        <SvgIcon icon=faCog size=15/>
      </sl-button>
      <sl-button circle on:click={() => exportBoard($state)} title="Export">
        <SvgIcon icon=faFileExport size=15 />
      </sl-button>
    {#if !standAlone}
      <sl-button circle on:click={closeBoard} title="Close">
        <SvgIcon icon=faClose size=12 />
      </sl-button>
    {/if}
    </div>
  </div>
  {#if $state}
    {#if $state.min_players}
      <div class="board-header">
        <h3>Players:</h3>
        <div style="display:flex; align-items:end; margin-left: 10px;">
          {#each $state.props.players as player, index}

            <div style="display:flex;align-items:center;flex-direction:column;margin-right:10px">
              {#if $state.turns && index == ($state.props.turn | 0)}
                <div class="my-turn"></div>
              {/if}
              <Avatar agentPubKey={decodeHashFromBase64(player)} />
            </div>
          {/each}
        </div>
        {#if canJoin($state)}
          <sl-button
            on:click={()=>{
              activeBoard.requestChanges( [{
              type: "add-player",
              player: myAgentPubKeyB64
            }]);

            }}>
          Join Game
          </sl-button>
        {/if}
        {#if $state.props.players.length < $state.min_players}
          <span style="margin-left:10px">Waiting for {$state.min_players- $state.props.players.length} player{$state.min_players- $state.props.players.length>1?"s":""} to join</span>
        {:else if myTurn($state)}
          <sl-button style="margin-left: 30px"
            on:click={()=>{
              activeBoard.requestChanges( [{
              type: "next-turn"
            }]);

            }}>
          End Turn
          </sl-button>
        {/if}
        {#if haveJoined($state)}
          <sl-button style="margin-left:10px"
            on:click={()=>{
              activeBoard.requestChanges( [{
              type: "remove-player",
              player: myAgentPubKeyB64
            }]);

            }}>
          Leave Game
          </sl-button>
        {/if}
        {#if store.weClient}
          <div class="attachments-area">
            <sl-button style="margin-top:5px;margin-right: 5px" circle on:click={()=>attachmentsDialog.open(undefined)} >
              <SvgIcon icon=link/>
            </sl-button>
            {#if attachments}
              <AttachmentsList attachments={attachments} allowDelete={false}
              on:remove-attachment={(e)=>removeAttachment(e.detail)}/>
            {/if}

          </div>
        {/if}
      </div>
    {/if}

    <div class="board-area">
      <div class="piece-source">
        <h3>{iCanPlay ? "Add Piece:" : "Pieces:"}</h3>
        {#each Object.values(pieceDefs) as p}
          <div class="piece-def"
            id={p.id}
            draggable={iCanPlay}
            class:draggable={iCanPlay}
            on:dragstart={handleDragStartAdd}
          >
            {#if pieceDefs[p.id].type===PieceType.Emoji}{pieceDefs[p.id].images[0]}{/if}
            {#if pieceDefs[p.id].type===PieceType.Image}<img draggable={false} src={pieceDefs[p.id].images[0]} width={pieceDefs[p.id].width} height={pieceDefs[p.id].height}/>{/if}
            {pieceDefs[p.id].name}

          </div>
        {/each}
        {#if $state.playerPieces}
          {#each $state.props.players as player, index}

            <div class="piece-def"
              id={player}
              draggable={iCanPlay}
              class:draggable={iCanPlay}
              on:dragstart={handleDragStartAdd}

            >
              <Avatar disableAvatarPointerEvents={iCanPlay} agentPubKey={decodeHashFromBase64(player)} />
            </div>
          {/each}
        {/if}
      </div>
      <div
        class="img-container"
        bind:this={boardContainer}
        on:wheel={handleZoomInOut}
        on:mousedown={handlePanningStart}
        style={`${isPanning ? 'cursor: move;' : ''}`}
        >
        <div style={`
          height: 100%;
          width: 100%;
          transform:scale(${zoom}) translate(${panX}px, ${panY}px);
          transform-origin: top left;`
        }>
          <AttachmentsDialog activeBoard={activeBoard} bind:this={attachmentsDialog}></AttachmentsDialog>
          {#each pieces as piece}
            {@const pieceIsPlayer = isPlayer(piece.typeId)}
            {@const pieceWH = pieceSize(piece.typeId)}
            <div class="piece"
              on:dblclick={()=>editPieceAttachments(piece)}
              draggable={iCanPlay}
              class:draggable={iCanPlay}
              on:dragstart={handleDragStartMove}
              on:dragend={handleDragEnd}
              on:drop={handleDragDrop}
              on:dragover={handleDragOver}
              title={piece.attachments && piece.attachments.length > 0 ? `This ${pieceName(piece)} piece has ${piece.attachments.length} attachment(s)`: pieceName(piece)}
              id={piece.id}
              style={`
                top:${piece.y}px;
                left:${piece.x}px;
                font-size:${pieceWH.h - 2}px;
                width: ${pieceWH.w}px;
                height: ${pieceWH.h}px;
              `}
              >
              {#if piece.attachments && piece.attachments.length > 0}
              <div class="piece-has-attachment">{piece.attachments.length}</div>
              {/if}
              {#if pieceIsPlayer}
                <Avatar disableAvatarPointerEvents={iCanPlay} agentPubKey={decodeHashFromBase64(piece.typeId)} showNickname={false} size={30} />
              {:else}
                {#if pieceDefs[piece.typeId].type===PieceType.Emoji}<span style="margin-top: 1px;">{pieceDefs[piece.typeId].images[piece.imageIdx]}</span>{/if}
                {#if pieceDefs[piece.typeId].type===PieceType.Image}<img draggable={false} src={pieceDefs[piece.typeId].images[piece.imageIdx]} width={pieceDefs[piece.typeId].width} height={pieceDefs[piece.typeId].height}/>{/if}
              {/if}
            </div>
          {/each}
          <img
            width={$state.props.bgWidth}
            height={$state.props.bgHeight}
            draggable={false} bind:this={img} src={bgUrl}
            style="display: block; padding:80px; background-color: transparent; border:1px solid transparent; object-fit: cover;"
            on:drop={handleDragDrop}
            on:dragover={handleDragOver}
            >
        </div>
      </div>

    </div>
    <commit-history
          style="flex: 1"
          selectedCommitHash={selectedCommitHash}
          on:commit-selected={(e) => {
            selectedCommitHash = e.detail.commitHash;
          }}
        ></commit-history>
  {/if}
</div>
<style>
  .my-turn {
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 15px solid #f00;
  }
  .board-area {
    justify-content:center;
    margin-top: 10px;
    display: flex;
    overflow:auto;
  }
  .piece-source {
    max-width: 100px;
    margin-right: 20px;
  }
  .img-container {
    border: solid 1px rgba(0,0,0,.25);
    position: relative;
    padding: 0px;
    overflow: hidden;
    border-radius: 4px;
    background: rgba(0,0,0,0.1);
  }
  .img-container:before {
    content: ' ';
    position: absolute;
    inset: 0;
    z-index: 20;
    box-shadow: inset 0 0 6px rgba(0,0,0,0.25);
    pointer-events: none;
  }

  .piece {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0; /* Fixes avatar element extra spacing */
  }
  .piece:hover {
    background: rgba(0,0,0,0);
  }
  .piece-def {
    border: solid 1px;
    padding: 5px;
    border-radius: 3px;
    margin-bottom: 5px;
  }
  .draggable {
    cursor: pointer;
  }
  .board {
    display: flex;
    flex-direction: column;
    background: transparent;
    border-radius: 3px;
    margin-left: 15px;
    margin-right: 15px;
    margin-top: 15px;
    min-height: 0;
    padding-bottom: 10px;
    border: solid 1px lightgray;
  }
  .top-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background-color: #cccccc99;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 3px;
    color: white
  }
  .left-items {
    display: flex;
    align-items: center;
  }
  .right-items {
    display: flex;
    align-items: center;
  }
  .board-header {
    display:flex;
    justify-content:center;
    align-items:center;
    border-bottom: solid 1px lightgray;
  }
  .attachments-area {
    border-left: solid 1px lightgray;
    padding-left: 10px;
    padding-bottom: 5px;
    display:flex;
    flex-direction:row;
    margin-left:20px;
    align-items: center;
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
    background-color: rgba(0,255,0,.5);
  }
  .idle {
    opacity: 0.5;
  }
</style>
