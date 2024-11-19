import type { GameSpace } from '../types';

export default {
  creator: '',
  elements: [],
  isStewarded: false,
  lastChangeAt: 1731434284003,
  name: 'Blank',
  playersSlots: [
    { color: '#ff0000', pubKey: null },
    { color: '#00ff00', pubKey: null },
    { color: '#0000ff', pubKey: null },
    { color: '#ffff00', pubKey: null },
  ],
  isLibraryItem: true,
  isArchived: false,
  version: 7,
  wals: [],
} as const satisfies GameSpace;
