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

// Using Intl.RelativeTimeFormat create a string like:
// - Just now
// - 7 minutes ago
// - 1 hour ago
// - Yesterday
// - 2 days ago
// - 1 week ago
// - 1 month ago
// - More than a year ago
export const relativeTimeFormat = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (diff < minute) {
    return rtf.format(-Math.round(diff / second), 'seconds');
  } else if (diff < hour) {
    return rtf.format(-Math.round(diff / minute), 'minutes');
  } else if (diff < day) {
    return rtf.format(-Math.round(diff / hour), 'hours');
  } else if (diff < day * 2) {
    return 'Yesterday';
  } else if (diff < day * 7) {
    return rtf.format(-Math.round(diff / day), 'days');
  } else if (diff < day * 30) {
    return rtf.format(-Math.round(diff / (day * 7)), 'weeks');
  } else if (diff < day * 365) {
    return rtf.format(-Math.round(diff / (day * 30)), 'months');
  } else {
    return 'More than a year ago';
  }
};

// Using Intl.DateTimeFormat format time like: 6 Feb 2015 14:30
export const timeFormat = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};
