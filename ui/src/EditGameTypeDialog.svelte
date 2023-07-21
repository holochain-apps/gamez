<script lang="ts">
    import BoardEditor from './BoardEditor.svelte';
    import type { GamezStore } from './store';
    import { getContext, onMount } from 'svelte';
    import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
    import '@shoelace-style/shoelace/dist/components/button/button.js';
    import type SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog';
    import type { BoardProps, PieceDef } from './board';
    import type { BoardType } from './boardList';
    import { cloneDeep } from "lodash";

    let dialog: SlDialog
    onMount(async () => {

    })
    let boardType: BoardType

    export const  open = async (type: BoardType)=> {
        boardType = type
        boardEditor.edit(cloneDeep(type.board))
        dialog.show()
    }

    const { getStore } :any = getContext('gzStore');

    const store:GamezStore = getStore();

    const updateBoard = async ( name: string, pieceDefs: PieceDef[], props: BoardProps) => {
        store.boardList.requestChanges([
            {
                type: 'set-board-type',
                id: boardType.id,
                board: {
                    status: boardType.board.status,
                    players: [],
                    max_players: boardType.board.max_players,
                    min_players: boardType.board.min_players,
                    name,
                    pieceDefs,
                    props
                }
            }])

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
<sl-dialog style="--width:600px" bind:this={dialog} label="Edit Board" 
on:sl-request-close={(event)=>{
    if (event.detail.source === 'overlay') {
    event.preventDefault();    
}}}>
    <BoardEditor bind:this={boardEditor} handleSave={updateBoard} handleDelete={undefined} cancelEdit={close}/>
</sl-dialog>
