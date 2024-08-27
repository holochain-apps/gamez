<script lang="ts">
  import { cloneDeep, isEqual } from 'lodash';

  import { toPromise } from '@holochain-open-dev/stores';

  import { type BoardDefData, type BoardState, Board, type BoardDelta } from '~/lib/store';
  import { getStoreContext } from '~/lib/context';
  import { nav } from '~/lib/routes';

  import BoardEditorPlain, { type EditableBoardState } from './BoardEditorPlain.svelte';
  import LoadingIndicator from '~/shared/LoadingIndicator.svelte';

  const store = getStoreContext();
  export let defHash: Uint8Array = null;
  export let boardHash: Uint8Array = null;

  // There is essentially 3 possible uses for this component
  // - Creating a new Game Type
  // - Editing a Game Type
  // - Editing a Game
  // This component takes care of picking the loading and saving mechanism that is different for each

  let uiState = {
    saving: false,
    canDelete: false,
    canArchive: false,
  };
  let boardState: EditableBoardState;
  let boardDef: BoardDefData;
  let board: Board;

  // Mounting the board data for editing
  $: (async () => {
    // EDIT GAME TYPE
    if (defHash) {
      let boardDef2 = await toPromise(store.defs.get(defHash));
      const boardState2 = boardDef2.board;

      boardDef = boardDef2;
      board = null;
      boardState = {
        name: boardState2.name,
        min_players: boardState2.min_players,
        max_players: boardState2.max_players,
        turns: boardState2.turns,
        playerPieces: boardState2.playerPieces,
        pieceDefs: boardState2.pieceDefs,
        props: {
          bgUrl: boardState2.props.bgUrl,
          bgHeight: boardState2.props.bgHeight,
          bgWidth: boardState2.props.bgWidth,
        },
      };
      uiState.canArchive = false;
      uiState.canDelete = false;
      // EDIT BOARD
    } else if (boardHash) {
      const board2 = await store.boardList.getBoard(boardHash);
      const boardState2 = board2.state();
      const isSteward = await toPromise(store.agentIsSteward);

      boardDef = null;
      board = board2;
      boardState = {
        name: boardState2.name,
        min_players: boardState2.min_players,
        max_players: boardState2.max_players,
        turns: boardState2.turns,
        playerPieces: boardState2.playerPieces,
        pieceDefs: cloneDeep(boardState2.pieceDefs),
        props: {
          bgUrl: boardState2.props.bgUrl,
          bgHeight: boardState2.props.bgHeight,
          bgWidth: boardState2.props.bgWidth,
        },
      };
      uiState.canArchive = true;
      uiState.canDelete = boardState2.creator === store.myAgentPubKeyB64 || isSteward;
      // NEW GAME
    } else {
      boardDef = null;
      board = null;
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
      uiState.canArchive = false;
      uiState.canDelete = false;
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

  function toBoardDeltas({
    name,
    turns,
    playerPieces,
    min_players,
    max_players,
    props,
    pieceDefs,
  }: EditableBoardState): BoardDelta[] {
    const changes: BoardDelta[] = [];
    const state = board.state();
    const mergedProps = { ...state.props, ...props };

    if (state.name != name) {
      changes.push({ type: 'set-name', name });
    }
    if (state.turns != turns) {
      changes.push({ type: 'set-turns', turns });
    }
    if (state.playerPieces != playerPieces) {
      changes.push({ type: 'set-player-pieces', playerPieces });
    }
    if (min_players != state.min_players || max_players != state.max_players) {
      changes.push({ type: 'set-player-range', min_players, max_players });
    }
    if (!isEqual(mergedProps, state.props)) {
      changes.push({ type: 'set-props', props: mergedProps });
    }
    if (!isEqual(pieceDefs, state.pieceDefs)) {
      changes.push({ type: 'set-piece-defs', pieceDefs });
    }

    return changes;
  }

  // Buttons handling

  async function handleSave(newBoardState: EditableBoardState) {
    uiState.saving = true;
    if (boardDef) {
      await store.client.updateBoardDef(
        boardDef.originalHash,
        boardDef.record.actionHash,
        toUpdatedBoardState(newBoardState),
      );
      nav({ id: 'home' });
    } else if (board) {
      const changes = toBoardDeltas(newBoardState);
      if (changes.length > 0) {
        console.log('Updating board!', changes);
        board.requestChanges(changes);
      }
      nav({ id: 'board', boardHash });
    } else {
      await store.makeGameType(toNewBoardState(newBoardState));
      nav({ id: 'home' });
    }

    uiState.saving = false;
  }

  async function handleDelete() {
    if (uiState.canDelete) {
      store.boardList.deleteBoard(boardHash);
      nav({ id: 'home' });
    }
  }

  async function handleExport() {}

  async function handleArchive() {
    if (uiState.canArchive) {
      store.boardList.archiveBoard(boardHash);
      nav({ id: 'home' });
    }
  }
</script>

{#if boardState}
  <BoardEditorPlain
    board={boardState}
    canDelete={uiState.canDelete}
    canArchive={uiState.canArchive}
    onSave={handleSave}
    onDelete={handleDelete}
    onArchive={handleArchive}
    onExport={handleExport}
    disabled={uiState.saving}
  />
{:else}
  <LoadingIndicator class="pt80" />
{/if}
