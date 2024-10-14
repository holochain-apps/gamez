import { type GElementBase } from '../../types';

export type DicesElement = GElementBase & {
  type: 'Dices';
  version: number;
  dices: { faces: number }[];
  rolls: { faces: number; result: number }[][];
};
