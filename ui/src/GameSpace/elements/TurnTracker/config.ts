import { type TurnTrackerElement, VERSION } from './type';

const config = {
  type: 'TurnTracker',
  version: VERSION,
  label: 'Turn Tracker',
  icon: '⏱',
  build: (): Partial<TurnTrackerElement> => ({
    height: 250,
    width: 200,
    turnsLog: [],
    showTimers: true,
    showEmptyPlayersSlots: true,
  }),
};

export default config;
