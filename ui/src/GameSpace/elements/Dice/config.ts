import { type DiceElement } from './type';

const config = {
  type: 'Dice',
  version: 1,
  label: 'Dice',
  icon: '🎲',
  build: (): Partial<DiceElement> => ({
    height: 120,
    width: 120,
    dice: [{ faces: 6 }, { faces: 6 }],
  }),
};

export default config;
