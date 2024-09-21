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

export type GElementType = {
  name: string;
  label: string;
  icon: string;
  initialWidth: number;
  initialHeight: number;
};

export type GElement = {
  type: GElementType;
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  wals: WeaveUrl[];
};
