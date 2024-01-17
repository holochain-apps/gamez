<script lang="ts">
  import "@shoelace-style/shoelace/dist/components/skeleton/skeleton.js";
  import { createEventDispatcher, getContext } from "svelte";
  import type { GamezStore } from "./store";
  import { faTrash } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";
  import { hrlB64WithContextToRaw } from "./util";
  import type { HrlB64WithContext } from "@lightningrodlabs/we-applet";

  const dispatch = createEventDispatcher()

  export let attachments: Array<HrlB64WithContext>

  const { getStore } :any = getContext("gzStore");
  let store: GamezStore = getStore();
  
</script>
<div class="attachments-list">
  {#each attachments as attachment, index}
    <div class="attachment-item">
      {#await store.weClient.attachableInfo(hrlB64WithContextToRaw(attachment))}
        <sl-button size="small" loading></sl-button>
      {:then { attachableInfo }}
        <sl-button  size="small"
          on:click={()=>{
              const hrlWithContext = hrlB64WithContextToRaw(attachment)
              store.weClient.openHrl(hrlWithContext)
            }}
          style="display:flex;flex-direction:row;margin-right:5px"><sl-icon src={attachableInfo.icon_src} slot="prefix"></sl-icon>
          {attachableInfo.name}
        </sl-button> 
        <sl-button size="small"
          on:click={()=>{
            dispatch("remove-attachment",index)
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
</style>