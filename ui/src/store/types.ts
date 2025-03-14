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
  isDeleted: boolean;
  fromPreset: string | null;
  isStewarded: boolean;
  isLibraryItem: boolean;
  isArchived: boolean;
  playersSlots: PlayerSlot[];
  lastChangeAt: number;
  activityLog: Log[];
  notificationsConfigOverride: Record<AgentKey, Partial<NotificationsConfig>>;
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

export type Box = { x: number; y: number; w: number; h: number };

const elToBox = (gEl: GElementBase): Box => ({ x: gEl.x, y: gEl.y, w: gEl.width, h: gEl.height });
const elTo = (gEl: GElementBase): Box => ({ x: gEl.x, y: gEl.y, w: gEl.width, h: gEl.height });

export function containingBox(els: GElementBase[], offset = 0): Box | null {
  if (els.length === 0) return null;
  const boxes = els.map(elToBox);

  let tl: number;
  let tr: number;
  let bl: number;
  let br: number;

  boxes.forEach((b) => {
    const Bl = b.x - b.w / 2;
    const Br = b.x + b.w / 2;
    const Bt = b.y - b.h / 2;
    const Bb = b.y + b.h / 2;

    if (Bl < tl || tl === undefined) tl = Bl;
    if (Bt < tr || tr === undefined) tr = Bt;
    if (Br > br || br === undefined) br = Br;
    if (Bb > bl || bl === undefined) bl = Bb;
  });

  return {
    x: tl! - offset,
    y: tr! - offset,
    w: br! - tl! + offset * 2,
    h: bl! - tr! + offset * 2,
  };
}
