<script lang="ts">
  import { type HrlB64WithContext, isWeContext } from "@lightningrodlabs/we-applet";
  import { cloneDeep } from "lodash";
  import type { Board, Piece } from "./board";
  import { getContext } from "svelte";
  import type { GamezStore } from "./store";
  import { hrlB64WithContextToRaw, hrlWithContextToB64} from "./util";
  import { faPaperclip, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";
  import '@shoelace-style/shoelace/dist/components/button/button.js';
  import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';

  const { getStore } :any = getContext("gzStore");
  let store: GamezStore = getStore();
  let piece
  let attachments: Array<HrlB64WithContext> = []
 
  export let activeBoard: Board
  export const close=()=>{dialog.hide()}
  export const open=(p: Piece)=>{
    piece = p
    attachments = piece.attachments ? cloneDeep(piece.attachments): []
    dialog.show()
  }
  let dialog
  $: attachments

  function removeAttachment(index: number) {
    attachments.splice(index, 1);
    attachments = attachments
  }

  const addAttachment = async () => {
    const hrl = await store.weClient.userSelectHrl()
    if (hrl) {
      console.log("hrl",hrl)
      attachments.push(hrlWithContextToB64(hrl))
      attachments = attachments
    }
  }

  const handleSave = async () => {
    activeBoard.requestChanges([{
      type: 'set-piece-attachments', 
      id: piece.id,
      attachments
    }])
    close()
  }
</script>

<sl-dialog label="Attachments" bind:this={dialog}>
  {#if isWeContext()}
  
  <!-- {JSON.stringify(store.weClient.attachmentTypes)} -->
  {#each Array.from(store.weClient.attachmentTypes.entries()) as [hash, record]}
    {record.key} {record.value}
    <button class="control" on:click={()=>addAttachment()} >          
      <Fa icon={faPlus}/>
    </button>
  {/each}

  <div class="attachments-list">
    {#each attachments as attachment, index}
      <div class="attachment-item">
        {#await store.weClient.entryInfo(hrlB64WithContextToRaw(attachment).hrl)}
          <sl-button size="small" loading></sl-button>
        {:then { entryInfo }}
          <sl-button  size="small"
            on:click={()=>{
                const hrl = hrlB64WithContextToRaw(attachment)
                store.weClient.openHrl(hrl.hrl, hrl.context)
              }}
            style="display:flex;flex-direction:row;margin-right:5px"><sl-icon src={entryInfo.icon_src} slot="prefix"></sl-icon>
            {entryInfo.name}
          </sl-button> 
          <sl-button size="small"
            on:click={()=>{
              removeAttachment(index)
            }}
          >
            <Fa icon={faTrash} />
          </sl-button>
        {:catch error}
          Oops. something's wrong.
        {/await}
      </div>
    {/each}
  </div>
  <div style="margin-top:30px; display:flex; justify-content: space-between">
    <sl-button style="margin-top:5px;margin-right: 5px" circle on:click={()=>addAttachment()} >          
      <Fa icon={faPaperclip}/>
    </sl-button>
    <div>
      <sl-button on:click={()=>close()} style="margin-left:10px">
        Cancel
      </sl-button>
      <sl-button style="margin-left:10px" on:click={() => handleSave()} variant="primary">
        Save
      </sl-button>
    </div>
  </div>
  {/if}
</sl-dialog>

<style>
  .attachments-list {
    margin-top:5px; 
    display:flex;
    flex-direction:row;
    flex-wrap: wrap;

  }
  .attachment-item {
    border:1px solid #aaa; 
    background-color:rgba(0,255,0,.1); 
    padding:4px;
    display:flex;
    margin-right:4px;
    border-radius:4px;
  }

  sl-dialog::part(panel) {
      background: #FFFFFF;
      border: 2px solid rgb(166 115 55 / 26%);
      border-bottom: 2px solid rgb(84 54 19 / 50%);
      border-top: 2px solid rgb(166 115 55 / 5%);
      box-shadow: 0px 15px 40px rgb(130 107 58 / 35%);
      border-radius: 10px;
  }
</style>