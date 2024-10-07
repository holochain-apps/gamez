import { type GElementBase } from '../../types';

export type ImageElement = GElementBase & {
  type: 'Image';
  version: 1;
  url: string;
};
