import { type GElementBase } from '~/store';

export type FooTemplateElement = GElementBase & {
  type: 'FooTemplate';
  version: number;
};
