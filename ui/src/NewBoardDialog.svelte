<script lang="ts">
    import BoardEditor from './BoardEditor.svelte';
    import type { GamezStore } from './store';
    import { getContext } from 'svelte';
    import type { BoardProps, PieceDef } from './board';
    import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
    import '@shoelace-style/shoelace/dist/components/button/button.js';
    import type SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog';

    let editPieceDefs = []
    let dialog: SlDialog
    
    const { getStore } :any = getContext('gzStore');

    const store:GamezStore = getStore();

    const addBoard = async (name: string, pieceDefs: PieceDef[], props: BoardProps) => {
        await store.makeGameType({players:[], status:"", max_players:0, min_players:0, name, pieceDefs, props})
        // const board = await store.boardList.makeBoard()
        // store.boardList.setActiveBoard(board.hashB64())
        dialog.hide()
    }
    export const open = ()=> {
        boardEditor.reset()
        dialog.show()
    }
    let boardEditor

</script>
<sl-dialog bind:this={dialog} label="New Board"
    on:sl-request-close={(event)=>{
        if (event.detail.source === 'overlay') {
        event.preventDefault();    
  }}}>
    <BoardEditor bind:this={boardEditor}  handleSave={addBoard} cancelEdit={()=>dialog.hide()} />
</sl-dialog>
