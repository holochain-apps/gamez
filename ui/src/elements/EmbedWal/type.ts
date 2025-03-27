import { type GElementBase } from '~/store';

export const VERSION = 2;

export type EmbedWalElement = GElementBase & {
  type: 'EmbedWal';
  version: typeof VERSION;
  url: string;
  preview: boolean;
  storedHeight: number;
};
