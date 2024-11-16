import { cloneDeep } from 'lodash';
import { v1 as uuidv1 } from 'uuid';

import { type AgentPubKeyB64, encodeHashToBase64 } from '@holochain/client';

import * as elements from '../GameSpace/elements';
import type { GameSpace, GElement } from './types';

export type Delta =
  | { type: 'set-is-archived'; value: boolean }
  | { type: 'set-is-library-item'; value: boolean }
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

export function initialState(pubKey: string): GameSpace {
  return {
    version: 5,
    name: 'Game Space',
    creator: pubKey,
    elements: [],
    wals: [],
    isStewarded: false,
    isLibraryItem: false,
    isArchived: false,
    minMaxPlayers: [1, 4],
    players: [],
    lastChangeAt: Date.now(),
  };
}

export const applyDelta = (delta: Delta, $state: GameSpace) => {
  switch (delta.type) {
    case 'set-is-archived':
      $state.isArchived = delta.value;
      break;
    case 'set-is-library-item':
      $state.isLibraryItem = delta.value;
      break;
    case 'set-name':
      $state.name = delta.name;
      break;
    case 'set-is-stewarded':
      $state.isStewarded = delta.isStewarded;
      break;
    case 'add-player':
      $state.players.push(delta.player);
      break;
    case 'remove-player':
      $state.players = $state.players.filter((p) => p !== delta.player);
      break;
    case 'add-element':
      const elements = $state.elements;
      const maxZ = elements.reduce((max, el) => (el.z > max ? el.z : max), 0);
      const elementToAdd = { ...delta.element, uuid: delta.element.uuid || uuidv1(), z: maxZ + 1 };
      $state.elements.push(elementToAdd);
      break;
    case 'move-element':
      $state.elements.forEach((e) => {
        if (e.uuid === delta.uuid) {
          e.x = delta.x;
          e.y = delta.y;
        }
      });
      break;
    case 'resize-element':
      $state.elements.forEach((e) => {
        if (e.uuid === delta.uuid) {
          e.width = delta.width;
          e.height = delta.height;
        }
      });
      break;
    case 'rotate-element':
      $state.elements.forEach((e) => {
        if (e.uuid === delta.uuid) {
          e.rotation = delta.rotation;
        }
      });
      break;
    case 'update-element':
      $state.elements.forEach((e) => {
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
      if ($state.elements.length < 2) return;
      const el = $state.elements.find((e) => e.uuid === delta.uuid);
      if (!el) return; // This could happen with some weird race condition if an element is deleted

      // Normalize the Z numbers to be sequential without spaces
      let sorted = [...$state.elements];
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
      const index = $state.elements.findIndex((e) => e.uuid === delta.uuid);
      if (index === -1) return;
      $state.elements.splice(index, 1);
      break;
  }

  for (let e in elements) {
    const El = elements[e];
    if (typeof El['applyDelta'] === 'function') {
      El['applyDelta'](delta, $state);
    }
  }

  $state.lastChangeAt = Date.now();
  $state.version = 5;
};
