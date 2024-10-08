import { type PieceSourceElement } from './type';

const config = {
  type: 'PieceSource',
  version: 2,
  label: 'Piece source',
  icon: '📤',
  build: (): Partial<PieceSourceElement> => ({
    height: 100,
    width: 100,
    limit: 3,
    pieceW: 30,
    pieceH: 30,
    createdPieces: [],
    display: { mode: 'emoji', value: '⚫️' },
  }),
};

export default config;
