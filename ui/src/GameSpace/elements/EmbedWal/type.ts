import { type GElementBase } from '../../types.d';

export type EmbedWalElement = GElementBase & {
  type: 'EmbedWal';
  version: 1;
  url: string;
};
