<script lang="ts">
  import { getContext, onMount } from "svelte";
  import type { GamezStore } from "./store";
  import { type BoardState, PieceDef, PieceType, Board, type Piece, type BoardProps} from "./board";
  import EditBoardDialog from "./EditBoardDialog.svelte";
  import Avatar from "./Avatar.svelte"
  import AttachmentsDialog from "./AttachmentsDialog.svelte"
  import { cloneDeep } from "lodash";
  import sanitize from "sanitize-filename";
  import SvgIcon from "./SvgIcon.svelte";
  import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
  import { decodeHashFromBase64 } from "@holochain/client";
  import { isWeContext, weaveUrlFromWal, type WAL } from "@lightningrodlabs/we-applet";
  import AttachmentsList from "./AttachmentsList.svelte";
  import WalSpace from "./WalSpace.svelte";
  import { type AssetSpec } from "./util";

  const MAX_PLAYERS_IN_HEADER = 5

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

  onMount(async () => {
    const props = cloneDeep($state.props) as BoardProps

    const attachments = props.attachments

    // backward compatibility check for when attachments were just strings
    if (attachments && attachments.length>0 && typeof attachments[0] == "string" ){
      const assetSpecs = []

      attachments.forEach((a,count) =>
        assetSpecs.push( {embed: true, weaveUrl: a, position: { x:  50*count, y: 20*count }, size:{width:100,height:100}}))
      
      props.attachments = assetSpecs
      activeBoard.requestChanges([{type: 'set-props', props }])
    }
  })

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
  let dragOffsetX, dragOffsetY
  let dragType
  let showEmbed = false
  let embedsEditable = false

  const toggleEmbedsEditable = () => {
    embedsEditable = !embedsEditable
    walSpace.setEditable(embedsEditable)
  }

  const toggleShowEmbed = () => {
    showEmbed = !showEmbed
  }

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

  function handleDragStart(e) {
    draggingHandled = false
    //console.log("handleDragStart", e)
    e.dataTransfer.dropEffect = "move";
//    e.dataTransfer.setDragImage(e.target)
    draggedItemId = e.target.getAttribute('id')
    e.dataTransfer
      .setData("text", e.target.getAttribute('id'));
    const bounds = e.target.getBoundingClientRect()
    dragOffsetX = (e.clientX - bounds.left) ;
    dragOffsetY = (e.clientY - bounds.top) ;

  }

  function handleDragEnd(e) {
    clearDrag()
    //console.log("handleDragEnd",e )
  }
  function handleDragOver(e) {
    e.preventDefault()
  
  }
  function handleDragDrop(e:DragEvent) {
    e.preventDefault();
    if (draggingHandled) {
      return
    }
    const bounds = img.getBoundingClientRect()

    if (dragType == "move") {    
      const x = (e.clientX - bounds.left)-dragOffsetX ;
      const y = (e.clientY - bounds.top)-dragOffsetY ;
      activeBoard.requestChanges( [{ 
        type: "move-piece", 
        id: draggedItemId,
        x,y
      }]);
    }
    else {
      let pieceWidth
      console.log("Drop", draggedItemId)
      if (isPlayer(draggedItemId)) {
        pieceWidth=30
      } else {
        const def = pieceDefs[draggedItemId]
        pieceWidth = def.width
      }
      const x = (e.clientX - bounds.left) - pieceWidth/2;
      const y = (e.clientY - bounds.top)-dragOffsetY;
      activeBoard.requestChanges( [{ 
        type: "add-piece", 
        pieceType: draggedItemId,
        imageIdx: 0,
        x,y,attachments:[]
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

  let walSpace:WalSpace
  const addAttachment = async () => {
    const wal = await store.weaveClient.userSelectWal()
    if (wal) {
      const props = cloneDeep($state.props) as BoardProps
      if (!props.attachments) {
        props.attachments = []
      }
      const count = props.attachments.length
      const asset:AssetSpec = {embed: true, weaveUrl: weaveUrlFromWal(wal), position: { x:  50*count, y: 20*count }, size:{width:100,height:100}}
      props.attachments.push(asset)
      activeBoard.requestChanges([{type: 'set-props', props }])
    }
  }

  const saveAttachments = async (assets:AssetSpec[]) => {
    const props = cloneDeep($state.props) as BoardProps
    props.attachments = assets
    activeBoard.requestChanges([{type: 'set-props', props }])
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
  const copyWALToClipboard = () => {
    const attachment: WAL = { hrl: [store.dnaHash, activeBoard.hash], context: {} }
    store.weaveClient?.walToPocket(attachment)
  }

  let selectedCommitHash
</script>
<div class="board">
    <EditBoardDialog bind:this={editBoardDialog}></EditBoardDialog>
  <div class="top-bar">
    <div class="left-items">
      <h5>{$state.name}</h5>
      {#if store.weaveClient}
        <sl-button circle title="Add Board to Pocket" class="attachment-button" style="margin-left:10px" on:click={()=>copyWALToClipboard()} >          
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
          <div style="margin-left:5px;">          
            <Avatar agentPubKey={store.myAgentPubKey} showNickname={false} size={25} />
          </div>

          {#each Array.from($participants.entries()) as [agentPubKey, sessionData]}
            {#if Date.now()-sessionData.lastSeen < 30000}
              <div style="margin-left:5px;">
                <Avatar agentPubKey={agentPubKey} showNickname={false} size={25} />
              </div>
            {/if}
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
      {@const playerCount = $state.props.players.length}
      <div class="board-header">
        {#if !$state.playerPieces ||  $state.turns }
          <h3>Players:</h3>
          <div style="display:flex; align-items:end; margin-left: 10px;">
            {#each $state.props.players as player, index}
              {@const thisPlayersTurn = $state.turns && index == ($state.props.turn | 0)}
              <div title={thisPlayersTurn ? "This players turn!" : ""} style="display:flex;align-items:center;flex-direction:column;margin-right:10px">
                {#if thisPlayersTurn}
                  <div class="my-turn"></div>
                {/if}
                <Avatar agentPubKey={decodeHashFromBase64(player)} namePosition="column" size={25} showNickname={playerCount < MAX_PLAYERS_IN_HEADER} tooltip={playerCount < MAX_PLAYERS_IN_HEADER}/>
              </div>
            {/each}
          </div>
        {/if}
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
        {#if store.weaveClient}
          <div class="attachments-area">
            <sl-tooltip content="Attach assets">
              <sl-button  size=small variant="text" on:click={addAttachment}><SvgIcon icon=addAsset color=white></SvgIcon></sl-button>
            </sl-tooltip>
           
            {#if attachments && attachments.length>0 && typeof attachments[0]!="string"}
              <AttachmentsList attachments={attachments.map(a=>a.weaveUrl)} allowDelete={true}
              on:remove-attachment={(e)=>removeAttachment(e.detail)}/>
              <sl-tooltip content={showEmbed ? "Hide Asset Pane" : "Show Asset Pane"}>
                <sl-button  size=small variant="text" on:click={toggleShowEmbed}><SvgIcon icon={showEmbed?"hide":"show"} color=white></SvgIcon></sl-button>
              </sl-tooltip>
              {#if showEmbed}
              <sl-tooltip content={embedsEditable ? "Save Changes" : "Edit Asset Pane"}>
                <sl-button  variant="text" on:click={toggleEmbedsEditable}><SvgIcon icon={embedsEditable?'faCheck':'faEdit'} color=black></SvgIcon></sl-button>
              </sl-tooltip>
              {/if}
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
      <div class="img-container">
        <AttachmentsDialog activeBoard={activeBoard} bind:this={attachmentsDialog}></AttachmentsDialog>
        {#each pieces as piece}
          {@const pieceIsPlayer = isPlayer(piece.typeId)}
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
            style={`top:${piece.y}px;left:${piece.x}px;font-size:${pieceIsPlayer ? 30 : pieceDefs[piece.typeId].height}px`}
            >
            {#if piece.attachments && piece.attachments.length > 0}
            <div class="piece-has-attachment">{piece.attachments.length}</div>
            {/if}
            {#if pieceIsPlayer}
              <Avatar disableAvatarPointerEvents={iCanPlay} agentPubKey={decodeHashFromBase64(piece.typeId)} showNickname={false} size={30} />
            {:else}
              {#if pieceDefs[piece.typeId].type===PieceType.Emoji}{pieceDefs[piece.typeId].images[piece.imageIdx]}{/if}
              {#if pieceDefs[piece.typeId].type===PieceType.Image}<img draggable={false} src={pieceDefs[piece.typeId].images[piece.imageIdx]} width={pieceDefs[piece.typeId].width} height={pieceDefs[piece.typeId].height}/>{/if}
            {/if}
          </div>
        {/each}
        <img width={$state.props.bgWidth} height={$state.props.bgHeight} draggable={false} bind:this={img} src={bgUrl}
          
          style="padding:100px; background-color:lightgray; border:1px solid; flex: 1; object-fit: cover; overflow: hidden"
          on:drop={handleDragDrop}  
          on:dragover={handleDragOver}          
          >
      </div>
      {#if showEmbed}
      <div class="wal-space">
        <WalSpace items={$state.props.attachments? cloneDeep($state.props.attachments) : []} bind:this={walSpace}
          on:assets-edited={(e)=> saveAttachments(e.detail)}
        ></WalSpace>
      </div>
      {/if}
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
    z-index: 100;
    margin-right: 18px;
    margin-bottom: -10px;
    border-radius: 50%;
    width: 12px;
    height: 12px;
    background-color: rgb(139, 212, 30);
  }
  .board-area {
    display:flex;
    justify-content:center;
    margin-top: 10px;
    display: flex;
    overflow:auto;
  }
  .piece-source {
    margin-right: 20px;
    margin-left: 10px;
  }
  .img-container {
    justify-content: center;
    position: relative;
    padding: 0px;
    overflow: auto;
  }
  .wal-space {
    margin-left:20px;
    margin-right:10px;
    margin-bottom:5px;
    flex-grow: 1;
  }
  .piece {
    position: absolute;
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
    padding-top: 5px;
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
