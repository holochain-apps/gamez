import { type GElementBase } from '../../types.d';

export type ImageElement = GElementBase & {
  type: 'Image';
  version: 1;
  url: string;
};
