import type { WeaveUrl } from '@theweave/api';

export type GameSpace = {
  version: 3;
  name: string;
  creator: string;
  elements: GElement[];
  wals: WeaveUrl[];
  isStewarded: boolean;
  status: 'draft' | 'ready' | 'archived' | 'deleted';
  minMaxPlayers: [number, number];
  players: string[];
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

export type PieceElement = GElementBase & {
  type: 'Piece';
  version: 1;
  display: { mode: 'emoji'; value: string } | { mode: 'url'; value: string };
};

export type ImageElement = GElementBase & {
  type: 'Image';
  version: 1;
  url: string;
};

export type PieceSourceElement = GElementBase & {
  type: 'PieceSource';
  version: 2;
  display: { mode: 'emoji'; value: string } | { mode: 'url'; value: string };
  pieceW: number;
  pieceH: number;
  limit: number | null;
  createdPieces: string[];
};

export type GElement = PieceElement | ImageElement | PieceSourceElement;
