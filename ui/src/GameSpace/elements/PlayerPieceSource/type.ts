import { type GElementBase } from '../../types';

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
