import { type GElementBase } from '../../types';

export type Die = { faces: number };
export type RolledDie = { faces: number; result: number };
export type Roll = { dice: RolledDie[]; player: string };

export type DiceElement = GElementBase & {
  type: 'Dice';
  version: number;
  dice: Die[];
  rolls: Roll[];
};
