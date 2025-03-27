<script lang="ts">
  import cx from 'classnames';
  import Portal from 'svelte-portal';
  import { v1 as uuidv1 } from 'uuid';

  import AgentName from '~/shared/AgentName.svelte';
  import { getGSS } from '~/store';

  import SpaceBox from '~/GameSpace/SpaceBox.svelte';
  import { Element as PlayerPieceEl, type ElType as PlayerPieceType } from '../PlayerPiece';
  import type { PlayerPieceSourceElement } from './type';

  export let el: PlayerPieceSourceElement;

  const GSS = getGSS();

  let klass: string = '';
  export { klass as class };

  $: GS = GSS.state;
  $: elements = $GS.elements;
  $: mode = GSS.mode;
  $: playMode = $mode === 'play';

  $: vp = GSS.vp;
  $: zoomLevel = $vp.zoom;

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
      });
      playedPiecesCountByAgent = result;
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

  type DragState = { playerSlotIndex: number; x: number; y: number; z: number } | null;
  let dragState: DragState = null;
  $: dragElBox = dragState
    ? $vp.boxCenteredAt($vp.screenToSpace(dragState), { w: el.size, h: el.size })
    : null;
  function handleMouseDown(ev: MouseEvent, playerSlotIndex: number) {
    if (ev.button !== 0) return;
    ev.stopPropagation();
    ev.preventDefault();
    if (!playMode) return;
    dragState = { playerSlotIndex, x: ev.clientX, y: ev.clientY, z: GSS.topZ() };

    function handleMouseMoving(e: MouseEvent) {
      const x = e.clientX;
      const y = e.clientY;
      dragState = { ...dragState, x, y };
    }

    function handleMouseUp() {
      if ($vp.isWithinContainer(dragState)) {
        const spacePos = $vp.screenToSpace(dragState);
        handleAddPiece(spacePos, dragState.playerSlotIndex);
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
      width: dragElBox.h,
      height: dragElBox.w,
      x: dragElBox.x,
      y: dragElBox.y,
      z: GSS.topZ(),
      rotation: 0,
      playerSlot: playerSlotIndex,
      wals: [],
      can: {
        move: true,
        resize: false,
        rotate: false,
        attach: true,
        configurate: false,
        remove: true,
        duplicate: false,
      },
      uuid: uuidv1(),
    };
    await GSS.change([
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

  function toPieceEl(slot: number) {
    return { width: el.size, height: el.size, playerSlot: slot };
  }

  $: everythingEmpty = el.showEmptyPlayersSlots
    ? false
    : $GS.playersSlots.filter((slot) => slot.pubKey).length === 0;
</script>

<div class={cx(klass, 'size-full b-4 b-yellow-8 b-b-8 rounded-lg')}>
  <div
    class={cx(klass, 'relative size-full bg-blue-9 py1 px1 shadow-[inset_0_3px_8px_3px_#0003] ')}
  >
    <div
      class={cx(`w-full grid gap-x-2`, {
        'grid-cols-[auto_1fr]': el.showNames,
        'grid-cols-1': !el.showNames,
      })}
    >
      {#if !everythingEmpty}
        {#each $GS.playersSlots as playerSlot, i}
          {@const playerPubKey = playerSlot.pubKey}
          {@const hasPiecesLeft = el.limit
            ? el.limit - (playedPiecesCountByAgent[i] || 0) > 0
            : true}
          {@const ownPieces = playerPubKey === GSS.pubKey}
          {@const isAllowedToGrab =
            hasPiecesLeft &&
            ((ownPieces && el.canOnlyPickOwnPiece) || !el.canOnlyPickOwnPiece) &&
            playMode}
          {#if el.showEmptyPlayersSlots || playerPubKey}
            {#if el.showNames}
              <div class="flexce text-xs text-white/80!">
                {#if playerPubKey}
                  <AgentName pubKey={playerPubKey} />
                {:else}
                  Player {i + 1}
                {/if}
              </div>
            {/if}
            <div
              class={cx('flexcs min-w-0 overflow-hidden py1 px1 b-1', {
                'cursor-grab hover:bg-white/10 rounded-md b-dashed b-white/25': isAllowedToGrab,
                'cursor-default b-transparent': !isAllowedToGrab,
              })}
              on:mousedown={(ev) =>
                isAllowedToGrab
                  ? handleMouseDown(ev, i)
                  : (ev.stopPropagation(), ev.preventDefault())}
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
                    class={cx(`block overlap mr.5 last:mr0 relative `, {
                      'saturate-0': isPlayed,
                    })}
                    draggable={false}
                    style={(j > 0 ? `margin-left: var(--overlap);` : '') + `z-index: ${10 + j}`}
                  >
                    <PlayerPieceEl el={toPieceEl(i)} />
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      {:else}
        <div class="text-white/80 text-center flexcc flex-col p1 text-sm">
          <div class="b-b b-white/30 pb1 mb1">Player pieces source</div>
          <div>No players</div>
        </div>
      {/if}
    </div>
  </div>
</div>

{#if dragState}
  <Portal target="#surface-portal">
    <SpaceBox box={dragElBox} z={dragState.z}>
      <PlayerPieceEl el={toPieceEl(dragState.playerSlotIndex)} />
    </SpaceBox>
  </Portal>
{/if}
