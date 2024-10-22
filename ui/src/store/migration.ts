import { type GameSpace } from './types';

export default function migration(gottenState: GameSpace): GameSpace {
  if ((gottenState.version as 3) === 3) {
    gottenState.lastChangeAt = Date.now();
    gottenState.version = 4;
  }
  return gottenState;
}
