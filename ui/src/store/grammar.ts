import type { WAL, WeaveClient } from '@theweave/api';
import * as Automerge from 'automerge';
import { cloneDeep } from 'lodash';
import { v1 as uuidv1 } from 'uuid';

import { type AgentPubKeyB64, decodeHashFromBase64, encodeHashToBase64 } from '@holochain/client';

import { colorSequence } from '~/center/lib/util';

import * as elements from '../elements';
import { LIBRARY } from './library';
import {
  DEFAULT_NOTIFICATIONS_CONFIG,
  type GameSpace,
  type GElement,
  type LogType,
  type NotificationsConfig,
} from './types';

export type Delta =
  | { type: 'set-is-archived'; value: boolean }
  | { type: 'set-is-library-item'; value: boolean }
  | { type: 'set-name'; name: string }
  | { type: 'set-icon'; icon: string }
  | { type: 'set-deleted'; isDeleted: boolean }
  | { type: 'set-players-slots'; playersSlots: GameSpace['playersSlots'] }
  | { type: 'set-is-stewarded'; isStewarded: boolean }
  | { type: 'join-game' }
  | { type: 'leave-game' }
  | { type: 'add-element'; element: GElement }
  | { type: 'move-element'; uuid: string; offset: { x: number; y: number } }
  | { type: 'move-elements'; uuids: string[]; offset: { x: number; y: number } }
  | { type: 'resize-element'; uuid: string; width: number; height: number }
  | { type: 'rotate-element'; uuid: string; rotation: number }
  | { type: 'move-z'; uuid: string; z: 'top' | 'bottom' | 'up' | 'down' }
  | { type: 'update-element'; element: Partial<GElement> }
  | { type: 'remove-elements'; uuids: string[] }
  | { type: 'add-log'; log: { message: string; type: LogType; pubKey?: string } }
  | { type: 'seen-activity-log' }
  | { type: 'set-notifications-config-override'; config: Partial<NotificationsConfig> };

export function initialState(pubKey: string): GameSpace {
  return {
    version: 10,
    name: 'Game Space',
    icon: '♟',
    creator: pubKey,
    elements: [],
    wals: [],
    isStewarded: false,
    isLibraryItem: false,
    isArchived: false,
    playersSlots: [
      { color: colorSequence(0, 4), pubKey: null },
      { color: colorSequence(1, 4), pubKey: null },
      { color: colorSequence(2, 4), pubKey: null },
      { color: colorSequence(3, 4), pubKey: null },
    ],
    lastChangeAt: Date.now(),
    activityLog: [],
    notificationsConfigOverride: {},
    isDeleted: false,
    fromPreset: null,
  };
}

