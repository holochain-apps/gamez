import { type GElementBase } from '~/store';

export type ImageElement = GElementBase & {
  type: 'Image';
  version: number;
  url: string;
};
