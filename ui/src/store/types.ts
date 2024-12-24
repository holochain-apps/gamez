import type { WeaveUrl } from '@theweave/api';

import * as elements from '~/GameSpace/elements';

export const VERSION = 9;

export type AgentKey = string;

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
  activityLog: Log[];
  notificationsConfigOverride: Record<AgentKey, NotificationsConfig>;
};

export const DEFAULT_NOTIFICATIONS_CONFIG: NotificationsConfig = {
  turn: true,
  move: false,
  join: true,
  left: true,
  add: false,
  remove: false,
};

export type NotificationsConfig = Record<LogType, boolean>;

export type LogType = 'turn' | 'move' | 'join' | 'left' | 'add' | 'remove';

export type Log = {
  message: string;
  time: number;
  seenBy: string[];
  type: LogType;
  agentKey: AgentKey;
  elRef: string | null;
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
