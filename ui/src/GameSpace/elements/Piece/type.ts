import { type GElementBase } from '../../types';

export type PieceElement = GElementBase & {
  type: 'Piece';
  version: number;
  display: { mode: 'emoji'; value: string } | { mode: 'url'; value: string };
};
