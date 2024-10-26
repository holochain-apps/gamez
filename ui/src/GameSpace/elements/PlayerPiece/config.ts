import { type GameSpaceSyn } from '~/store';

import { type PlayerPieceElement } from './type';

const config = {
  type: 'PlayerPiece',
  version: 2,
  label: 'Player Piece',
  icon: '👤',
  build: (gameSpace: GameSpaceSyn): Partial<PlayerPieceElement> => ({
    height: 30,
    width: 30,
    agent: gameSpace.pubKey,
    colorRing: '',
  }),
};

export default config;
