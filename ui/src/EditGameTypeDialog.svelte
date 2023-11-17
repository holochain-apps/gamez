<script lang="ts">
    import BoardEditor from './BoardEditor.svelte';
    import type { BoardDef, BoardDefData, GamezStore } from './store';
    import { getContext, onMount } from 'svelte';
    import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
    import '@shoelace-style/shoelace/dist/components/button/button.js';
    import type SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog';
    import type { BoardProps, BoardState, PieceDef } from './board';
    import { cloneDeep } from "lodash";
    import type { EntryRecord } from '@holochain-open-dev/utils';

    let dialog: SlDialog
    onMount(async () => {

    })
    let boardDef: BoardDefData
    let board: BoardState

    export const  open = async (def: BoardDefData )=> {
        boardDef = def   
        board = cloneDeep(def.board)
        boardEditor.edit(board)
        dialog.show()
    }

    const { getStore } :any = getContext('gzStore');

    const store:GamezStore = getStore();

    const updateBoard = async ( name: string, pieceDefs: PieceDef[], props: BoardProps, minPlayers:number, maxPlayers:number) => {
        const newBoard = {
            status: board.status,
            max_players: maxPlayers,
            min_players: minPlayers,
            name,
            pieceDefs,
            props
        };
        
        await store.client.updateBoardDef(boardDef.originalHash, boardDef.record.actionHash, newBoard)

        close()
    }
    // const archiveBoard = () => {
    //     store.boardList.archiveBoard(boardHash)
    //     close()
    // }
    const close = ()=>{
        dialog.hide()
    }
    let boardEditor
</script>
<sl-dialog style="--width:600px" bind:this={dialog} label="Edit Game Type" 
on:sl-request-close={(event)=>{
    if (event.detail.source === 'overlay') {
    event.preventDefault();    
}}}>
    <BoardEditor bind:this={boardEditor} handleSave={updateBoard} handleDelete={undefined} cancelEdit={close}/>
</sl-dialog>
