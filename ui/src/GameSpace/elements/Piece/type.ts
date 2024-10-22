import { type GElementBase } from '~/store';

export type PieceElement = GElementBase & {
  type: 'Piece';
  version: number;
  display: { mode: 'emoji'; value: string } | { mode: 'url'; value: string };
};
