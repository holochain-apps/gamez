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
  | { type: 'move-element'; uuid: string; x: number; y: number }
  | { type: 'resize-element'; uuid: string; width: number; height: number }
  | { type: 'rotate-element'; uuid: string; rotation: number }
  | { type: 'move-z'; uuid: string; z: 'top' | 'bottom' | 'up' | 'down' }
  | { type: 'update-element'; element: Partial<GElement> }
  | { type: 'remove-element'; uuid: string };

export function initialState(pubKey: Uint8Array): GameSpace {
  return {
    version: 2,
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
      const elements = status.elements;
      const maxZ = elements.reduce((max, el) => (el.z > max ? el.z : max), 0);
      const elementToAdd = { ...delta.element, uuid: delta.element.uuid || uuidv1(), z: maxZ + 1 };
      status.elements.push(elementToAdd);
      break;
    case 'move-element':
      status.elements.forEach((e) => {
        if (e.uuid === delta.uuid) {
          e.x = delta.x;
          e.y = delta.y;
        }
      });
      break;
    case 'resize-element':
      status.elements.forEach((e) => {
        if (e.uuid === delta.uuid) {
          e.width = delta.width;
          e.height = delta.height;
        }
      });
      break;
    case 'rotate-element':
      status.elements.forEach((e) => {
        if (e.uuid === delta.uuid) {
          e.rotation = delta.rotation;
        }
      });
      break;
    case 'update-element':
      status.elements.forEach((e) => {
        if (e.uuid === delta.element.uuid) {
          for (const key in delta.element) {
            // For elements that are objects or arrays
            // we gotta clone it otherwise Syn complains
            // about using a reference to an object somewhere else
            const newValue =
              typeof delta.element[key] === 'object'
                ? cloneDeep(delta.element[key])
                : delta.element[key];
            e[key] = newValue;
          }
        }
      });
      break;
    case 'move-z':
      if (status.elements.length < 2) return;
      const el = status.elements.find((e) => e.uuid === delta.uuid);
      if (!el) return; // This could happen with some weird race condition if an element is deleted

      // Normalize the Z numbers to be sequential without spaces
      let sorted = [...status.elements];
      sorted.sort((a, b) => a.z - b.z);
      sorted.forEach((e, i) => {
        e.z = i; // This actually mutates the element
      });
      sorted = sorted.filter((e) => e.uuid !== el.uuid);

      if (delta.z === 'top') {
        sorted.push(el);
      } else if (delta.z === 'bottom') {
        sorted.unshift(el);
      } else if (delta.z === 'up') {
        const index = sorted.findIndex((e) => e.z > el.z);
        sorted.splice(index + 1, 0, el);
      } else if (delta.z === 'down') {
        sorted.reverse();
        const index = sorted.findIndex((e) => e.z < el.z);
        sorted.splice(index + 1, 0, el);
        sorted.reverse();
      }

      sorted.forEach((e, i) => {
        e.z = i; // This actually mutates the element
      });
      break;
    case 'remove-element':
      const index = status.elements.findIndex((e) => e.uuid === delta.uuid);
      if (index === -1) return;
      status.elements.splice(index, 1);
      break;
  }
};
