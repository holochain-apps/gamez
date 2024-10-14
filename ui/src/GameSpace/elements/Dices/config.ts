import { type DicesElement } from './type';

const config = {
  type: 'Dices',
  version: 1,
  label: 'Dices',
  icon: '🎲',
  build: (): Partial<DicesElement> => ({
    height: 120,
    width: 120,
    dices: [{ faces: 6 }, { faces: 6 }],
  }),
};

export default config;
