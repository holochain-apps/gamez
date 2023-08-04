<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import type { GamezStore } from "./store";
  import { Marked, Renderer } from "@ts-stack/markdown";
  import type { v1 as uuidv1 } from "uuid";
  import type { BoardState, PieceDef } from "./board";
  import EditBoardDialog from "./EditBoardDialog.svelte";
  import AvatarIcon from "./AvatarIcon.svelte";
  import { decodeHashFromBase64 } from "@holochain/client";
  import { cloneDeep, isEqual } from "lodash";
  import sanitize from "sanitize-filename";
  import Fa from "svelte-fa";
  import { faClose, faCog, faFileExport } from "@fortawesome/free-solid-svg-icons";
  import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';


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

  const dispatch = createEventDispatcher()

 
  const { getStore } :any = getContext("gzStore");
  let gzStore: GamezStore = getStore();

  $: activeHash = gzStore.boardList.activeBoardHash;
  $: state = gzStore.boardList.getReadableBoardState($activeHash);
  $: pieces = $state ? Object.values($state.props.pieces) : undefined;
  $: pieceDefs = $state ? getPieceDefs($state.pieceDefs) : undefined;

  $: avatars = gzStore.boardList.avatars()

  const getPieceDefs = (defs:Array<PieceDef>) => {
    const pieceDefs: {[key: string]: PieceDef} = {}
    defs.forEach(d=>pieceDefs[d.id]=d)
    return pieceDefs
  }

  const closeBoard = () => {
    gzStore.boardList.closeActiveBoard();
  };
  let editBoardDialog
  let draggingHandled = true
  let draggedItemId = ""
  let dragOffsetX, dragOffsetY

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
    const x = (e.clientX - bounds.left)-dragOffsetX ;
    const y = (e.clientY - bounds.top)-dragOffsetY ;
    
    dispatch("requestChange", [{ 
      type: "move-piece", 
      id: draggedItemId,
      x,y
    }]);
    clearDrag()
    //console.log("handleDragDropColumn",e, column )
  }
  const clearDrag = () => {
    draggingHandled = true
    draggedItemId = ""
  }
  const DEFAULT_KD_BG_IMG = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chessboard_green_squares.svg/512px-Chessboard_green_squares.svg.png"
    //const DEFAULT_KD_BG_IMG = "https://img.freepik.com/free-photo/studio-background-concept-abstract-empty-light-gradient-purple-studio-room-background-product-plain-studio-background_1258-54461.jpg"
    const NO_BOARD_IMG = "https://holochain.org/img/big_logo.png"

  $: bgUrl = state ?  ($state.props && $state.props.bgUrl) ? $state.props.bgUrl : DEFAULT_KD_BG_IMG : NO_BOARD_IMG
  $: bgImage = `background-image: url("`+ bgUrl+`");`

  let img
</script>
<div class="board">
    <EditBoardDialog bind:this={editBoardDialog}></EditBoardDialog>
  <div class="top-bar">
    <div class="left-items">
      <h5>{$state.name}</h5>
    </div>
    <div class="right-items">
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

    <div class="board-area">
      <div class="piece-source">
        <h3>Add:</h3>
        {#each Object.values(pieceDefs) as p}
          <sl-button on:click={()=>{
            dispatch("requestChange", [{ 
              type: "add-piece", 
              pieceType: p.id,
              imageIdx: 0,
              x: 5,
              y: 5,
            }]);

            }}>{pieceDefs[p.id].images[0]} {pieceDefs[p.id].name}
          </sl-button>
        {/each}
      </div>
      <div class="img-container">
        {#each pieces as piece}
        <div class="piece"
          draggable={true}
          on:dragstart={handleDragStart}
          on:dragend={handleDragEnd}
          on:drop={handleDragDrop}  
          on:dragover={handleDragOver}          

          id={piece.id}
          style={`top:${piece.y}px;left:${piece.x}px;font-size:${pieceDefs[piece.typeId].height}px`}
          >
          {pieceDefs[piece.typeId].images[piece.imageIdx]}      
        </div>
        {/each}
        <img bind:this={img} src={bgUrl}
          
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
