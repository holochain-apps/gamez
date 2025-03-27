import { type GameSpaceSyn } from '~/store';

import { type PlayerPieceSourceElement, VERSION } from './type';

const config = {
  type: 'PlayerPieceSource',
  version: VERSION,
  label: 'Player Piece Source',
  icon: '👥',
  build: (gameSpace: GameSpaceSyn): Partial<PlayerPieceSourceElement> => ({
    height: 150,
    width: 100,
    showNames: false,
    canOnlyPickOwnPiece: true,
    showEmptyPlayersSlots: true,
    size: 30,
    limit: 5,
    createdPieces: [],
  }),
};

export default config;
