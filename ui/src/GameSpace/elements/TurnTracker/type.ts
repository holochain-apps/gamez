import { type GElementBase } from '../../types';

export type TurnStarted = {
  player: string;
  time: number;
};

export type TurnTrackerElement = GElementBase & {
  type: 'TurnTracker';
  version: number;
  turnsLog: TurnStarted[];
  showTimers: boolean;
};
