import { type GElementBase } from '../../types';

export type EmbedWalElement = GElementBase & {
  type: 'EmbedWal';
  version: 1;
  url: string;
};
