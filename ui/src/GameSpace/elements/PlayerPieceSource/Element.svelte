<script lang="ts">
  import cx from 'classnames';
  import Portal from 'svelte-portal';
  import { v1 as uuidv1 } from 'uuid';

  import AgentName from '~/shared/AgentName.svelte';
  import { type GameSpaceSyn } from '~/store';

  import { Element as PlayerPieceEl, type ElType as PlayerPieceType } from '../PlayerPiece';
  import type { PlayerPieceSourceElement } from './type';
  import { derived } from 'svelte/store';

  export let gameSpace: GameSpaceSyn;
  export let el: PlayerPieceSourceElement;
  export let isLocked: boolean;
  let klass: string = '';
  export { klass as class };

  $: state = gameSpace.state;
  $: elements = $state.elements;

  $: ui = gameSpace.ui;
  $: zoomLevel = $ui.zoom;

  let playedPiecesCountByAgent: { [key: string]: number } = {};
  let prevCreatedPieces: string[] = [];
  $: {
    if (el.createdPieces !== prevCreatedPieces) {
      const result: { [key: number]: number } = {};
      el.createdPieces.forEach((pieceUuid) => {
        const piece = elements.find((e) => e.uuid === pieceUuid) as PlayerPieceType;
        if (piece) {
          if (!result[piece.playerSlot]) {
            result[piece.playerSlot] = 0;
          }
          result[piece.playerSlot]++;
        }
        playedPiecesCountByAgent = result;
      });
      prevCreatedPieces = el.createdPieces;
    }
  }

  // Overlap pieces to fit container width
  let piecesContainer: HTMLDivElement[] = [];
  let timeout: NodeJS.Timeout;
  $: {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      let overlapPieces = 0;
      if (el.limit < 2) {
        overlapPieces = 0;
      } else {
        if (el.width && el.height) {
          piecesContainer.forEach((el) => {
            if (el) {
              el.style.setProperty('--overlap', 0 + 'px');
            }
          });
          // Makes it reactive to the size of the container
          if (piecesContainer[0]) {
            const ref = piecesContainer[0];
            const scrollWidth = ref.scrollWidth;
            const width = ref.clientWidth;
            const diff = scrollWidth - width;
            if (diff > 0) {
              overlapPieces = diff / (el.limit - 1);
            }
          }
        }
      }
      piecesContainer.forEach((el) => {
        if (el) {
          el.style.setProperty('--overlap', -overlapPieces + 'px');
        }
      });
    }, 50);
  }

  type DragState = { playerSlotIndex: number; x: number; y: number } | null;
  let dragState: DragState = null;
  function handleDragStart(ev: MouseEvent, playerSlotIndex: number) {
    if (isLocked) return;
    ev.stopPropagation();
    ev.preventDefault();
    dragState = { playerSlotIndex, x: ev.clientX, y: ev.clientY };

    function handleMouseMoving(e: MouseEvent) {
      const x = e.clientX;
      const y = e.clientY;
      dragState = { ...dragState, x, y };
    }

    function handleMouseUp() {
      const surfacePos = gameSpace.getSurfaceCoordinates(dragState.x, dragState.y);
      if (surfacePos) {
        handleAddPiece(surfacePos, dragState.playerSlotIndex);
      }
      dragState = null;
      document.body.classList.remove('cursor-grabbing');
      window.document.removeEventListener('mousemove', handleMouseMoving);
      window.document.removeEventListener('mouseup', handleMouseUp);
    }

    window.document.addEventListener('mousemove', handleMouseMoving);
    window.document.addEventListener('mouseup', handleMouseUp);
    document.body.classList.add('cursor-grabbing');
  }

  async function handleAddPiece(pos: { x: number; y: number }, playerSlotIndex: number) {
    const newEl: PlayerPieceType = {
      type: 'PlayerPiece' as 'PlayerPiece',
      version: 3 as 3,
      width: el.size,
      height: el.size,
      x: pos.x,
      y: pos.y,
      z: gameSpace.topZ(),
      rotation: 0,
      playerSlot: playerSlotIndex,
      wals: [],
      lock: {
        position: false,
        size: false,
        rotation: false,
        wals: false,
        config: true,
        remove: false,
      },
      uuid: uuidv1(),
    };
    await gameSpace.change([
      { type: 'add-element', element: newEl },
      {
        type: 'update-element',
        element: {
          uuid: el.uuid,
          createdPieces: [...el.createdPieces, newEl.uuid],
        },
      },
    ]);
  }

  $: everythingEmpty = el.showEmptyPlayersSlots
    ? false
    : $state.playersSlots.filter((slot) => slot.pubKey).length === 0;
