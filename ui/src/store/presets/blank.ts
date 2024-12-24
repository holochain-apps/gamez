import type { GameSpace } from '../types';

export default {
  creator: '',
  elements: [],
  isStewarded: false,
  lastChangeAt: 1731434284003,
  name: 'Blank',
  playersSlots: [
    {
      color: 'hsl(0, 60%, 50%)',
      pubKey: null,
    },
    {
      color: 'hsl(90, 60%, 50%)',
      pubKey: null,
    },
    {
      color: 'hsl(180, 60%, 50%)',
      pubKey: null,
    },
    {
      color: 'hsl(270, 60%, 50%)',
      pubKey: null,
    },
  ],
  isLibraryItem: true,
  isArchived: false,
  version: 9,
  icon: '🟩',
  wals: [],
  activityLog: [],
  notificationsConfigOverride: {},
} as const satisfies GameSpace;
