import { type GElementBase } from '../../types';

export type PieceSourceElement = GElementBase & {
  type: 'PieceSource';
  version: number;
  display: { mode: 'emoji'; value: string } | { mode: 'url'; value: string };
  pieceW: number;
  pieceH: number;
  limit: number | null;
  createdPieces: string[];
};