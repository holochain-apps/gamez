import { type GElementBase } from '../../types';

export type FooTemplateElement = GElementBase & {
  type: 'FooTemplate';
  version: number;
};
