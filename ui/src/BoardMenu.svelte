<script lang="ts">
    import { Menu, List, ListItem } from 'svelte-materialify';
    import { getContext } from "svelte";
    import type { GamezStore } from "./store";
    import type { EntryHashB64 } from '@holochain/client';
    import { faArchive, faChevronDown, faFileImport, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';
    import '@shoelace-style/shoelace/dist/components/select/select.js';
    import '@shoelace-style/shoelace/dist/components/option/option.js';



    const { getStore } :any = getContext('gzStore');

    const store:GamezStore = getStore();
    $: boardList = store.boardList.stateStore()
    $: activeHash = store.boardList.activeBoardHash;
    $: state = store.boardList.getReadableBoardState($activeHash);
    $: archivedBoards = $boardList.boards.findIndex((board)=>board.status === "archived") >= 0
    $: activeBoards = $boardList.boards.findIndex((board)=>board.status !== "archived") >= 0

    const selectBoard = (hash: EntryHashB64) => {
        store.boardList.setActiveBoard(hash)
    }

    const unarchiveBoard = (hash: EntryHashB64) => () => {
        store.boardList.unarchiveBoard(hash)
    }
</script>

<div class="board-menu">
{#if activeBoards}
<sl-select
    style="margin-left:20px;"
    placeholder="Active Games:"
    on:sl-change={(e)=>{selectBoard(e.target.value)}}
>
    {#each $boardList.boards as board }
        {#if board.status !== "archived" }
            <sl-option value={board.hash}>{board.name}</sl-option>
        {/if}
    {/each}
</sl-select>
{/if}
{#if archivedBoards}
<Menu>
    <div slot="activator">
        <sl-button style="margin-left:10px" title="Archived Games">
            <Fa icon={faArchive}></Fa>
            <Fa icon={faChevronDown}></Fa>
        </sl-button>
    </div>
    <List>
        {#each $boardList.boards as board }
            {#if board.status === "archived" }
                <ListItem dense={true} on:click={unarchiveBoard(board.hash)}>{board.name}</ListItem>
            {/if}
        {/each}
    </List>
</Menu>
{/if}


</div>
<style>
  .board-menu {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
  }

</style>