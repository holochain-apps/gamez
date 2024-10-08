<script lang="ts">
  import { cloneDeep, isEqual } from 'lodash';
  import sanitize from 'sanitize-filename';

  import { toPromise } from '@holochain-open-dev/stores';

  import { type BoardDefData, type BoardState, Board, type BoardDelta } from '~/lib/store';
  import { getStoreContext } from '~/lib/context';
  import { nav } from '~/lib/routes';
  import LoadingIndicator from '~/shared/LoadingIndicator.svelte';
  import download from '~/lib/download';

  import BoardEditorPlain, { type EditableBoardState } from './BoardEditorPlain.svelte';

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
    isValid: false,
  };
  let boardState: EditableBoardState;
  let boardDef: BoardDefData;
  let board: Board;

  // Mounting the board data for editing
  $: (async () => {
    if (defHash) {
      await initOnEditGameType();
    } else if (boardHash) {
      await initOnEditGame();
    } else {
      await initOnNewGameType();
    }
  })();

  async function initOnNewGameType() {
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
        pieces: {},
      },
    };
    uiState.canArchive = false;
    uiState.canDelete = false;
  }

  async function initOnEditGameType() {
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
        pieces: boardState2.props.pieces,
      },
    };
    uiState.canArchive = false;
    uiState.canDelete = false;
  }

  async function initOnEditGame() {
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
        pieces: cloneDeep(boardState2.props.pieces),
      },
    };
    uiState.canArchive = true;
    uiState.canDelete = boardState2.creator === store.myAgentPubKeyB64 || isSteward;
  }

  // BUTTONS ACTIONS

  async function handleSave(newBoardState: EditableBoardState) {
    uiState.saving = true;
    if (boardDef) {
      handleSaveOnEditGameType(newBoardState);
    } else if (board) {
      handleSaveOnEditGame(newBoardState);
    } else {
      handleSaveOnNewGameType(newBoardState);
    }

    uiState.saving = false;
  }

  async function handleSaveOnNewGameType(newBoardState: EditableBoardState) {
    const finalBoardState = generateBoardStateFromNew(newBoardState);

    await store.makeGameType(finalBoardState);
    nav({ id: 'home' });
  }

  function generateBoardStateFromNew(newBoardState: EditableBoardState): BoardState {
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

  async function handleSaveOnEditGameType(newBoardState: EditableBoardState) {
    if (!boardDef) throw 'Expected boardDef to be defined';

    const finalBoardState = generateBoardStateFromBase(newBoardState, boardDef.board);

    await store.client.updateBoardDef(
      boardDef.originalHash,
      boardDef.record.actionHash,
      finalBoardState,
    );
    nav({ id: 'home' });
  }

  function generateBoardStateFromBase(
    newBoardState: EditableBoardState,
    baseBoardDef: BoardState,
  ): BoardState {
    return {
      ...baseBoardDef,
      ...newBoardState,
      props: {
        ...baseBoardDef.props,
        ...newBoardState.props,
      },
    };
  }

  function handleSaveOnEditGame(newBoardState: EditableBoardState) {
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

    const changes = toBoardDeltas(newBoardState);
    if (changes.length > 0) {
      console.log('Updating board!', changes);
      board.requestChanges(changes);
    }
    nav({ id: 'board', boardHash });
  }

  async function handleDelete() {
    if (uiState.canDelete) {
      store.boardList.deleteBoard(boardHash);
      nav({ id: 'home' });
    }
  }

  function generateFinalBoardState(newBoardState: EditableBoardState) {
    return boardDef || board
      ? generateBoardStateFromBase(newBoardState, boardDef?.board ?? board?.state())
      : generateBoardStateFromNew(newBoardState);
  }

  async function handleExport(newBoardState: EditableBoardState) {
    const finalBoardState = generateFinalBoardState(newBoardState);
    const prefix = 'gamez';
    const fileName = sanitize(`${prefix}_export_${finalBoardState.name}.json`);
    download(fileName, JSON.stringify(finalBoardState));
    alert(`Your board was exported to your Downloads folder as: '${fileName}'`);
  }

  async function handleArchive() {
    if (uiState.canArchive) {
      store.boardList.archiveBoard(boardHash);
      nav({ id: 'home' });
    }
  }

  let stagingBoardState: BoardState;
  $: stagingBoardState = boardState ? generateFinalBoardState(boardState) : null;
  function handleChange(newBoardState: EditableBoardState) {
    stagingBoardState = generateFinalBoardState(newBoardState);
  }

  $: uiState.isValid = (() => {
    const S = stagingBoardState;
    if (!S) return false;
    if (!S.name) return false;
    if (!S.props.bgUrl) return false;
    if (!S.min_players || !S.max_players) return false;
    if (S.min_players < 1) return false;
    if (S.max_players - S.min_players < 0) return false;
    return true;
  })();
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
    onChange={handleChange}
    disabled={uiState.saving}
    isValid={uiState.isValid}
  />
{:else}
  <LoadingIndicator class="pt80" />
{/if}
