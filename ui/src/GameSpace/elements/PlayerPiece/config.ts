import { type GameSpaceSyn } from '~/GameSpace/store/GameSpaceSyn';

import { type PlayerPieceElement } from './type';

const config = {
  type: 'PlayerPiece',
  version: 1,
  label: 'Player Piece',
  icon: '🐵',
  build: (gameSpace: GameSpaceSyn): Partial<PlayerPieceElement> => ({
    height: 30,
    width: 30,
    agent: gameSpace.pubKeyB64,
  }),
};

export default config;
