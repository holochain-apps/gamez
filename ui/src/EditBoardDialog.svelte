<script lang="ts">
    import BoardEditor from './BoardEditor.svelte';
    import type { GamezStore } from './store';
    import { getContext, onMount } from 'svelte';
    import { isEqual } from 'lodash'
    import type { EntryHash } from '@holochain/client';
    import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
    import '@shoelace-style/shoelace/dist/components/button/button.js';
    import type SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog';
    import type { Board, BoardProps, BoardState,  PieceDef } from './board';

    let boardHash:EntryHash|undefined = undefined

    let dialog: SlDialog
    onMount(async () => {

    })

    export const  open = async (hash: EntryHash)=> {
        boardHash = hash
        const board: Board | undefined = await store.boardList.getBoard(boardHash)
        if (board) {
            boardEditor.edit(board.state())
            dialog.show()
        }
    }

    const { getStore } :any = getContext('gzStore');

    const store:GamezStore = getStore();

    const updateBoard = async ( name: string, pieceDefs: PieceDef[], props: BoardProps, minPlayers:number, maxPlayers:number, turns: boolean, playerPieces: boolean) => {
        const board: Board | undefined = await store.boardList.getBoard(boardHash)
        if (board) {
        let changes = []
        const state: BoardState = board.state()
        if (state.name != name) {
            changes.push(
            {
                type: 'set-name',
                name: name
            })
        }
        if (state.turns != turns) {
            changes.push(
            {
                type: 'set-turns',
                turns: turns
            })
        }
        if (state.playerPieces != playerPieces) {
            changes.push(
            {
                type: 'set-player-pieces',
                playerPieces: playerPieces
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
            board.requestChanges(changes)
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
