import { type GElementBase } from '../../types';

export type DiceElement = GElementBase & {
  type: 'Dice';
  version: number;
  dice: { faces: number }[];
  rolls: { faces: number; result: number }[][];
};
