import { type GElementBase } from '../../types';

type Die = { faces: number };
type RolledDie = { faces: number; result: number };
type Roll = { dice: RolledDie[]; player: string };

export type DiceElement = GElementBase & {
  type: 'Dice';
  version: number;
  dice: Die[];
  rolls: Roll[];
};
