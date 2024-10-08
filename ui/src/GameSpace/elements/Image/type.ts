import { type GElementBase } from '../../types';

export type ImageElement = GElementBase & {
  type: 'Image';
  version: number;
  url: string;
};
