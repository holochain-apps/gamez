import { type GElementBase } from '~/store';

export const VERSION = 2;

export type TurnStarted = {
  playerSlot: number; // -1 == PAUSED
  time: number;
};

export type TurnTrackerElement = GElementBase & {
  type: 'TurnTracker';
  version: 2;
  turnsLog: TurnStarted[];
  showTimers: boolean;
  showEmptyPlayersSlots: boolean;
};
