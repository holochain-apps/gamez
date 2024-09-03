<script lang="ts">
  import { cloneDeep } from 'lodash';
  import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';

  import { isWeContext, weaveUrlFromWal, type WAL } from '@lightningrodlabs/we-applet';

  import { PieceDef, Board, type Piece, type BoardProps } from '~/lib/store';
  import { getStoreContext } from '~/lib/context';
  import { type AssetSpec } from '~/lib/util';
  import { nav } from '~/lib/routes';
  import LoadingIndicator from '~/shared/LoadingIndicator.svelte';
  import GameBoard from '~/GameBoard';

  import PieceAttachmentDialog from './PieceAttachmentsDialog.svelte';
  import WalSpace from './WalSpace.svelte';
  import TopBar from './TopBar.svelte';
  import PlayersBar from './PlayersBar.svelte';
  import AttachmentsBar from './AttachmentsBar.svelte';

  const EMPTY_IMAGE = new Image(1, 1);
  EMPTY_IMAGE.src =
    'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

  const store = getStoreContext();
  export let boardHash: Uint8Array;
  export let activeBoard: Board;
  export let standAlone = false;
  let selectedCommitHash;

  $: myAgentPubKeyB64 = store.myAgentPubKeyB64;

  // Board state
  $: state = activeBoard.readableState();
  $: participants = activeBoard.participants();

  // Derived state
  $: attachments = $state ? $state.props.attachments : undefined;

  // ██╗   ██╗████████╗██╗██╗     ███████╗
  // ██║   ██║╚══██╔══╝██║██║     ██╔════╝
  // ██║   ██║   ██║   ██║██║     ███████╗
  // ██║   ██║   ██║   ██║██║     ╚════██║
  // ╚██████╔╝   ██║   ██║███████╗███████║
  //  ╚═════╝    ╚═╝   ╚═╝╚══════╝╚══════╝

  const canJoin = (state) => {
    return (
      state.props.players.length < state.max_players &&
      !state.props.players.includes(myAgentPubKeyB64)
    );
  };

  const haveJoined = (state) => {
    return state.props.players.includes(myAgentPubKeyB64);
  };

  const myTurn = (state) => {
    return state.turns && state.props.players[state.props.turn | 0] == myAgentPubKeyB64;
  };

  const canPlay = (state) => {
    return myTurn(state) || (!state.turns && haveJoined(state));
  };

  $: iCanPlay = canPlay($state);

  const piecesDefToMap = (defs: Array<PieceDef>) => {
    const pieceDefs: { [key: string]: PieceDef } = {};
    defs.forEach((d) => (pieceDefs[d.id] = d));
    return pieceDefs;
  };

  const closeBoard = async () => {
    await store.boardList.closeActiveBoard(false);
  };

  const leaveBoard = async () => {
    await store.boardList.closeActiveBoard(true);
  };

  //  █████╗ ████████╗████████╗ █████╗  ██████╗██╗  ██╗███╗   ███╗███████╗███╗   ██╗████████╗███████╗
  // ██╔══██╗╚══██╔══╝╚══██╔══╝██╔══██╗██╔════╝██║  ██║████╗ ████║██╔════╝████╗  ██║╚══██╔══╝██╔════╝
  // ███████║   ██║      ██║   ███████║██║     ███████║██╔████╔██║█████╗  ██╔██╗ ██║   ██║   ███████╗
  // ██╔══██║   ██║      ██║   ██╔══██║██║     ██╔══██║██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║
  // ██║  ██║   ██║      ██║   ██║  ██║╚██████╗██║  ██║██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   ███████║
  // ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝

  // Migrate plain strings attachments to AssetSpec
  $: {
    if (activeBoard && $state) {
      console.log('Running attachments migration');
      const props = cloneDeep($state.props) as BoardProps;

      const attachments = props.attachments;

      // backward compatibility check for when attachments were just strings
      if (attachments && attachments.length > 0 && typeof attachments[0] == 'string') {
        const assetSpecs = [];

        attachments.forEach((a, count) =>
          assetSpecs.push({
            embed: true,
            weaveUrl: a,
            position: { x: 50 * count, y: 20 * count },
            size: { width: 100, height: 100 },
          }),
        );

        props.attachments = assetSpecs;
        activeBoard.requestChanges([{ type: 'set-props', props }]);
      }
    }
  }

  let showEmbed = false;
  let embedsEditable = false;

  const toggleEmbedsEditable = () => {
    embedsEditable = !embedsEditable;
    walSpace.setEditable(embedsEditable);
  };

  const toggleShowEmbed = () => {
    showEmbed = !showEmbed;
  };

  let pieceAttachmentDialog: PieceAttachmentDialog;
  function handleEditPieceAttachment(piece: Piece) {
    if (isWeContext()) pieceAttachmentDialog.open(piece);
  }

  let walSpace: WalSpace;
  const addAttachment = async () => {
    const wal = await store.weaveClient.userSelectWal();
    if (wal) {
      const props = cloneDeep($state.props) as BoardProps;
      if (!props.attachments) {
        props.attachments = [];
      }
      const count = props.attachments.length;
      const asset: AssetSpec = {
        embed: true,
        weaveUrl: weaveUrlFromWal(wal),
        position: { x: 50 * count, y: 20 * count },
        size: { width: 100, height: 100 },
      };
      props.attachments.push(asset);
      activeBoard.requestChanges([{ type: 'set-props', props }]);
    }
  };

  const saveAttachments = async (assets: AssetSpec[]) => {
    const props = cloneDeep($state.props) as BoardProps;
    props.attachments = assets;
    activeBoard.requestChanges([{ type: 'set-props', props }]);
  };

  const removeAttachment = async (index: number) => {
    const props = cloneDeep($state.props);
    props.attachments.splice(index, 1);
    activeBoard.requestChanges([{ type: 'set-props', props }]);
  };

  $: dnaHash = store.dnaHash;
  const copyWALToClipboard = () => {
    if ($dnaHash.status === 'complete') {
      const attachment: WAL = {
        hrl: [$dnaHash.value, activeBoard.hash],
        context: {},
      };
      store.weaveClient?.walToPocket(attachment);
    } else {
      console.log('Clicke before DNA hash loaded');
    }
  };

  const DEFAULT_BOARD_IMG =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chessboard_green_squares.svg/512px-Chessboard_green_squares.svg.png';

  function handleMovePiece(pieceId: string, x: number, y: number) {
    activeBoard.requestChanges([{ type: 'move-piece', id: pieceId, x, y }]);
  }

  function handleAddPiece(pieceTypeId: string, x: number, y: number) {
    activeBoard.requestChanges([
      { type: 'add-piece', pieceType: pieceTypeId, x, y, attachments: [], imageIdx: 0 },
    ]);
  }
