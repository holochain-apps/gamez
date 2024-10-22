import { type GElementBase } from '~/store';

export type TurnStarted = {
  player: string | null;
  time: number;
};

export type TurnTrackerElement = GElementBase & {
  type: 'TurnTracker';
  version: number;
  turnsLog: TurnStarted[];
  showTimers: boolean;
};
