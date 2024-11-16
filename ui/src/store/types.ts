import type { WeaveUrl } from '@theweave/api';

import * as elements from '~/GameSpace/elements';

export const VERSION = 5;

export type GameSpace = {
  version: 5;
  name: string;
  creator: string;
  elements: GElement[];
  wals: WeaveUrl[];
  isStewarded: boolean;
  isLibraryItem: boolean;
  isArchived: boolean;
  minMaxPlayers: [number, number];
  players: string[];
  lastChangeAt: number;
};

export type LockConfig = {
  position: boolean;
  size: boolean;
  rotation: boolean;
  wals: boolean;
  config: boolean;
  remove: boolean;
};

export type GElementBase = {
  type: string;
  version: number;
  uuid: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  width: number;
  height: number;
  lock: LockConfig;
  wals: WeaveUrl[];
};

export type GElement =
  | elements.Piece.ElType
  | elements.Image.ElType
  | elements.PieceSource.ElType
  | elements.EmbedWal.ElType
  | elements.PlayerPiece.ElType
  | elements.PlayerPieceSource.ElType
  | elements.Dice.ElType
  | elements.TurnTracker.ElType;
