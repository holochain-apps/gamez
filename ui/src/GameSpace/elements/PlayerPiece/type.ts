import { type GElementBase } from '~/store';

export type PlayerPieceElement = GElementBase & {
  type: 'PlayerPiece';
  version: number;
  agent: string;
  colorRing: string;
};
