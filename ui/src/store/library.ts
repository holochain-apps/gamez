import * as elements from '../GameSpace/elements';
import { type GameSpace } from './main.svelte';
import { type GElement, type LibraryConfig } from './types';

export type LibraryElement = {
  type: string;
  label: string;
  icon: string;
  version: number;
};

export const LIBRARY: LibraryElement[] = Object.values(elements)
  .map((el) => (el as any).config)
  .filter((el) => el);

export function createElement(
  libraryEl: LibraryElement,
  x: number,
  y: number,
  gameSpace: GameSpace,
): GElement {
  const base: Partial<GElement> = {
    uuid: '',
    x: x,
    y: y,
    z: 0,
    width: 100,
    height: 100,
    rotation: 0,
    lock: {
      position: false,
      size: false,
      rotation: false,
      wals: false,
      config: false,
      remove: false,
    },
    wals: [],
  };
  const config = elements[libraryEl.type].config as LibraryConfig;
  const toExtendWith = config.build.call(null, gameSpace);

  // @ts-ignore
  return { ...base, ...toExtendWith, type: config.type, version: config.version };
}
