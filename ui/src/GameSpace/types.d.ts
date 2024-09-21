import type { WeaveUrl } from '@lightningrodlabs/we-applet';

export type GameSpace = {
  name: string;
  creator: string;
  elements: GElement[];
  wals: WeaveUrl[];
  isStewarded: boolean;
  status: 'draft' | 'ready' | 'archived' | 'deleted';
  minMaxPlayers: [number, number];
  players: string[];
};

export type GElementBase = {
  type: string;
  version: number;
  uuid: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
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

export type GElement = PieceElement | ImageElement;
