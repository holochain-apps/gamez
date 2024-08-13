<script lang="ts">
    import { getContext } from 'svelte';
    import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
    import '@shoelace-style/shoelace/dist/components/button/button.js';
    import type SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog';
    
    import BoardEditor from '~/shared/BoardEditor.svelte';
    import type { GamezStore } from '~/shared/store';
    import type { BoardProps, BoardState, PieceDef } from '~/shared/board';

    let editPieceDefs = []
    let dialog: SlDialog

    const { getStore } :any = getContext('gzStore');

    const store:GamezStore = getStore();

    const addBoard = async (name: string, pieceDefs: PieceDef[], props: BoardProps, minPlayers:number, maxPlayers:number, turns: boolean, playerPieces:boolean) => {
        const state:BoardState = {creator:store.myAgentPubKeyB64, status:"", max_players:maxPlayers, min_players:minPlayers, turns, name, pieceDefs, props, playerPieces, boundTo:[]}
        const result = await store.makeGameType(state)
        dialog.hide()
    }
    export const open = ()=> {
        boardEditor.reset()
        dialog.show()
    }
    let boardEditor

</script>
<sl-dialog style="--width:600px" bind:this={dialog} class="text-black/60!" label="New Game Type"
    on:sl-request-close={(event)=>{
        if (event.detail.source === 'overlay') {
        event.preventDefault();
  }}}>
    <BoardEditor bind:this={boardEditor}  handleSave={addBoard} cancelEdit={()=>dialog.hide()} />
</sl-dialog>
