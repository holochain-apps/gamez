<script lang="ts">
  import PlusIcon from '~icons/fa6-solid/plus';
  import { toPromise, derived, asyncDerived } from '@holochain-open-dev/stores';

  import {
    type BoardDefData,
    PieceDef,
    PieceType,
    type BoardProps,
    type BoardState,
  } from '~/lib/store';
  import { getStoreContext } from '~/lib/context';
  import { nav, route, type Route } from '~/lib/routes';

  import Input from './BoardEditorInput.svelte';
  import IntegerInput from './IntegerInput.svelte';
  import PieceTypeCard from './PieceTypeCard.svelte';
  import BoardEditorPlain, { type EditableBoardState } from './BoardEditorPlain.svelte';
  import LoadingIndicator from '~/shared/LoadingIndicator.svelte';
  import { isEqual } from 'lodash';

  const store = getStoreContext();
  export let defHash: Uint8Array = null;

  let uiState = {
    saving: false,
    canDelete: false,
    canArchive: false,
  };
  let boardState: EditableBoardState;
  let boardDef: BoardDefData;
  $: (async () => {
    if (defHash) {
      let localBoardDef = await toPromise(store.defs.get(defHash));
      const board = localBoardDef.board;

      boardDef = localBoardDef;
      boardState = {
        name: board.name,
        min_players: board.min_players,
        max_players: board.max_players,
        turns: board.turns,
        playerPieces: board.playerPieces,
        pieceDefs: board.pieceDefs,
        props: {
          bgUrl: board.props.bgUrl,
          bgHeight: board.props.bgHeight,
          bgWidth: board.props.bgWidth,
        },
      };

      // uiState.canDelete = board.creator === store.myAgentPubKeyB64;
    } else {
      boardDef = null;
      boardState = {
        name: '',
        min_players: 1,
        max_players: 6,
        turns: false,
        playerPieces: false,
        pieceDefs: [],
        props: {
          bgUrl: '',
          bgHeight: '',
          bgWidth: '',
        },
      };
    }
  })();

  // BUTTONS ACTIONS

  function toNewBoardState(newBoardState: EditableBoardState): BoardState {
    return {
      ...newBoardState,
      status: '',
      creator: store.myAgentPubKeyB64,
      boundTo: [],
      props: {
        ...newBoardState.props,
        players: [],
        turn: 0,
        attachments: [],
        pieces: {},
      },
    };
  }

  function toUpdatedBoardState(newBoardState: EditableBoardState): BoardState {
    if (!boardDef) throw 'Expected boardDef to be defined';
    return {
      ...boardDef.board,
      ...newBoardState,
      props: {
        ...boardDef.board.props,
        ...newBoardState.props,
      },
    };
  }

  async function handleSave(newBoardState: EditableBoardState) {
    uiState.saving = true;
    if (boardDef) {
      await store.client.updateBoardDef(
        boardDef.originalHash,
        boardDef.record.actionHash,
        toUpdatedBoardState(newBoardState),
      );
    } else {
      await store.makeGameType(toNewBoardState(newBoardState));
    }

    uiState.saving = false;
    nav({ id: 'home' });
  }

  async function handleDelete() {
    if (uiState.canDelete) {
      console.log('Deleting!');
    }
  }
</script>

{#if (defHash && boardDef) || !defHash}
  <BoardEditorPlain
    board={boardState}
    onSave={handleSave}
    canDelete={uiState.canDelete}
    canArchive={uiState.canArchive}
    onDelete={handleDelete}
    disabled={uiState.saving}
  />
{:else}
  <LoadingIndicator class="pt80" />
{/if}
