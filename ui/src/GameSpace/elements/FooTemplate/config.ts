import { type FooTemplateElement } from './type';

const config = {
  type: 'FooTemplate',
  version: 1,
  label: 'FooTemplate',
  icon: '💡',
  build: (): Partial<FooTemplateElement> => ({
    height: 100,
    width: 100,
  }),
};

export default config;
