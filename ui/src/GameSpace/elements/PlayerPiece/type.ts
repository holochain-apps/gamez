import { type GElementBase } from '../../types';

export type PlayerPieceElement = GElementBase & {
  type: 'PlayerPiece';
  version: number;
  agent: string;
  colorRing: string;
};
