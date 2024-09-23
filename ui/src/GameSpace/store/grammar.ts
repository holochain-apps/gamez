import { cloneDeep } from 'lodash';
import { v1 as uuidv1 } from 'uuid';

import { type AgentPubKeyB64, encodeHashToBase64 } from '@holochain/client';

import type { GameSpace, GElement } from '../types.d';

export type Delta =
  | { type: 'set-name'; name: string }
  | { type: 'set-is-stewarded'; isStewarded: boolean }
  | { type: 'add-player'; player: AgentPubKeyB64 }
  | { type: 'remove-player'; player: AgentPubKeyB64 }
  | { type: 'add-element'; element: GElement }
  | { type: 'move-element'; uuid: string; x: number; y: number; z: number }
  | { type: 'update-element'; element: GElement };

export function initialState(pubKey: Uint8Array): GameSpace {
  return {
    version: 1,
    name: 'Game Space',
    creator: encodeHashToBase64(pubKey),
    elements: [],
    wals: [],
    isStewarded: false,
    status: 'draft',
    minMaxPlayers: [1, 4],
    players: [],
  };
}

export const applyDelta = (delta: Delta, status: GameSpace) => {
  switch (delta.type) {
    case 'set-name':
      status.name = delta.name;
      break;
    case 'set-is-stewarded':
      status.isStewarded = delta.isStewarded;
      break;
    case 'add-player':
      status.players.push(delta.player);
      break;
    case 'remove-player':
      status.players = status.players.filter((p) => p !== delta.player);
      break;
    case 'add-element':
      const elemenToAdd = { ...delta.element, uuid: uuidv1() };
      status.elements.push(elemenToAdd);
      break;
    case 'move-element':
      status.elements.forEach((e) => {
        if (e.uuid === delta.uuid) {
          e.x = delta.x;
          e.y = delta.y;
          e.z = delta.z;
        }
        // return e;
      });
      break;
    case 'update-element':
      status.elements.forEach((e) => {
        if (e.uuid === delta.element.uuid) {
          for (const key in delta.element) {
            const newValue =
              typeof delta.element[key] === 'object'
                ? cloneDeep(delta.element[key])
                : delta.element[key];
            e[key] = newValue;
          }
        }
      });
      break;
  }
};
