<script lang="ts">
  import { getContext } from "svelte";
  import type { GamezStore } from "./store";
  import { type BoardState, PieceDef, PieceType, Board} from "./board";
  import EditBoardDialog from "./EditBoardDialog.svelte";
  import Avatar from "./Avatar.svelte"
  import { cloneDeep } from "lodash";
  import sanitize from "sanitize-filename";
  import Fa from "svelte-fa";
  import { faArrowTurnDown, faClose, faCog, faFileExport } from "@fortawesome/free-solid-svg-icons";
  import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
  import { decodeHashFromBase64 } from "@holochain/client";


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

  $: activeHash = store.boardList.activeBoardHash;
  $: state = activeBoard.readableState()
  $: pieces = $state ? Object.values($state.props.pieces) : undefined;
  $: pieceDefs = $state ? getPieceDefs($state.pieceDefs) : undefined;

  $: myAgentPubKeyB64 = store.myAgentPubKeyB64
  $: myAgentPubKey = store.myAgentPubKey
  $: participants = activeBoard.participants()

  const getPieceDefs = (defs:Array<PieceDef>) => {
    const pieceDefs: {[key: string]: PieceDef} = {}
    defs.forEach(d=>pieceDefs[d.id]=d)
    return pieceDefs
  }

  const closeBoard = () => {
    store.boardList.closeActiveBoard(false);
  };

  const leaveBoard = () => {
    store.boardList.closeActiveBoard(true);
  };

  let editBoardDialog
  let draggingHandled = true
  let draggedItemId = ""
  let dragOffsetX, dragOffsetY
  let dragType

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
      const def = pieceDefs[draggedItemId]
      const x = (e.clientX - bounds.left) - def.width/2;
      const y = (e.clientY - bounds.top)-dragOffsetY;
      activeBoard.requestChanges( [{ 
        type: "add-piece", 
        pieceType: draggedItemId,
        imageIdx: 0,
        x,y
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

</script>
<div class="board">
    <EditBoardDialog bind:this={editBoardDialog}></EditBoardDialog>
  <div class="top-bar">
    <div class="left-items">
      <h5>{$state.name}</h5>
    </div>
    <div class="right-items">
      Watching:
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


      <sl-button circle on:click={leaveBoard} title="Leave">
        <Fa icon={faArrowTurnDown} />
      </sl-button>
      <sl-button circle on:click={()=> editBoardDialog.open(cloneDeep($activeHash))} title="Settings">
        <Fa icon={faCog} size="1x"/>
      </sl-button>
      <sl-button circle on:click={() => exportBoard($state)} title="Export">
        <Fa icon={faFileExport} />
      </sl-button>
      <sl-button circle on:click={closeBoard} title="Close">
        <Fa icon={faClose} />
      </sl-button>
    </div>
  </div>
  {#if $state}
    {#if $state.min_players}
      <div style="display:flex;justify-content:center">
        Players:
        <div style="display:flex">
          {#each $state.props.players as player}
          <Avatar agentPubKey={decodeHashFromBase64(player)} />
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
        {#if haveJoined($state)}
          <sl-button 
            on:click={()=>{
              activeBoard.requestChanges( [{ 
              type: "remove-player", 
              player: myAgentPubKeyB64
            }]);

            }}>
          Leave Game
          </sl-button>
        {/if}
      </div>
    {/if}

    <div class="board-area">
      <div class="piece-source">
        <h3>Add:</h3>
        {#each Object.values(pieceDefs) as p}
          <div class="piece-def"
            id={p.id}
            draggable={haveJoined($state)}
            class:draggable={haveJoined($state)}
            on:dragstart={handleDragStartAdd}
          >
            {#if pieceDefs[p.id].type===PieceType.Emoji}{pieceDefs[p.id].images[0]}{/if}
            {#if pieceDefs[p.id].type===PieceType.Image}<img draggable={false} src={pieceDefs[p.id].images[0]} width={pieceDefs[p.id].width} height={pieceDefs[p.id].height}/>{/if}
            {pieceDefs[p.id].name}

          </div>
        {/each}
      </div>
      <div class="img-container">
        {#each pieces as piece}
        <div class="piece"
          draggable={haveJoined($state)}
          on:dragstart={handleDragStartMove}
          on:dragend={handleDragEnd}
          on:drop={handleDragDrop}  
          on:dragover={handleDragOver}          

          id={piece.id}
          style={`top:${piece.y}px;left:${piece.x}px;font-size:${pieceDefs[piece.typeId].height}px`}
          >
          {#if pieceDefs[piece.typeId].type===PieceType.Emoji}{pieceDefs[piece.typeId].images[piece.imageIdx]}{/if}
          {#if pieceDefs[piece.typeId].type===PieceType.Image}<img draggable={false} src={pieceDefs[piece.typeId].images[piece.imageIdx]} width={pieceDefs[piece.typeId].width} height={pieceDefs[piece.typeId].height}/>{/if}

        </div>
        {/each}
        <img draggable={false} bind:this={img} src={bgUrl}
          
          style="padding:100px; background-color:lightgray; border:1px solid; flex: 1; object-fit: cover; overflow: hidden"
          on:drop={handleDragDrop}  
          on:dragover={handleDragOver}          
          >
      </div>
    </div>
  {/if}
</div>
<style>
  .board-area {
    margin:auto;
    margin-top: 10px;
    display: flex;
  }
  .piece-source {
    max-width: 100px;
    margin-right: 20px;
  }
  .img-container {
    position: relative;
    padding: 0px;
    overflow: auto;
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
</style>
