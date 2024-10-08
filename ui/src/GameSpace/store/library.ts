import * as elements from '../elements';
import { type GElement } from '../types';
import { type GameSpaceSyn } from './GameSpaceSyn';

export type LibraryElement = {
  type: string;
  label: string;
  icon: string;
  version: number;
};

export const LIBRARY: LibraryElement[] = Object.values(elements).map((el) => el.config);

export function createElement(
  libraryEl: LibraryElement,
  x: number,
  y: number,
  gameSpace: GameSpaceSyn,
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
  const config = elements[libraryEl.type as keyof typeof elements].config;
  const toExtendWith = config.build.call(null, gameSpace);

  // @ts-ignore
  return { ...base, ...toExtendWith, type: config.type, version: config.version };
}
