<script lang="ts">
    import { PieceDef, type BoardProps, Board } from './board';
    import { getContext, onMount } from 'svelte';
  	import DragDropList, { VerticalDropZone, reorder, type DropEvent } from 'svelte-dnd-list';
    import 'emoji-picker-element';
    import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
    import '@shoelace-style/shoelace/dist/components/button/button.js';
    import '@shoelace-style/shoelace/dist/components/input/input.js';
    import Fa from 'svelte-fa'
    import { faPlus, faGripVertical, faTrash} from '@fortawesome/free-solid-svg-icons';
    import { cloneDeep } from "lodash";

    import type { GamezStore } from './store';
    import type { EntryHashB64 } from '@holochain/client';

    const { getStore } :any = getContext('gzStore');

    const store:GamezStore = getStore();

    export let handleSave
    export let handleDelete = undefined
    export let cancelEdit

    let text = ''
    let props:BoardProps = {bgUrl: "", pieces:{}}
    let pieceDefs: Array<PieceDef> = []
    let nameInput
    export const reset = () => {
      nameInput.value = ""
      text = ''
      props = {bgUrl: "", pieces:{}}
      pieceDefs = []
    }

    export const  edit = async (state: BoardState)=> {
      text = state.name
      nameInput.value = text
      pieceDefs = cloneDeep(state.pieceDefs)
      props = state.props ? cloneDeep(state.props) : {bgUrl:""}
    }

    const addPieceDef = () => {
      pieceDefs.push(new PieceDef("smiley", 30, 30, [`🙂`]))
      pieceDefs = pieceDefs
    }
    const deletePieceDef = (index) => () => {
      pieceDefs.splice(index, 1)
      pieceDefs = pieceDefs
    }
    onMount( async () => {
    })

    const handleKeydown = (e) => {
      if (e.key === "Escape") {
        cancelEdit()
      } else if (e.key === "Enter" && e.ctrlKey) {
        handleSave(text, pieceDefs, props)
      } else  if (e.key === 'Tab') {
        // trap focus
        const tabbable = Array.from(document.querySelectorAll('input'))

        let index = tabbable.findIndex((elem)=>elem == document.activeElement)
  
        if (index === -1 && e.shiftKey) index = 0;

        index += tabbable.length + (e.shiftKey ? -1 : 1);
        index %= tabbable.length;

        tabbable[index].focus();
        e.preventDefault();
      }
    }
    const onDropPieceDefs = ({ detail: { from, to } }: CustomEvent<DropEvent>) => {
      if (!to || from === to || from.dropZoneID !== "pieceDefs") {
        return;
      }

      pieceDefs = reorder(pieceDefs, from.index, to.index);
    }
   let showEmojiPicker :number|undefined = undefined
   let emojiDialog
</script>

<svelte:window on:keydown={handleKeydown}/>
  <div class='board-editor'>
    <div class="edit-title">
      <div class="title-text">Title:</div> <sl-input class='textarea' maxlength="60" bind:this={nameInput}  on:input={e=>text= e.target.value}></sl-input>
    </div>
    <div class="edit-piece-defs unselectable">
      <div class="title-text">
        Pieces:

        <sl-button circle size="small"  on:click={() => addPieceDef()}>
          <Fa icon={faPlus}/>
        </sl-button>
      </div>
      <sl-dialog label="Choose Emoji" bind:this={emojiDialog}>
          <emoji-picker on:emoji-click={(e)=>  {
            console.log("PD", pieceDefs)
            pieceDefs[showEmojiPicker].images[0] = e.detail.unicode
            showEmojiPicker = undefined
            emojiDialog.hide()
          }
          }></emoji-picker>
    
      </sl-dialog>
      <DragDropList
        id="pieceDefs"
        type={VerticalDropZone}
	      itemSize={100}
        itemCount={pieceDefs.length}
        on:drop={onDropPieceDefs}
        let:index
        itemClass="unselectable"
        >
        <div class="piece-def">
          <div class="grip" ><Fa icon={faGripVertical}/></div>
          <div style="display:flex; flex-direction:column; ">

            <div style="display:flex; flex-direction:row; align-items:flex-end;">
              <sl-input label="Emoji" style="width:65px;" class='textarea' maxlength={1} value={pieceDefs[index].images[0]} title="piece value"
              on:input={e=>pieceDefs[index].images[0] = e.target.value}> </sl-input>
              <sl-button style="margin-bottom:5px" on:click={()=>{showEmojiPicker = index;emojiDialog.show()}} >
                Pick
              </sl-button>
              <sl-input label="Name" style="width:165px;margin-left:10px" class='textarea' value={pieceDefs[index].name} title="piece name"
              on:input={e=>pieceDefs[index].name = e.target.value}> </sl-input>
              <sl-input label="Width" style="width:70px;" maxlength={3} class='textarea' value={pieceDefs[index].width}
              on:input={e=>pieceDefs[index].width = parseInt(e.target.value)}> </sl-input>
              <sl-input label="Height" style="width:70px;" maxlength={3} class='textarea' value={pieceDefs[index].height}
              on:input={e=>pieceDefs[index].height = parseInt(e.target.value)}> </sl-input>
            </div>
          </div>
          <sl-button style="margin-left:25px" size="small"  on:click={deletePieceDef(index)} >
            <Fa icon={faTrash}/>
          </sl-button>
    </div>
      </DragDropList> 
    </div>
   
    <div class="edit-title">
      <div class="title-text">Background Image:</div> <sl-input class='textarea' maxlength="255" value={props.bgUrl} on:input={e=>props.bgUrl = e.target.value} />
    </div>

    <div class='controls'>
      {#if handleDelete}
        <sl-button on:click={handleDelete}>
          Archive
        </sl-button>
      {/if}
      <sl-button on:click={cancelEdit} style="margin-left:10px">
        Cancel
      </sl-button>
      <sl-button style="margin-left:10px" on:click={() => handleSave(text, pieceDefs, props)} variant="primary">
        Save
      </sl-button>
    </div>
 </div>


   
 <style>
  .board-editor {
    display: flex;
    flex-basis: 500px;
    font-style: normal;
    font-weight: 600;
    color: #000000;
    flex-direction: column;
    justify-content: flex-start;
  }
  .textarea {
    width: 100%;
    padding: 5px;
    margin-right: 5px;
    font-weight: normal;
  }

  .controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding-left: 7px;
    padding-top: 10px;
  }
  .piece-def  {
    border: solid 1px lightgray;
    padding:10px;
    border-radius: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .grip {
    margin-right:10px;
    cursor: pointer;
  }
  .title-text {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-weight: normal;
    font-size: 120%;
  }
  .unselectable {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.modal {
  background-color: var(--light-text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
