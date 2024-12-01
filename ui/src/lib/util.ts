import type { WeaveUrl } from '@theweave/api';
import classnames from 'classnames';
import { readable } from 'svelte/store';
import type { Readable } from 'svelte/store';

import type { AsyncStatus } from '@holochain-open-dev/stores';
import {
  type AppClient,
  CellType,
  decodeHashFromBase64,
  type DnaHash,
  encodeHashToBase64,
  type EntryHash,
} from '@holochain/client';

export { v1 as uuid } from 'uuid';

export const hashEqual = (a: EntryHash, b: EntryHash): boolean => {
  if (!a || !b) {
    return !a && !b;
  }
  for (let i = a.length; -1 < i; i -= 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export const getMyDna = async (role: string, client: AppClient): Promise<DnaHash> => {
  const appInfo = await client.appInfo();
  const dnaHash = (appInfo.cell_info[role][0] as any)[CellType.Provisioned].cell_id[0];
  return dnaHash;
};

export type Position = {
  x: number;
  y: number;
};
export type Size = {
  width: number;
  height: number;
};
export type AssetSpec = {
  embed: boolean;
  position: Position;
  size: Size;
  weaveUrl: WeaveUrl;
};

export function isComplete<T>(data: AsyncStatus<T>): data is { status: 'complete'; value: T } {
  return data.status === 'complete';
}

export const hashToB64 = encodeHashToBase64;

export const b64ToHash = decodeHashFromBase64;

export function waitUntilAvailable<T>(readable: Readable<T | null>): Promise<T> {
  return new Promise((resolve) => {
    const unsubscribe = readable.subscribe((data) => {
      if (data != null) {
        resolve(data);
      }
    });

    setTimeout(() => {
      unsubscribe();
      throw new Error('Timed out');
    }, 5000);
  });
}

export function colorSequence(i: number, max: number): string {
  if (i === -1) return '';
  const hue = (i / max) * 360;
  return `hsl(${hue}, 60%, 50%)`;
}

export const COLORS = ['#222222', '#777777', '#f7f7f7'].concat(
  Array.from(new Array(12)).map((_, i) => colorSequence(i, 12)),
);

export const cx = classnames;

export const addWindowEventListeners = <K extends keyof WindowEventMap>(
  eventCallbackPairs: [K, (event: WindowEventMap[K]) => void][],
): (() => void) => (
  eventCallbackPairs.forEach(([event, callback]) => {
    window.addEventListener(event, callback);
  }),
  () => {
    eventCallbackPairs.forEach(([event, callback]) => {
      window.removeEventListener(event, callback);
    });
  }
);
export const addWindowEventListener = <K extends keyof WindowEventMap>(
  event: K,
  callback: (event: WindowEventMap[K]) => void,
): (() => void) => {
  window.addEventListener(event, callback);
  return () => {
    window.removeEventListener(event, callback);
  };
};

export const wrapFns = (fns: (() => void)[]) => () => fns.forEach((fn) => fn());

export const EMPTY_IMAGE = new Image(1, 1);
EMPTY_IMAGE.src =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
