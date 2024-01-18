<script lang="ts">
  import "@shoelace-style/shoelace/dist/components/skeleton/skeleton.js";
  import { createEventDispatcher, getContext } from "svelte";
  import type { GamezStore } from "./store";
  import Fa from "svelte-fa";
  import type { Board } from "./board";
  import { faPlus } from "@fortawesome/free-solid-svg-icons";

  export let activeBoard: Board

  const dispatch = createEventDispatcher()
  const { getStore } :any = getContext("gzStore");
  let store: GamezStore = getStore();
  let attachmentTypes = Array.from(store.weClient.attachmentTypes.entries())
  export const refresh = () => {
    attachmentTypes = Array.from(store.weClient.attachmentTypes.entries())
  }  
</script>

<div>
    <h3>Create Attachment From:</h3>
    {#each attachmentTypes as [hash, record]}
        <div>
        {#await store.weClient.appletInfo(hash)}
        ...
        {:then appletInfo}
            <strong>{appletInfo.appletName}:</strong>
        {:catch error}
            {error}
        {/await}
        {#each Object.values(record) as aType}
        <sl-icon src={aType.icon_src}></sl-icon>{aType.label}
        <button class="control" on:click={async ()=>{
            const hrl = await aType.create({hrl:[store.dnaHash,activeBoard.hash],context:""})
            dispatch("add-binding",hrl)
            }} >          
            <Fa icon={faPlus}/>
        </button>
        {/each}
        </div>
    {/each}
</div>
<style>
</style>