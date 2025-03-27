import { type GElementBase } from '~/store';

export const VERSION = 3;

export type PlayerPieceElement = GElementBase & {
  type: 'PlayerPiece';
  version: 3;
  playerSlot: number;
};
