<script lang="ts">
    import BoardEditor from './BoardEditor.svelte';
    import type { GamezStore } from './store';
    import { getContext, onMount } from 'svelte';
    import { isEqual } from 'lodash'
    import type { EntryHashB64 } from '@holochain/client';
    import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
    import '@shoelace-style/shoelace/dist/components/button/button.js';
    import type SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog';
    import type { Board, BoardProps, BoardState,  PieceDef } from './board';

    let boardHash:EntryHashB64|undefined = undefined

    let dialog: SlDialog
    onMount(async () => {

    })

    export const  open = async (hash: EntryHashB64)=> {
        boardHash = hash
        const board: Board | undefined = await store.boardList.getBoard(boardHash)
        if (board) {
            boardEditor.edit(board.state())
            dialog.show()
        }
    }

    const { getStore } :any = getContext('gzStore');

    const store:GamezStore = getStore();

    const updateBoard = async ( name: string, pieceDefs: PieceDef[], props: BoardProps, minPlayers:number, maxPlayers:number) => {
        // ignore board type we don't update that.
        const board: Board | undefined = await store.boardList.getBoard(boardHash)
        if (board) {
        let changes = []
        const state: BoardState = board.state()
        if (state.name != name) {
            store.boardList.requestChanges([
            {
                type: 'set-name',
                hash: board.hashB64(),
                name: name
            }
            ])
            changes.push(
            {
                type: 'set-name',
                name: name
            })
        }
        if (minPlayers != state.min_players || maxPlayers != state.max_players) {
            changes.push({type: 'set-player-range',
            min_players: minPlayers,
            max_players: maxPlayers,
            })
        }
        if (!isEqual(props, state.props)) {
            changes.push({type: 'set-props',
            props: props
            })
        }
        if (!isEqual(pieceDefs, state.pieceDefs)) {
            changes.push({type: 'set-piece-defs',
            pieceDefs: pieceDefs
            })
        }
        if (changes.length > 0) {
            await store.boardList.requestBoardChanges(boardHash, changes)
        }
        }
        close()
    }
    const archiveBoard = () => {
        store.boardList.archiveBoard(boardHash)
        close()
    }
    const close = ()=>{
        dialog.hide()
        boardHash=undefined
    }
    let boardEditor
</script>
<sl-dialog style="--width:600px" bind:this={dialog} label="Edit Game" 
on:sl-request-close={(event)=>{
    if (event.detail.source === 'overlay') {
    event.preventDefault();    
}}}>
    <BoardEditor bind:this={boardEditor} handleSave={updateBoard} handleDelete={archiveBoard} cancelEdit={close}/>
</sl-dialog>
