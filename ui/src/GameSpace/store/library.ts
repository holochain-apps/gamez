import { type GElement } from '../types';

export type LibraryElement = {
  elementType: string;
  label: string;
  icon: string;
  initialWidth: number;
  initialHeight: number;
};

export const LIBRARY: LibraryElement[] = [
  {
    elementType: 'Piece',
    label: 'Piece',
    icon: '♟',
    initialHeight: 30,
    initialWidth: 30,
  },
  {
    elementType: 'Image',
    label: 'Image',
    icon: '🖼',
    initialHeight: 250,
    initialWidth: 250,
  },
  {
    elementType: 'PieceSource',
    label: 'Pieces source',
    icon: '📤',
    initialHeight: 100,
    initialWidth: 100,
  },
  {
    elementType: 'EmbedWal',
    label: 'Embed',
    icon: '📎',
    initialHeight: 200,
    initialWidth: 200,
  },
];

export function createElement(type: LibraryElement, x: number, y: number): GElement {
  const base = {
    uuid: '',
    x: x,
    y: y,
    z: 0,
    rotation: 0,
    height: type.initialHeight,
    width: type.initialWidth,
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
  if (type.elementType === 'Piece') {
    return {
      type: 'Piece',
      version: 1,
      display: { mode: 'emoji', value: '🔥' },
      ...base,
    };
  } else if (type.elementType === 'Image') {
    return {
      type: 'Image',
      version: 1,
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chessboard_green_squares.svg/512px-Chessboard_green_squares.svg.png',
      ...base,
    };
  } else if (type.elementType === 'PieceSource') {
    return {
      type: 'PieceSource',
      version: 2,
      limit: 3,
      pieceW: 30,
      pieceH: 30,
      createdPieces: [],
      display: { mode: 'emoji', value: '⚫️' },
      ...base,
    };
  } else if (type.elementType === 'EmbedWal') {
    return {
      type: 'EmbedWal',
      version: 1,
      url: '',
      ...base,
    };
  }
}
