import { type TurnTrackerElement } from './type';

const config = {
  type: 'TurnTracker',
  version: 1,
  label: 'Turn Tracker',
  icon: '⏱',
  build: (): Partial<TurnTrackerElement> => ({
    height: 200,
    width: 150,
    turnsLog: [],
    showTimers: true,
  }),
};

export default config;
