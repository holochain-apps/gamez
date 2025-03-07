import type { Delta, GameSpace } from '~/store';

import { type PlayerPieceElement } from '../PlayerPiece/type';
import type { PlayerPieceSourceElement } from './type';

function forEachPieceSourceContainingElement(
  status: GameSpace,
  uuid: string,
  cb: (el: PlayerPieceSourceElement) => void,
) {
  const piecesSources = status.elements.filter((e) => e.type === 'PlayerPieceSource');
  piecesSources.forEach((ps) => {
    if (ps.createdPieces.includes(uuid)) {
      cb(ps);
    }
  });
}

function forEachPieceSource(status: GameSpace, cb: (el: PlayerPieceSourceElement) => void) {
  const piecesSources = status.elements.filter((e) => e.type === 'PlayerPieceSource');
  piecesSources.forEach((ps) => {
    cb(ps);
  });
}

function isWithinRectangle(
  pos: { x: number; y: number },
  x: number,
  y: number,
  width: number,
  height: number,
) {
  console.log('Checking', pos, x, y, width, height);
  return pos.x >= x && pos.x <= x + width && pos.y >= y && pos.y <= y + height;
}

export const applyDelta = (delta: Delta, $state: GameSpace) => {
  switch (delta.type) {
    case 'update-element':
      {
        const el = $state.elements.find((e) => e.uuid === delta.element.uuid);
        if (el?.type === 'PlayerPieceSource') {
          if (el.createdPieces.length === 0) return;
          const pieceSourceDelta = delta.element as Partial<PlayerPieceSourceElement>;

          $state.elements.forEach((eachEl) => {
            if (el.createdPieces.indexOf(eachEl.uuid) !== -1) {
              const piece = eachEl as PlayerPieceElement;
              if (pieceSourceDelta.size) {
                piece.width = pieceSourceDelta.size;
                piece.height = pieceSourceDelta.size;
              }
            }
          });
        }
      }
      break;
    case 'move-element': {
      const el = $state.elements.find((e) => e.uuid === delta.uuid);
      if (el?.type === 'PlayerPiece') {
        forEachPieceSourceContainingElement($state, delta.uuid, (ps) => {
          if (
            isWithinRectangle(
              { x: el.x, y: el.y },
              ps.x - ps.width / 2,
              ps.y - ps.height / 2,
              ps.width,
              ps.height,
            )
          ) {
            // Piece was dragged into piece source, delete it
            ps.createdPieces = ps.createdPieces.filter((p) => p !== el.uuid);
            const index = $state.elements.findIndex((e) => e.uuid === el.uuid);
            $state.elements.splice(index, 1);
          }
        });
      }
      break;
    }
    case 'remove-element': {
      forEachPieceSourceContainingElement($state, delta.uuid, (ps) => {
        ps.createdPieces = ps.createdPieces.filter((p) => p !== delta.uuid);
      });
      break;
    }
  }
};
