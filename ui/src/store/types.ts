import type { WeaveUrl } from '@theweave/api';

import * as elements from '~/GameSpace/elements';

export const VERSION = 8;

export type GameSpace = {
  version: typeof VERSION;
  icon: string;
  name: string;
  creator: string;
  elements: GElement[];
  wals: WeaveUrl[];
  isStewarded: boolean;
  isLibraryItem: boolean;
  isArchived: boolean;
  playersSlots: PlayerSlot[];
  lastChangeAt: number;
};

export type PlayerSlot = {
  pubKey: string | null;
  color: string;
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

export type LibraryConfig = {
  type: string;
  version: number;
  label: string;
  icon: string;
  build: (gameSpaceSyn: any) => any;
};
