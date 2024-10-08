import { cloneDeep } from 'lodash';

import type { Delta } from '../../store/grammar';
import type { GameSpace } from '../../types';
import type { PieceElement } from '../Piece/type';
import type { PieceSourceElement } from './type';
import { isWithinVisualBoundary } from './utils';

function forEachPieceSourceContainingElement(
  status: GameSpace,
  uuid: string,
  cb: (el: PieceSourceElement) => void,
) {
  const piecesSources = status.elements.filter((e) => e.type === 'PieceSource');
  piecesSources.forEach((ps) => {
    if (ps.createdPieces.includes(uuid)) {
      cb(ps);
    }
  });
}

export const applyDelta = (delta: Delta, status: GameSpace) => {
  switch (delta.type) {
    case 'update-element':
      {
        const el = status.elements.find((e) => e.uuid === delta.element.uuid);
        if (el.type === 'PieceSource') {
          if (el.createdPieces.length === 0) return;
          const pieceSourceDelta = delta.element as Partial<PieceSourceElement>;
          const updates: Partial<PieceElement> = {};
          if (pieceSourceDelta.pieceW) updates.width = pieceSourceDelta.pieceW;
          if (pieceSourceDelta.pieceH) updates.height = pieceSourceDelta.pieceH;
          if (pieceSourceDelta.display) updates.display = cloneDeep(pieceSourceDelta.display);
          status.elements.forEach((eachEl) => {
            if (el.createdPieces.indexOf(eachEl.uuid) !== -1) {
              Object.assign(eachEl, updates);
            }
          });
        }
      }
      break;
    case 'move-element': {
      const el = status.elements.find((e) => e.uuid === delta.uuid);
      if (el.type === 'Piece') {
        console.log('Checking!');
        forEachPieceSourceContainingElement(status, delta.uuid, (ps) => {
          console.log(ps);
          if (isWithinVisualBoundary(el, ps)) {
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
