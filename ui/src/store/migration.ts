import { type GameSpace } from './types';

export default function migration(gottenState: GameSpace): GameSpace {
  if ((gottenState.version as 3) === 3) {
    gottenState.lastChangeAt = Date.now();
    // @ts-ignore
    gottenState.version = 4;
  }
  if ((gottenState.version as 4) === 4) {
    const status = (gottenState as any).status;
    gottenState.isArchived = false;
    gottenState.isLibraryItem = false;
    if (status === 'archived') gottenState.isArchived = true;
    if (status === 'library') gottenState.isLibraryItem = true;
    // @ts-ignore
    delete gottenState.status;
    gottenState.version = 5;
  }
  return gottenState;
}