</script>

<div class="overflow-auto flex-grow bg-main-700 @dark:bg-main-300">
  {#if activeBoard}
    <TopBar
      showAddToPocket={!!store.weaveClient}
      attachments={$state.boundTo}
      participants={$participants ? Array.from($participants.entries()) : null}
      myAgentPubKey={store.myAgentPubKey}
      boardName={$state.name}
      {standAlone}
      on:pocket={() => copyWALToClipboard()}
      on:settings={() => nav({ id: 'editBoard', boardHash })}
      on:leave={() => leaveBoard()}
      on:add-attachment={() => addAttachment()}
    />

    {#if store.weaveClient}
      <AttachmentsBar
        boundTo={$state.boundTo}
        {attachments}
        {showEmbed}
        {embedsEditable}
        on:remove-attachment={(e) => removeAttachment(e.detail)}
        on:toggle-show-embed={toggleShowEmbed}
        on:toggle-embeds-editable={toggleEmbedsEditable}
      />
    {/if}

    {#if $state}
      <PlayersBar
        minPlayers={$state.min_players}
        players={$state.props.players}
        showPlayers={!$state.playerPieces}
        turnsEnabled={$state.turns}
        turn={$state.props.turn}
        canJoin={canJoin($state)}
        currentAgentIsPlaying={haveJoined($state)}
        isCurrentAgentTurn={myTurn($state)}
        on:join={() =>
          activeBoard.requestChanges([{ type: 'add-player', player: myAgentPubKeyB64 }])}
        on:end-turn={() => activeBoard.requestChanges([{ type: 'next-turn' }])}
        on:leave-game={() =>
          activeBoard.requestChanges([{ type: 'remove-player', player: myAgentPubKeyB64 }])}
      />

      <div class="flex-grow flex overflow-auto p2">
        <!-- BOARD -->
        <PieceAttachmentDialog {activeBoard} bind:this={pieceAttachmentDialog}
        ></PieceAttachmentDialog>
        <GameBoard
          pieces={$state.props.pieces}
          bgUrl={$state.props.bgUrl || DEFAULT_BOARD_IMG}
          bgWidth={$state.props.bgWidth}
          bgHeight={$state.props.bgHeight}
          piecesDefs={$state.pieceDefs}
          playerPieces={$state.playerPieces}
          dragPiecesEnabled={iCanPlay}
          onMovePiece={handleMovePiece}
          onAddPiece={handleAddPiece}
          onEditPieceAttachment={handleEditPieceAttachment}
          showPiecesSource={true}
          players={$state.props.players}
        />
        <!-- WAL SPACE -->
        {#if showEmbed}
          <div class="w160 ml4 flex-shrink-1">
            <WalSpace
              items={$state.props.attachments ? cloneDeep($state.props.attachments) : []}
              bind:this={walSpace}
              on:assets-edited={(e) => saveAttachments(e.detail)}
            ></WalSpace>
          </div>
        {/if}
      </div>
      <commit-history
        style="flex: 1"
        {selectedCommitHash}
        on:commit-selected={(e) => {
          selectedCommitHash = e.detail.commitHash;
        }}
      ></commit-history>
    {/if}
  {:else}
    <LoadingIndicator class="mt80" />
  {/if}
</div>
