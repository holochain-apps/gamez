import type { Delta, GameSpace } from '~/store';

import { type PlayerPieceElement } from '../PlayerPiece/type';
import type { PlayerPieceSourceElement } from './type';
import { playerColor } from './utils';

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

export const applyDelta = (delta: Delta, status: GameSpace) => {
  switch (delta.type) {
    case 'add-player':
    case 'remove-player':
      forEachPieceSource(status, (ps) => {
        ps.createdPieces.forEach((pieceUuid) => {
          const piece = status.elements.find((e) => e.uuid === pieceUuid) as PlayerPieceElement;
          if (piece) {
            const playerIndex = status.players.indexOf(piece.agent);
            piece.colorRing = playerColor(playerIndex, status.players.length);
          }
        });
      });
      break;
    case 'update-element':
      {
        const el = status.elements.find((e) => e.uuid === delta.element.uuid);
        if (el.type === 'PlayerPieceSource') {
          if (el.createdPieces.length === 0) return;
          const pieceSourceDelta = delta.element as Partial<PlayerPieceSourceElement>;

          status.elements.forEach((eachEl) => {
            if (el.createdPieces.indexOf(eachEl.uuid) !== -1) {
              const piece = eachEl as PlayerPieceElement;
              if (pieceSourceDelta.size) {
                piece.width = pieceSourceDelta.size;
                piece.height = pieceSourceDelta.size;
              }

              if (pieceSourceDelta.colorCoded !== undefined) {
                const playerIndex = status.players.indexOf(piece.agent);
                piece.colorRing = pieceSourceDelta.colorCoded
                  ? playerColor(playerIndex, status.players.length)
                  : '';
              }
            }
          });
        }
      }
      break;
    case 'move-element': {
      const el = status.elements.find((e) => e.uuid === delta.uuid);
      if (el.type === 'PlayerPiece') {
        forEachPieceSourceContainingElement(status, delta.uuid, (ps) => {
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
            const index = status.elements.findIndex((e) => e.uuid === el.uuid);
            status.elements.splice(index, 1);
          }
        });
      }
      break;
    }
    case 'remove-element': {
      forEachPieceSourceContainingElement(status, delta.uuid, (ps) => {
        ps.createdPieces = ps.createdPieces.filter((p) => p !== delta.uuid);
      });
      break;
    }
  }
};
