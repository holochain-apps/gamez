<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import type { GamezStore } from '../store';
  import {
    type BoardState,
    PieceDef,
    PieceType,
    Board,
    type Piece,
    type BoardProps,
  } from '../board';
  import EditBoardDialog from '../Home/EditBoardDialog.svelte';
  import Avatar from '../Avatar.svelte';
  import AttachmentsDialog from '../AttachmentsDialog.svelte';
  import { cloneDeep } from 'lodash';
  import sanitize from 'sanitize-filename';
  import SvgIcon from '../SvgIcon.svelte';
  import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
  import { decodeHashFromBase64 } from '@holochain/client';
  import { isWeContext, weaveUrlFromWal, type WAL } from '@lightningrodlabs/we-applet';
  import AttachmentsList from '../AttachmentsList.svelte';
  import WalSpace from '../WalSpace.svelte';
  import { type AssetSpec } from '../util';
  import PieceEl, { PLAYER_PIECE_SIZE } from './Piece.svelte';
  import PlayerName from '../PlayerName.svelte';
  import TopBar from './TopBar.svelte';
  import PlayersBar from './PlayersBar.svelte';

  const MAX_PLAYERS_IN_HEADER = 5;
  const EMPTY_IMAGE = new Image(1, 1);
  EMPTY_IMAGE.src =
    'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

  const { getStore }: any = getContext('gzStore');
  let store: GamezStore = getStore();
  export let activeBoard: Board;
  export let standAlone = false;
  let selectedCommitHash;
  let editBoardDialog;

  $: activeHash = store.boardList.activeBoardHash;
  $: state = activeBoard.readableState();
  $: pieces = $state ? Object.values($state.props.pieces) : undefined;
  $: pieceDefs = $state ? getPieceDefs($state.pieceDefs) : undefined;
  $: attachments = $state ? $state.props.attachments : undefined;
  $: myAgentPubKeyB64 = store.myAgentPubKeyB64;
  $: participants = activeBoard.participants();

  // ██╗   ██╗████████╗██╗██╗     ███████╗
  // ██║   ██║╚══██╔══╝██║██║     ██╔════╝
  // ██║   ██║   ██║   ██║██║     ███████╗
  // ██║   ██║   ██║   ██║██║     ╚════██║
  // ╚██████╔╝   ██║   ██║███████╗███████║
  //  ╚═════╝    ╚═╝   ╚═╝╚══════╝╚══════╝

  const download = (filename: string, text: string) => {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };

  const exportBoard = (state: BoardState) => {
    const prefix = 'gamez';
    const fileName = sanitize(`${prefix}_export_${state.name}.json`);
    download(fileName, JSON.stringify(state));
    alert(`Your board was exported to your Downloads folder as: '${fileName}'`);
  };

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

  const getPieceDefs = (defs: Array<PieceDef>) => {
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

  onMount(async () => {
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
  });

  let showEmbed = false;
  let embedsEditable = false;

  const toggleEmbedsEditable = () => {
    embedsEditable = !embedsEditable;
    walSpace.setEditable(embedsEditable);
  };

  const toggleShowEmbed = () => {
    showEmbed = !showEmbed;
  };

  let attachmentsDialog: AttachmentsDialog;
  function editPieceAttachments(piece: Piece) {
    if (isWeContext()) attachmentsDialog.open(piece);
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

  const copyWALToClipboard = () => {
    const attachment: WAL = {
      hrl: [store.dnaHash, activeBoard.hash],
      context: {},
    };
    store.weaveClient?.walToPocket(attachment);
  };

  // ██████╗ ██████╗  █████╗  ██████╗  ██████╗ ██╗███╗   ██╗ ██████╗
  // ██╔══██╗██╔══██╗██╔══██╗██╔════╝ ██╔════╝ ██║████╗  ██║██╔════╝
  // ██║  ██║██████╔╝███████║██║  ███╗██║  ███╗██║██╔██╗ ██║██║  ███╗
  // ██║  ██║██╔══██╗██╔══██║██║   ██║██║   ██║██║██║╚██╗██║██║   ██║
  // ██████╔╝██║  ██║██║  ██║╚██████╔╝╚██████╔╝██║██║ ╚████║╚██████╔╝
  // ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝

  let dragState:
    | null
    | {
        type: 'add';
        offsetX: number;
        offsetY: number;
        pieceTypeId: string;
      }
    | {
        type: 'move';
        offsetX: number;
        offsetY: number;
        pieceId: string;
      } = null;

  let dragImageEl: HTMLDivElement;
  const root = document.getElementById('root');
  function handleDragStart(e: DragEvent, dragType: 'add' | 'move', id: string) {
    const currentTarget = e.currentTarget as HTMLDivElement;
    const bounds = currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - bounds.left;
    const offsetY = e.clientY - bounds.top;

    let dragOffsetX, dragOffsetY: number;
    let dragImageZoom: number;
    if (dragType === 'move') {
      dragState = {
        type: 'move',
        offsetX,
        offsetY,
        pieceId: id,
      };
      dragOffsetX = dragState.offsetX / zoom;
      dragOffsetY = dragState.offsetY / zoom;
      dragImageZoom = zoom;
    } else if (dragType === 'add') {
      dragState = {
        type: 'add',
        offsetX,
        offsetY,
        pieceTypeId: id,
      };
      dragOffsetX = dragState.offsetX / zoom;
      dragOffsetY = dragState.offsetY / zoom;
      dragImageZoom = 1;
    }

    dragImageEl = currentTarget.cloneNode(true) as HTMLDivElement;
    dragImageEl.style.top = '0';
    dragImageEl.style.left = '0';
    dragImageEl.style.zIndex = '9999';
    dragImageEl.style.position = 'absolute';
    dragImageEl.style.pointerEvents = 'none';
    dragImageEl.style.transform = `translate(-${dragOffsetX + e.clientX}px, -${dragOffsetY + e.clientY}px) scale(${zoom})`;
    dragImageEl.style.transformOrigin = `${dragOffsetX}px ${dragOffsetY}px`;

    // Fixes Svelte not setting non-string custom properties on the element
    const agentAvatarEl = dragImageEl.querySelector('agent-avatar');
    // @ts-ignore
    if (agentAvatarEl) agentAvatarEl.setAttribute('size', PLAYER_PIECE_SIZE.toString());

    root.appendChild(dragImageEl);

    e.dataTransfer.setDragImage(EMPTY_IMAGE, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: DragEvent, el: 'source' | 'board') {
    e.preventDefault();
    if (!dragState) return;
    const resolvedOffsetX = dragState.offsetX / zoom;
    const resolvedOffsetY = dragState.offsetY / zoom;
    const resolvedZoom = el === 'source' ? 1 : zoom;
    dragImageEl.style.transform = `translate(${-resolvedOffsetX + e.clientX}px, ${-resolvedOffsetY + e.clientY}px) scale(${resolvedZoom})`;
    dragImageEl.style.transformOrigin = `${resolvedOffsetX}px ${resolvedOffsetY}px`;
  }

  function handleDragDrop(e: DragEvent) {
    e.preventDefault();
    if (!dragState) {
      return;
    }

    const [canvasX, canvasY] = screenToCanvasPos(e);
    const [boardX, boardY] = canvasToBoardPos([
      canvasX - dragState.offsetX,
      canvasY - dragState.offsetY,
    ]);

    if (dragState.type === 'move') {
      activeBoard.requestChanges([
        {
          type: 'move-piece',
          id: dragState.pieceId,
          x: boardX,
          y: boardY,
        },
      ]);
    } else if (dragState.type === 'add') {
      activeBoard.requestChanges([
        {
          type: 'add-piece',
          pieceType: dragState.pieceTypeId,
          imageIdx: 0,
          x: boardX,
          y: boardY,
          attachments: [],
        },
      ]);
    }

    handleDragEnd();
  }

  function handleDragEnd() {
    dragState = null;
    if (dragImageEl) {
      dragImageEl.remove();
      dragImageEl = null;
    }
  }

  const DEFAULT_BOARD_IMG =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chessboard_green_squares.svg/512px-Chessboard_green_squares.svg.png';

  $: bgUrl = $state.props && $state.props.bgUrl ? $state.props.bgUrl : DEFAULT_BOARD_IMG;

  // ███████╗ ██████╗  ██████╗ ███╗   ███╗     █████╗ ███╗   ██╗██████╗     ██████╗  █████╗ ███╗   ██╗
  // ╚══███╔╝██╔═══██╗██╔═══██╗████╗ ████║    ██╔══██╗████╗  ██║██╔══██╗    ██╔══██╗██╔══██╗████╗  ██║
  //   ███╔╝ ██║   ██║██║   ██║██╔████╔██║    ███████║██╔██╗ ██║██║  ██║    ██████╔╝███████║██╔██╗ ██║
  //  ███╔╝  ██║   ██║██║   ██║██║╚██╔╝██║    ██╔══██║██║╚██╗██║██║  ██║    ██╔═══╝ ██╔══██║██║╚██╗██║
  // ███████╗╚██████╔╝╚██████╔╝██║ ╚═╝ ██║    ██║  ██║██║ ╚████║██████╔╝    ██║     ██║  ██║██║ ╚████║
  // ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝     ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝

  const maxZoom = 4; // x4 the original size
  const minZoom = 0.5;
  const zoomStep = 0.001; // % zoomed for each deltaY
  let boardContainer: HTMLDivElement;
  let zoom = 1; // From 1 to maxZoom
  let panX = 0;
  let panY = 0;
  let isPanning = false;

  const handleZoomInOut = (ev: WheelEvent) => {
    const prevZoom = zoom;
    zoom += ev.deltaY * zoomStep;
    if (zoom < minZoom) zoom = minZoom;
    if (zoom > maxZoom) zoom = maxZoom;
    const zoomDelta = 1 - zoom / prevZoom;
    if (zoomDelta !== 0) {
      const screenPos = screenToCanvasPos(ev);
      panX += (screenPos[0] * zoomDelta) / zoom;
      panY += (screenPos[1] * zoomDelta) / zoom;
    }
  };

  const handlePanningStart = (ev: MouseEvent) => {
    if (shouldHandlePanning(ev.target as HTMLElement)) {
      isPanning = true;
      const [panInitialX, panInitialY] = [panX, panY];
      const [panStartX, panStartY] = screenToCanvasPos(ev);

      window.document.addEventListener('mousemove', handleMouseMove);
      window.document.addEventListener('mouseup', handleMouseUp);

      function handleMouseMove(ev: MouseEvent) {
        const [currentX, currentY] = screenToCanvasPos(ev);

        const deltaX = currentX - panStartX;
        const deltaY = currentY - panStartY;

        panX = panInitialX + deltaX / zoom;
        panY = panInitialY + deltaY / zoom;
      }

      function handleMouseUp() {
        isPanning = false;
        window.document.removeEventListener('mousemove', handleMouseMove);
        window.document.removeEventListener('mouseup', handleMouseUp);
      }
    }
  };

  function shouldHandlePanning(mouseDownTarget: HTMLElement): boolean {
    if (mouseDownTarget === boardContainer) return true;

    if (mouseDownTarget.draggable) {
      return false;
    } else {
      if (mouseDownTarget.parentElement) {
        return shouldHandlePanning(mouseDownTarget.parentElement);
      } else {
        return false;
      }
    }
  }

  function screenToCanvasPos(ev: { clientX: number; clientY: number }) {
    const imgBox = boardContainer.getBoundingClientRect();
    const relativeX = ev.clientX - imgBox.left;
    const relativeY = ev.clientY - imgBox.top;
    return [relativeX, relativeY] as [number, number];
  }

  function canvasToBoardPos([x, y]: [number, number]) {
    return [x / zoom - panX, y / zoom - panY] as [number, number];
  }
</script>

<div>
  <EditBoardDialog bind:this={editBoardDialog}></EditBoardDialog>
  <TopBar
    showAddToPocket={!!store.weaveClient}
    attachments={$state.boundTo}
    {standAlone}
    participants={$participants ? Array.from($participants.entries()) : null}
    myAgentPubKey={store.myAgentPubKey}
    on:pocket={() => copyWALToClipboard()}
    on:export={() => exportBoard($state)}
    on:settings={() => editBoardDialog.open(cloneDeep($activeHash))}
    on:leave={() => closeBoard()}
  />
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
      isOnWeave={!!store.weaveClient}
      {attachments}
      {showEmbed}
      {embedsEditable}
      on:join={() => activeBoard.requestChanges([{ type: 'add-player', player: myAgentPubKeyB64 }])}
      on:end-turn={() => activeBoard.requestChanges([{ type: 'next-turn' }])}
      on:leave-game={() =>
        activeBoard.requestChanges([{ type: 'remove-player', player: myAgentPubKeyB64 }])}
      on:add-attachment={() => addAttachment()}
      on:remove-attachment={(e) => removeAttachment(e.detail)}
      on:toggle-show-embed={toggleShowEmbed}
      on:toggle-embeds-editable={toggleEmbedsEditable}
    />
    <!-- {#if $state.min_players}
      {@const playerCount = $state.props.players.length}
      <div class="board-header">
        {#if !$state.playerPieces || $state.turns}
          <h3>Players:</h3>
          <div style="display:flex; align-items:end; margin-left: 10px;">
            {#each $state.props.players as player, index}
              {@const thisPlayersTurn = $state.turns && index == ($state.props.turn | 0)}
              <div
                title={thisPlayersTurn ? 'This players turn!' : ''}
                style="display:flex;align-items:center;flex-direction:column;margin-right:10px"
              >
                {#if thisPlayersTurn}
                  <div class="my-turn"></div>
                {/if}
                <Avatar
                  agentPubKey={decodeHashFromBase64(player)}
                  namePosition="column"
                  size={25}
                  showNickname={playerCount < MAX_PLAYERS_IN_HEADER}
                  tooltip={playerCount < MAX_PLAYERS_IN_HEADER}
                />
              </div>
            {/each}
          </div>
        {/if}
        {#if canJoin($state)}
          <sl-button
            on:click={() => {
              activeBoard.requestChanges([
                {
                  type: 'add-player',
                  player: myAgentPubKeyB64,
                },
              ]);
            }}
          >
            Join Game
          </sl-button>
        {/if}
        {#if $state.props.players.length < $state.min_players}
          <span style="margin-left:10px"
            >Waiting for {$state.min_players - $state.props.players.length} player{$state.min_players -
              $state.props.players.length >
            1
              ? 's'
              : ''} to join</span
          >
        {:else if myTurn($state)}
          <sl-button
            style="margin-left: 30px"
            on:click={() => {
              activeBoard.requestChanges([
                {
                  type: 'next-turn',
                },
              ]);
            }}
          >
            End Turn
          </sl-button>
        {/if}
        {#if haveJoined($state)}
          <sl-button
            style="margin-left:10px"
            on:click={() => {
              activeBoard.requestChanges([
                {
                  type: 'remove-player',
                  player: myAgentPubKeyB64,
                },
              ]);
            }}
          >
            Leave Game
          </sl-button>
        {/if}
        {#if store.weaveClient}
          <div class="attachments-area">
            <sl-tooltip content="Attach assets">
              <sl-button size="small" variant="text" on:click={addAttachment}
                ><SvgIcon icon="addAsset" color="white"></SvgIcon></sl-button
              >
            </sl-tooltip>

            {#if attachments && attachments.length > 0 && typeof attachments[0] != 'string'}
              <AttachmentsList
                attachments={attachments.map((a) => a.weaveUrl)}
                allowDelete={true}
                on:remove-attachment={(e) => removeAttachment(e.detail)}
              />
              <sl-tooltip content={showEmbed ? 'Hide Asset Pane' : 'Show Asset Pane'}>
                <sl-button size="small" variant="text" on:click={toggleShowEmbed}
                  ><SvgIcon icon={showEmbed ? 'hide' : 'show'} color="white"></SvgIcon></sl-button
                >
              </sl-tooltip>
              {#if showEmbed}
                <sl-tooltip content={embedsEditable ? 'Save Changes' : 'Edit Asset Pane'}>
                  <sl-button variant="text" on:click={toggleEmbedsEditable}
                    ><SvgIcon icon={embedsEditable ? 'faCheck' : 'faEdit'} color="black"
                    ></SvgIcon></sl-button
                  >
                </sl-tooltip>
              {/if}
            {/if}
          </div>
        {/if}
      </div>
    {/if} -->

    <div class="board-area">
      <div class="piece-source" on:dragover={(ev) => handleDragOver(ev, 'source')}>
        <h3>{iCanPlay ? 'Add Piece:' : 'Pieces:'}</h3>
        {#each Object.values(pieceDefs) as p}
          <div style="display: flex; place-items: center end;">
            <div style="margin-right: 4px; flex-grow: 1; text-align: right;">
              {pieceDefs[p.id].name}
            </div>
            <PieceEl
              displayPiece={{ type: 'pieceDefPiece', pieceDef: p }}
              on:dragstart={(e) => handleDragStart(e, 'add', p.id)}
              on:dragend={handleDragEnd}
              on:drop={handleDragEnd}
              dragEnabled={iCanPlay}
            />
          </div>
        {/each}
        {#if $state.playerPieces}
          {#each $state.props.players as player, index}
            <div style="display: flex; place-items: center end;">
              <div style="margin-right: 4px; flex-grow: 1; text-align: right;">
                <PlayerName agentPubKey={decodeHashFromBase64(player)} />
              </div>
              <PieceEl
                displayPiece={{ type: 'pieceDefPlayer', id: player }}
                on:dragstart={(e) => handleDragStart(e, 'add', player)}
                on:dragend={handleDragEnd}
                on:drop={handleDragEnd}
                dragEnabled={iCanPlay}
              />
            </div>
          {/each}
        {/if}
      </div>
      <div
        class="img-container bg-main-400"
        bind:this={boardContainer}
        on:wheel={handleZoomInOut}
        on:mousedown={handlePanningStart}
        on:drop={handleDragDrop}
        on:dragover={(ev) => handleDragOver(ev, 'board')}
        style={`${isPanning ? 'cursor: move;' : ''} background-position: ${panX}px ${panY}px;`}
      >
        <AttachmentsDialog {activeBoard} bind:this={attachmentsDialog}></AttachmentsDialog>
        <div
          style={`
          height: 100%;
          width: 100%;
          transform:scale(${zoom}) translate(${panX}px, ${panY}px);
          transform-origin: top left;`}
        >
          {#each pieces as piece}
            <PieceEl
              on:dblclick={() => editPieceAttachments(piece)}
              on:dragstart={(e) => handleDragStart(e, 'move', piece.id)}
              on:dragend={handleDragEnd}
              on:drop={handleDragDrop}
              on:dragover={(ev) => handleDragOver(ev, 'board')}
              hidden={!!(dragState && dragState.type === 'move' && dragState.pieceId === piece.id)}
              displayPiece={{ type: 'piece', piece }}
              {pieceDefs}
              dragEnabled={iCanPlay}
            />
          {/each}
          <img
            alt="Board"
            width={$state.props.bgWidth}
            height={$state.props.bgHeight}
            draggable={false}
            src={bgUrl}
            class="max-w-none block p-[80px] bg-transparent b b-transparent object-cover"
          />
        </div>
      </div>
      {#if showEmbed}
        <div class="wal-space">
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
</div>

<style>
  .my-turn {
    z-index: 100;
    margin-right: 18px;
    margin-bottom: -10px;
    border-radius: 50%;
    width: 12px;
    height: 12px;
    background-color: rgb(139, 212, 30);
  }
  .board-area {
    justify-content: center;
    margin-top: 10px;
    display: flex;
    overflow: auto;
  }
  .piece-source {
    max-width: 100px;
    padding-right: 10px;
  }
  .img-container {
    border: solid 1px rgba(0, 0, 0, 0.25);
    position: relative;
    padding: 0px;
    overflow: hidden;
    border-radius: 4px;
    background-image: url('/noise20.png');
  }
  .img-container:before {
    content: ' ';
    position: absolute;
    inset: 0;
    z-index: 20;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }
  .wal-space {
    margin-left: 20px;
    margin-right: 10px;
    margin-bottom: 5px;
    flex-grow: 1;
  }

  .board {
    display: flex;
    flex-direction: column;
    background: transparent;
    border-radius: 3px;
    margin-left: 15px;
    margin-right: 15px;
    margin-top: 15px;
    min-height: 0;
    padding-bottom: 10px;
    border: solid 1px lightgray;
  }
  .top-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background-color: #cccccc99;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 3px;
    color: white;
  }
  .left-items {
    display: flex;
    align-items: center;
  }
  .right-items {
    display: flex;
    align-items: center;
  }
  .board-header {
    padding-top: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: solid 1px lightgray;
  }
  .attachments-area {
    border-left: solid 1px lightgray;
    padding-left: 10px;
    padding-bottom: 5px;
    display: flex;
    flex-direction: row;
    margin-left: 20px;
    align-items: center;
  }
  .piece-has-attachment {
    position: absolute;
    bottom: 0px;
    right: 0px;
    z-index: 10;
    font-size: 12px;
    font-weight: bold;
    color: blue;
    padding-right: 5px;
    padding-left: 5px;
    border-radius: 5px;
    background-color: rgba(0, 255, 0, 0.5);
  }
  .idle {
    opacity: 0.5;
  }
</style>