export const applyDelta = (
  delta: Delta,
  $state: GameSpace,
  context: { pubKey: string; weaveClient?: WeaveClient; asAsset: () => WAL },
) => {
  const S = $state as Automerge.FreezeObject<GameSpace>;
  console.log($state, typeof $state);
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
    case 'set-icon':
      $state.icon = delta.icon;
      break;
    case 'set-deleted':
      $state.isDeleted = delta.isDeleted;
      break;
    case 'set-players-slots': {
      const incoming = delta.playersSlots.map((s) => s.pubKey);
      const current = $state.playersSlots.map((s) => s.pubKey);
      const added = incoming.filter((p) => !current.includes(p));
      const removed = current.filter((p) => !incoming.includes(p));
      if (added.length > 0) {
        added.forEach((pubKey) => {
          addLog({ message: 'joined the game', type: 'join', pubKey });
        });
      }
      if (removed.length > 0) {
        removed.forEach((pubKey) => {
          addLog({
            message: context.pubKey !== pubKey ? 'was removed from the game' : 'left the game',
            type: 'left',
            pubKey,
          });
        });
      }
      $state.playersSlots = delta.playersSlots;
      break;
    }
    case 'set-is-stewarded':
      $state.isStewarded = delta.isStewarded;
      break;
    case 'join-game':
      const freeSlot = $state.playersSlots.findIndex((p) => p.pubKey === null);
      const alreadyPlaying = $state.playersSlots.find((p) => p.pubKey === context.pubKey);
      if (freeSlot !== -1 && !alreadyPlaying) {
        $state.playersSlots[freeSlot].pubKey = context.pubKey;
      }
      addLog({ message: 'joined the game', type: 'join' });
      break;
    case 'leave-game':
      const playerIndex = $state.playersSlots.findIndex((p) => p.pubKey === context.pubKey);
      if (playerIndex !== -1) {
        $state.playersSlots[playerIndex].pubKey = null;
        addLog({ message: 'left the game', type: 'left' });
      }

      break;
    case 'add-element': {
      const elements = $state.elements;
      const maxZ = elements.reduce((max, el) => (el.z > max ? el.z : max), 0);
      const elementToAdd = { ...delta.element, uuid: delta.element.uuid || uuidv1(), z: maxZ + 1 };
      $state.elements.push(elementToAdd);
      const label = getLabel(elementToAdd.type);
      addLog({ type: 'add', message: `added ${label}`, elRef: elementToAdd.uuid });
      break;
    }
    case 'move-element': {
      $state.elements.forEach((e) => {
        if (e.uuid === delta.uuid) {
          e.x += delta.offset.x;
          e.y += delta.offset.y;
          const label = getLabel(e.type);
          addLog({ message: `moved ${label}`, type: 'move', elRef: delta.uuid });
        }
      });

      break;
    }
    case 'move-elements': {
      $state.elements.forEach((e) => {
        if (delta.uuids.indexOf(e.uuid) !== -1) {
          e.x += delta.offset.x;
          e.y += delta.offset.y;
        }
      });
      addLog({ message: `moved multiple elements`, type: 'move', elRef: null });

      break;
    }
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

    case 'remove-elements': {
      delta.uuids.forEach((uuid) => {
        S.elements.deleteAt(
          S.elements.findIndex((e) => e.uuid === uuid),
          1,
        );
      });

      const labels = delta.uuids.map((uuid) => getLabel(uuid)).join(', ');
      addLog({ message: `removed ${labels}`, type: 'remove', elRef: delta.uuids[0] });
      break;
    }
    case 'seen-activity-log':
      $state.activityLog.forEach((l) => {
        if (l.seenBy.indexOf(context.pubKey) === -1) {
          l.seenBy.push(context.pubKey);
        }
      });
      // $state.activityLog = $state.activityLog.map((l) => ({ ...l, seenBy: [...l.seenBy, agentKey] }))
      break;
    case 'add-log':
      addLog(delta.log);
      break;
    case 'set-notifications-config-override': {
      $state.notificationsConfigOverride[context.pubKey] = delta.config;
      break;
    }
  }

  function getLabel(elType: string) {
    // TODO: Maybe fix sometime that player pieces don't have a library item
    return LIBRARY.find((l) => l.type === elType)?.label || 'Player Piece';
  }

  function addLog(log: { message: string; type: LogType; pubKey?: string; elRef?: string }) {
    if (!$state.isLibraryItem) {
      $state.activityLog.push({
        type: log.type,
        message: log.message,
        time: Date.now(),
        seenBy: [context.pubKey],
        agentKey: log.pubKey || context.pubKey,
        elRef: log.elRef || null,
      });
      const nConfig = {
        ...DEFAULT_NOTIFICATIONS_CONFIG,
        ...($state.notificationsConfigOverride[context.pubKey] || {}),
      };
      if (context.weaveClient) {
        const players = $state.playersSlots
          .filter((p) => p.pubKey !== context.pubKey && p.pubKey)
          .filter((p) => {
            const nConfig = {
              ...DEFAULT_NOTIFICATIONS_CONFIG,
              ...($state.notificationsConfigOverride[p.pubKey] || {}),
            };
            return nConfig[log.type];
          })
          .map((p) => decodeHashFromBase64(p.pubKey));
        console.log('SENDING NOTIFICATIONS TO', players);
        if (players) {
          context.weaveClient.notifyFrame([
            {
              title: log.message,
              body: '',
              notification_type: log.type,
              urgency: 'medium',
              fromAgent: decodeHashFromBase64(context.pubKey),
              forAgents: players,
              icon_src: undefined,
              timestamp: Date.now(),
              aboutWal: context.asAsset(),
            },
          ]);
        }
      }
    }
  }

  for (let e in elements) {
    const El = elements[e];
    if (typeof El['applyDelta'] === 'function') {
      El['applyDelta'](delta, $state);
    }
  }

  $state.lastChangeAt = Date.now();
  $state.version = 10;
};
