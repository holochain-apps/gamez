import type { GameSpace } from '../types';

export default {
  creator: '',
  elements: [
    {
      height: 500,
      lock: {
        config: true,
        position: true,
        remove: true,
        rotation: true,
        size: true,
        wals: true,
      },
      rotation: 0,
      type: 'Image',
      url: 'https://h5pstudio.ecampusontario.ca/sites/default/files/h5p/content/9451/images/image-5f6645b4ef14e.jpg',
      uuid: '70ac68a0-a11f-11ef-bd7a-ff253897f346',
      version: 1,
      wals: [],
      width: 1000,
      x: 0,
      y: 0,
      z: 1,
    },
    {
      canOnlyPickOwnPiece: true,
      colorCoded: true,
      createdPieces: [],
      height: 202.03619909502268,
      limit: 0,
      lock: {
        config: false,
        position: false,
        remove: false,
        rotation: false,
        size: false,
        wals: false,
      },
      rotation: 0,
      showNames: true,
      size: 30,
      type: 'PlayerPieceSource',
      uuid: '80f89e90-a11f-11ef-bd7a-ff253897f346',
      version: 1,
      wals: [],
      width: 113.5746606334842,
      x: -353.23792557981255,
      y: 60.274726630203318,
      z: 2,
    },
  ],
  isStewarded: false,
  lastChangeAt: 1731434284003,
  minMaxPlayers: [1, 4],
  name: 'World',
  players: [],
  status: 'library',
  version: 4,
  wals: [],
} as const satisfies GameSpace;