</script>

<div class={cx(klass, 'h-full w-full bg-main-900 rounded-md p2')}>
  {#if $state.playersSlots.length === 0}
    <div class="opacity-70 flexcc h-full w-full">No players</div>
  {/if}
  <div
    class={cx(`w-full grid gap-x-2`, {
      'grid-cols-[auto_1fr]': el.showNames,
      'grid-cols-1': !el.showNames,
    })}
  >
    {#if !everythingEmpty}
      {#each $state.playersSlots as playerSlot, i}
        {@const playerPubKey = playerSlot.pubKey}
        {@const hasPiecesLeft = el.limit ? el.limit - (playedPiecesCountByAgent[i] || 0) > 0 : true}
        {@const ownPieces = playerPubKey === gameSpace.pubKey}
        {@const isAllowedToGrab =
          hasPiecesLeft &&
          ((ownPieces && el.canOnlyPickOwnPiece) || !el.canOnlyPickOwnPiece) &&
          !isLocked}
        {#if el.showEmptyPlayersSlots || playerPubKey}
          {#if el.showNames}
            <div class="flexce text-xs">
              {#if playerPubKey}
                <AgentName pubKey={playerPubKey} />
              {:else}
                Player {i + 1}
              {/if}
            </div>
          {/if}
          <div
            class={cx('flexcs min-w-0 overflow-hidden py1.5', {
              'cursor-not-allowed': !isAllowedToGrab,
              'cursor-grab': isAllowedToGrab,
            })}
            draggable={true}
            on:dragstart={(ev) => (isAllowedToGrab ? handleDragStart(ev, i) : null)}
            bind:this={piecesContainer[i]}
          >
            <div class="flex">
              {#each { length: el.limit || 1 } as _, j}
                {@const isPlayed = el.limit
                  ? (playedPiecesCountByAgent[i] || 0) +
                      (dragState && dragState.playerSlotIndex === i ? 1 : 0) >=
                    el.limit - j
                  : false}
                <div
                  class={cx(`block overlap mr.5 last:mr0 relative`, {
                    'saturate-0': isPlayed,
                  })}
                  style={j > 0 ? `margin-left: var(--overlap); z-index: ${10 + j}` : ''}
                >
                  <PlayerPieceEl
                    {gameSpace}
                    el={{
                      width: el.size,
                      height: el.size,
                      playerSlot: i,
                    }}
                  />
                </div>
              {/each}
            </div>
          </div>
        {/if}
      {/each}
    {:else}
      <div class="text-black/50 text-center flexcc flex-col">
        <div class="b-b b-black/10 pb1 mb1">Player pieces source</div>
        <div>No players</div>
      </div>
    {/if}
  </div>
</div>

{#if dragState}
  <Portal target="body">
    <div class="fixed z-100 top-0 left-0">
      <PlayerPieceEl
        class="inline-block fixed z-100 cursor-grabbing"
        style={`transform: translate(${dragState.x - el.size / 2}px, ${dragState.y - el.size / 2}px) scale(${zoomLevel});`}
        {gameSpace}
        el={{ width: el.size, height: el.size, playerSlot: dragState.playerSlotIndex }}
      />
    </div>
  </Portal>
{/if}
