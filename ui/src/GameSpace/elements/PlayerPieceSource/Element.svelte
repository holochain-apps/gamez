<script lang="ts">
  import cx from 'classnames';
  import Portal from 'svelte-portal';
  import { v1 as uuidv1 } from 'uuid';
  import PlayerName from '~/shared/PlayerName.svelte';
  import { type GameSpaceSyn } from '../../store/GameSpaceSyn';
  import type { PlayerPieceSourceElement } from './type';
  import { Element as PlayerPieceEl, type ElType as PlayerPieceType } from '../PlayerPiece';

  export let gameSpace: GameSpaceSyn;
  export let el: PlayerPieceSourceElement;
  let klass: string = '';
  export { klass as class };

  $: state = gameSpace.state;
  $: elements = $state.elements;
  let playedPiecesCountByAgent: { [key: string]: number } = {};
  let prevCreatedPieces: string[] = [];
  $: {
    if (el.createdPieces !== prevCreatedPieces) {
      const result: { [key: string]: number } = {};
      el.createdPieces.forEach((pieceUuid) => {
        const piece = elements.find((e) => e.uuid === pieceUuid) as PlayerPieceType;
        if (piece) {
          if (!result[piece.agent]) {
            result[piece.agent] = 0;
          }
          result[piece.agent]++;
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
            const { width } = ref.getBoundingClientRect();
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

  $: playerColor = (i: number) => {
    if (i === -1) return '';
    const hue = (i / $state.players.length) * 360;
    return `hsl(${hue}, 60%, 50%)`;
  };

  type DragState = { agent: string; x: number; y: number } | null;
  let dragState: DragState = null;
  function handleDragStart(ev: MouseEvent, agent: string) {
    ev.stopPropagation();
    ev.preventDefault();
    dragState = { agent, x: ev.clientX, y: ev.clientY };

    function handleMouseMoving(e: MouseEvent) {
      const x = e.clientX;
      const y = e.clientY;
      dragState = { ...dragState, x, y };
    }

    function handleMouseUp() {
      const surfacePos = gameSpace.getSurfaceCoordinates(dragState.x, dragState.y);
      if (surfacePos) {
        const colorRing = playerColor($state.players.indexOf(dragState.agent));
        handleAddPiece(surfacePos, dragState.agent, colorRing);
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

  async function handleAddPiece(pos: { x: number; y: number }, agent: string, colorRing: string) {
    const newEl: PlayerPieceType = {
      type: 'PlayerPiece' as 'PlayerPiece',
      version: 2 as 2,
      width: el.size,
      height: el.size,
      x: pos.x,
      y: pos.y,
      z: gameSpace.topZ(),
      rotation: 0,
      agent: agent,
      colorRing: colorRing,
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
</script>

<div class={cx(klass, 'h-full w-full bg-main-900 rounded-md p2')}>
  {#if $state.players.length === 0}
    <div class="opacity-70 flexcc h-full w-full">No players</div>
  {/if}
  <div
    class={cx(`w-full grid gap-2`, {
      'grid-cols-[auto_1fr]': el.showNames,
      'grid-cols-1': !el.showNames,
    })}
  >
    {#each $state.players as player, i}
      {#if el.showNames}
        <div class="flexce text-xs">
          <PlayerName agentPubKey={player} />
        </div>
      {/if}
      <div
        class="flexcs min-w-0 overflow-hidden cursor-grab"
        draggable={true}
        on:dragstart={(ev) => handleDragStart(ev, player)}
        bind:this={piecesContainer[i]}
      >
        <div class="flex">
          {#each { length: el.limit || 1 } as _, j}
            {@const isPlayed = el.limit
              ? playedPiecesCountByAgent[player] +
                  (dragState && dragState.agent === player ? 1 : 0) >=
                el.limit - j
              : false}
            <div
              class={cx(`block overlap mr.5 last:mr0 relative`, {
                'saturate-0 opacity-50': isPlayed,
              })}
              style={j > 0 ? `margin-left: var(--overlap); z-index: ${10 + j}` : ''}
            >
              <PlayerPieceEl
                el={{
                  width: el.size,
                  height: el.size,
                  agent: player,
                  colorRing: el.colorCoded ? playerColor(i) : '',
                }}
              />
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

{#if dragState}
  {@const colorRing = playerColor($state.players.indexOf(dragState.agent))}
  <Portal target="body">
    <div class="fixed z-100 top-0 left-0">
      <PlayerPieceEl
        class="inline-block fixed z-100 cursor-grabbing"
        style={`transform: translate(${dragState.x - el.size / 2}px, ${dragState.y - el.size / 2}px);`}
        el={{ width: el.size, height: el.size, agent: dragState.agent, colorRing }}
      />
    </div>
  </Portal>
{/if}
