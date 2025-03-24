import { type PieceElement } from './type';

const config = {
  type: 'Piece',
  version: 1,
  label: 'Piece',
  icon: '♟',
  build: (): Partial<PieceElement> => ({
    height: 40,
    width: 40,
    display: {
      mode: 'emoji',
      value: '⚫️',
    },
  }),
};

export default config;
