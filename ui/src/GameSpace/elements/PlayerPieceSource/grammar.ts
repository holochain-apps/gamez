import type { Delta } from '../../store/grammar';
import type { GameSpace } from '../../types';
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
  console.log('ARSNTENARSIETN');
  switch (delta.type) {
    case 'move-element': {
      console.log('ARSNTENARSIETN');
      const el = status.elements.find((e) => e.uuid === delta.uuid);
      if (el.type === 'PlayerPiece') {
        console.log('MMMM');
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
