import { type GElementBase } from '../../types';

export type EmbedWalElement = GElementBase & {
  type: 'EmbedWal';
  version: number;
  url: string;
};
