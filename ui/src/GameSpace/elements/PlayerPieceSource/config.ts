import { type GameSpaceSyn } from '~/store';

import { type PlayerPieceSourceElement } from './type';

const config = {
  type: 'PlayerPieceSource',
  version: 1,
  label: 'Player Piece Source',
  icon: '👥',
  build: (gameSpace: GameSpaceSyn): Partial<PlayerPieceSourceElement> => ({
    height: 150,
    width: 100,
    showNames: false,
    canOnlyPickOwnPiece: true,
    size: 30,
    limit: 5,
    createdPieces: [],
  }),
};

export default config;
