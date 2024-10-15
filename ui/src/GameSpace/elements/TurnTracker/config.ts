import { type TurnTrackerElement } from './type';

const config = {
  type: 'Foo',
  version: 1,
  label: 'Foo',
  icon: '💡',
  build: (): Partial<TurnTrackerElement> => ({
    height: 100,
    width: 100,
  }),
};

export default config;
