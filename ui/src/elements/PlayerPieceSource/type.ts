import { type GElementBase } from '~/store';

export const VERSION = 2;

export type PlayerPieceSourceElement = GElementBase & {
  type: 'PlayerPieceSource';
  version: number;
  showNames: boolean;
  canOnlyPickOwnPiece: boolean;
  showEmptyPlayersSlots: boolean;
  size: number;
  limit: number;
  createdPieces: string[];
};
