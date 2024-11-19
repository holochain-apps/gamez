import { type DiceElement, VERSION } from './type';

const config = {
  type: 'Dice',
  version: VERSION,
  label: 'Dice',
  icon: '🎲',
  build: (): Partial<DiceElement> => ({
    height: 120,
    width: 120,
    dice: [{ faces: 6 }, { faces: 6 }],
    rolls: [],
  }),
};

export default config;
