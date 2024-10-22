import { type GElementBase } from '~/store';

export type PlayerPieceSourceElement = GElementBase & {
  type: 'PlayerPieceSource';
  version: number;
  showNames: boolean;
  canOnlyPickOwnPiece: boolean;
  colorCoded: boolean;
  size: number;
  limit: number;
  createdPieces: string[];
};
