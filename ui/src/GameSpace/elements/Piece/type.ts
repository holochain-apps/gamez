import { type GElementBase } from '../../types.d';

export type PieceElement = GElementBase & {
  type: 'Piece';
  version: 1;
  display: { mode: 'emoji'; value: string } | { mode: 'url'; value: string };
};
