import type { WeaveUrl } from '@theweave/api';

import * as elements from '~/elements';

export const VERSION = 10;

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

// The CanConfig does not apply for
// changes triggered by the in-game-element
// just the configuration menu and the
// controls of the elements wrapper
export type CanConfig = {
  move: boolean; // Includes Z-index
  resize: boolean;
  rotate: boolean;
  attach: boolean;
  configurate: boolean;
  remove: boolean;
  duplicate: boolean;
};

export const DEFAULT_CAN_CONFIG: CanConfig = {
  move: true,
  resize: false,
  rotate: false,
  attach: true,
  configurate: false,
  remove: false,
  duplicate: false,
};

export const CAN_ALL: CanConfig = {
  move: true,
  resize: true,
  rotate: true,
  attach: true,
  configurate: true,
  remove: true,
  duplicate: true,
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
  can: Partial<CanConfig>;
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
    const Bl = b.x;
    const Br = b.x + b.w;
    const Bt = b.y;
    const Bb = b.y + b.h;

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
