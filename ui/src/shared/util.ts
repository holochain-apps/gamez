import type { AsyncStatus } from '@holochain-open-dev/stores';
import { type AppClient, CellType, type DnaHash, type EntryHash } from '@holochain/client';
import type { WeaveUrl } from '@lightningrodlabs/we-applet';

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
