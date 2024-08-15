<script lang="ts">
  import { onMount } from 'svelte';
  import { cloneDeep } from 'lodash';
  import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
  import type SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog';
  import '@shoelace-style/shoelace/dist/components/button/button.js';

  import { getStoreContext } from '~/lib/context';
  import type { BoardProps, BoardState, PieceDef, BoardDefData } from '~/lib/store';
  import BoardEditor from '~/shared/BoardEditor.svelte';

  let dialog: SlDialog;
  onMount(async () => {});
  let boardDef: BoardDefData;
  let board: BoardState;

  export const open = async (def: BoardDefData) => {
    boardDef = def;
    board = cloneDeep(def.board);
    boardEditor.edit(board);
    dialog.show();
  };

  const store = getStoreContext();

  const updateBoard = async (
    name: string,
    pieceDefs: PieceDef[],
    props: BoardProps,
    minPlayers: number,
    maxPlayers: number,
    turns: boolean,
    playerPieces: boolean,
  ) => {
    const newBoard = {
      status: board.status,
      max_players: maxPlayers,
      min_players: minPlayers,
      turns,
      playerPieces,
      name,
      pieceDefs,
      props,
      boundTo: board.boundTo,
      creator: board.creator,
    };

    await store.client.updateBoardDef(boardDef.originalHash, boardDef.record.actionHash, newBoard);

    close();
  };
  // const archiveBoard = () => {
  //     store.boardList.archiveBoard(boardHash)
  //     close()
  // }
  const close = () => {
    dialog.hide();
  };
  let boardEditor;
</script>

<sl-dialog
  style="--width:600px"
  bind:this={dialog}
  class="text-black/60!"
  label="Edit Game Type"
  on:sl-request-close={(event) => {
    if (event.detail.source === 'overlay') {
      event.preventDefault();
    }
  }}
>
  <BoardEditor
    bind:this={boardEditor}
    handleSave={updateBoard}
    handleDelete={undefined}
    cancelEdit={close}
  />
</sl-dialog>
