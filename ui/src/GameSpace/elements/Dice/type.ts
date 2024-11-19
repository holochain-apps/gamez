import { type GElementBase } from '~/store';

export type Die = { faces: number };
export type RolledDie = { faces: number; result: number };
export type Roll = { dice: RolledDie[]; playerSlot: number };

export const VERSION = 2;

export type DiceElement = GElementBase & {
  type: 'Dice';
  version: 2;
  dice: Die[];
  rolls: Roll[];
};
