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

export const cx = classnames;
