import { getContext, setContext } from 'svelte';

import type { GameSpaceSyn } from './gameSpaceStore';

export function setGameSpaceStoreContext(gameSpaceStore: GameSpaceSyn) {
  setContext('game-space-store', gameSpaceStore);
}

export function getGSS() {
  return getContext('game-space-store') as GameSpaceSyn;
}
