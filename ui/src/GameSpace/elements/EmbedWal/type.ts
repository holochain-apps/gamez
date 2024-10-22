import { type GElementBase } from '~/store';

export type EmbedWalElement = GElementBase & {
  type: 'EmbedWal';
  version: number;
  url: string;
};
