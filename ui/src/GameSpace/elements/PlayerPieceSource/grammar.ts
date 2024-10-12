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

export const applyDelta = (delta: Delta, status: GameSpace) => {
  switch (delta.type) {
    case 'remove-element': {
      forEachPieceSourceContainingElement(status, delta.uuid, (ps) => {
        ps.createdPieces = ps.createdPieces.filter((p) => p !== delta.uuid);
      });
      break;
    }
  }
};
