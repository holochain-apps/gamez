import migration from './migration';
import { type GameSpace, STATUS_ENUM, VERSION } from './types';

export default function validateGameSpace(inputData: any): GameSpace | null {
  let data = { ...inputData };
  // TODO: Use JSON schema and some automatic validation
  if (typeof data.version !== 'number') return null;

  if (data.version !== VERSION) {
    data = migration(data);
    if (data.version !== VERSION) throw new Error(`Version is not ${VERSION} and couldn't migrate`);
  }

  if (typeof data.name !== 'string') throw new Error(`'name' must be a string`);
  if (!data.elements || !Array.isArray(data.elements))
    throw new Error(`'elements' must be an array`);
  if (!data.wals || !Array.isArray(data.wals)) throw new Error(`'wals' must be an array`);
  if (typeof data.isStewarded !== 'boolean') throw new Error(`'isStewarded' must be a boolean`);
  if (typeof data.status !== 'string' || STATUS_ENUM.indexOf(data.status) === -1)
    throw new Error(`'status' must be one of ${STATUS_ENUM.join(', ')}`);
  if (!data.minMaxPlayers || !Array.isArray(data.minMaxPlayers) || data.minMaxPlayers.length !== 2)
    throw new Error(`'minMaxPlayers' must be an array with two numbers: [minPlayers, maxPlayers]`);
  if (!data.players || !Array.isArray(data.players)) throw new Error(`'players' must be an array`);
  if (typeof data.lastChangeAt !== 'number') throw new Error(`'lastChangeAt' must be a number`);

  return data as GameSpace;
}
