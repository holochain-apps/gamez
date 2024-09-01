import type { BoardState } from './board';

enum PieceType {
  Emoji,
  Image,
}

export const GO: Omit<BoardState, 'creator'> = {
  name: 'Go',
  status: '',
  max_players: 2,
  min_players: 2,
  turns: true,
  playerPieces: false,
  boundTo: [],
  pieceDefs: [
    {
      type: PieceType.Emoji,
      images: ['⚪️'],
      height: 25,
      width: 25,
      name: 'White',
      id: '04dccef0-272f-11ee-b38c-d589530c7a77',
    },
    {
      type: PieceType.Emoji,
      images: ['⚫️'],
      height: 25,
      width: 25,
      name: 'Black',
      id: '13f82600-272f-11ee-b38c-d589530c7a77',
    },
  ],
  props: {
    bgUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Blank_Go_board.svg/600px-Blank_Go_board.svg.png?20140621020717',
    bgHeight: '',
    bgWidth: '',
    pieces: {},
    players: [],
    attachments: [],
    turn: 0,
  },
};

export const CHESS: Omit<BoardState, 'creator'> = {
  boundTo: [],
  max_players: 2,
  min_players: 2,
  name: 'Chess',
  pieceDefs: [
    {
      height: 50,
      id: '9b1495f0-2654-11ee-92c9-138314b60697',
      images: ['♔'],
      name: 'White King',
      type: 0,
      width: 50,
    },
    {
      height: 50,
      id: '9b1495f1-2654-11ee-92c9-138314b60697',
      images: ['♕'],
      name: 'White Queen',
      type: 0,
      width: 50,
    },
    {
      height: 50,
      id: '9b1495f2-2654-11ee-92c9-138314b60697',
      images: ['♗'],
      name: 'White Bisop',
      type: 0,
      width: 50,
    },
    {
      height: 50,
      id: '9b1495f3-2654-11ee-92c9-138314b60697',
      images: ['♖'],
      name: 'White Rook',
      type: 0,
      width: 50,
    },
    {
      height: 50,
      id: '9b1495f4-2654-11ee-92c9-138314b60697',
      images: ['♙'],
      name: 'White Pawn',
      type: 0,
      width: 50,
    },
    {
      height: 50,
      id: '9b1495f5-2654-11ee-92c9-138314b60697',
      images: ['♘'],
      name: 'White Knight',
      type: 0,
      width: 50,
    },
    {
      height: 50,
      id: '9b1495e0-2654-11ee-92c9-138314b60697',
      images: ['♚'],
      name: 'Black King',
      type: 0,
      width: 50,
    },
    {
      height: 50,
      id: '9b1495e1-2654-11ee-92c9-138314b60697',
      images: ['♛'],
      name: 'Black Queen',
      type: 0,
      width: 50,
    },
    {
      height: 50,
      id: '9b1495e2-2654-11ee-92c9-138314b60697',
      images: ['♝'],
      name: 'Black Bisop',
      type: 0,
      width: 50,
    },
    {
      height: 50,
      id: '9b1495e3-2654-11ee-92c9-138314b60697',
      images: ['♜'],
      name: 'Black Rook',
      type: 0,
      width: 50,
    },
    {
      height: 50,
      id: '9b1495e4-2654-11ee-92c9-138314b60697',
      images: ['♟'],
      name: 'Black Pawn',
      type: 0,
      width: 50,
    },
    {
      height: 50,
      id: '9b1495e5-2654-11ee-92c9-138314b60697',
      images: ['♞'],
      name: 'Black Knight',
      type: 0,
      width: 50,
    },
  ],
  playerPieces: false,
  props: {
    attachments: [],
    bgHeight: '',
    bgUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chessboard_green_squares.svg/512px-Chessboard_green_squares.svg.png',
    bgWidth: '',
    pieces: {
      '01d98160-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '01d98160-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f4-2654-11ee-92c9-138314b60697',
        x: 408.8000183105469,
        y: 154,
      },
      '05afddc0-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '05afddc0-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f4-2654-11ee-92c9-138314b60697',
        x: 540.8000183105469,
        y: 154,
      },
      '0ab0d770-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '0ab0d770-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f4-2654-11ee-92c9-138314b60697',
        x: 472.8000183105469,
        y: 154,
      },
      '117293f0-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '117293f0-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f4-2654-11ee-92c9-138314b60697',
        x: 340.7875061035156,
        y: 154,
      },
      '4ff73770-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '4ff73770-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e4-2654-11ee-92c9-138314b60697',
        x: 88,
        y: 474,
      },
      '58fc2d30-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '58fc2d30-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e4-2654-11ee-92c9-138314b60697',
        x: 151.79998779296875,
        y: 474,
      },
      '5ba63e90-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '5ba63e90-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e4-2654-11ee-92c9-138314b60697',
        x: 217.79998779296875,
        y: 474,
      },
      '5e07fc50-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '5e07fc50-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e4-2654-11ee-92c9-138314b60697',
        x: 280.8000183105469,
        y: 474,
      },
      '6094c1b0-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '6094c1b0-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e4-2654-11ee-92c9-138314b60697',
        x: 347.8000183105469,
        y: 474,
      },
      '6317c310-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '6317c310-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e4-2654-11ee-92c9-138314b60697',
        x: 412.8000183105469,
        y: 474,
      },
      '65c88b30-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '65c88b30-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e4-2654-11ee-92c9-138314b60697',
        x: 474,
        y: 474,
      },
      '687a64c0-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '687a64c0-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e4-2654-11ee-92c9-138314b60697',
        x: 537,
        y: 474,
      },
      '73025100-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '73025100-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e0-2654-11ee-92c9-138314b60697',
        x: 344.8000183105469,
        y: 537,
      },
      '7d606e20-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '7d606e20-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e5-2654-11ee-92c9-138314b60697',
        x: 471.8000183105469,
        y: 537,
      },
      '83146420-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '83146420-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e5-2654-11ee-92c9-138314b60697',
        x: 150.79998779296875,
        y: 541.7999877929688,
      },
      '88a14a20-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '88a14a20-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e3-2654-11ee-92c9-138314b60697',
        x: 88,
        y: 540.7999877929688,
      },
      '8ba5fea0-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '8ba5fea0-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e3-2654-11ee-92c9-138314b60697',
        x: 540.8000183105469,
        y: 537,
      },
      '960c3210-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '960c3210-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e1-2654-11ee-92c9-138314b60697',
        x: 285.8000183105469,
        y: 537,
      },
      '9cca4510-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: '9cca4510-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e2-2654-11ee-92c9-138314b60697',
        x: 216.79998779296875,
        y: 537,
      },
      'a53d3400-272c-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: 'a53d3400-272c-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495e2-2654-11ee-92c9-138314b60697',
        x: 409.8000183105469,
        y: 537,
      },
      'dccb92f0-272b-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: 'dccb92f0-272b-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f0-2654-11ee-92c9-138314b60697',
        x: 344.7875061035156,
        y: 88,
      },
      'dd1f3130-272b-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: 'dd1f3130-272b-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f1-2654-11ee-92c9-138314b60697',
        x: 278.7875061035156,
        y: 88,
      },
      'dd7678f0-272b-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: 'dd7678f0-272b-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f2-2654-11ee-92c9-138314b60697',
        x: 218.78750610351562,
        y: 88,
      },
      'ddf51ed0-272b-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: 'ddf51ed0-272b-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f3-2654-11ee-92c9-138314b60697',
        x: 537,
        y: 88,
      },
      'deceb5f0-272b-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: 'deceb5f0-272b-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f4-2654-11ee-92c9-138314b60697',
        x: 88,
        y: 154,
      },
      'df358e10-272b-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: 'df358e10-272b-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f5-2654-11ee-92c9-138314b60697',
        x: 472.7875061035156,
        y: 88,
      },
      'ef603240-272b-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: 'ef603240-272b-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f5-2654-11ee-92c9-138314b60697',
        x: 151.78750610351562,
        y: 88,
      },
      'f2c07440-272b-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: 'f2c07440-272b-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f2-2654-11ee-92c9-138314b60697',
        x: 408.8000183105469,
        y: 88,
      },
      'f5731120-272b-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: 'f5731120-272b-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f3-2654-11ee-92c9-138314b60697',
        x: 88,
        y: 88,
      },
      'f8f7a400-272b-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: 'f8f7a400-272b-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f4-2654-11ee-92c9-138314b60697',
        x: 155.79998779296875,
        y: 154,
      },
      'fc8a40a0-272b-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: 'fc8a40a0-272b-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f4-2654-11ee-92c9-138314b60697',
        x: 214.60000610351562,
        y: 154,
      },
      'ff52d680-272b-11ee-b38c-d589530c7a77': {
        attachments: [],
        id: 'ff52d680-272b-11ee-b38c-d589530c7a77',
        imageIdx: 0,
        typeId: '9b1495f4-2654-11ee-92c9-138314b60697',
        x: 280.8000183105469,
        y: 154,
      },
    },
    players: [],
    turn: 0,
  },
  status: '',
  turns: true,
};

export const WORLD: Omit<BoardState, 'creator'> = {
  boundTo: [],
  max_players: 99,
  min_players: 1,
  name: 'World',
  pieceDefs: [],
  playerPieces: true,
  props: {
    attachments: [],
    bgHeight: '',
    bgUrl:
      'https://h5pstudio.ecampusontario.ca/sites/default/files/h5p/content/9451/images/image-5f6645b4ef14e.jpg',
    bgWidth: '1200',
    pieces: {},
    players: [],
    turn: 0,
  },
  status: '',
  turns: false,
};

export const CHECKERS: Omit<BoardState, 'creator'> = {
  boundTo: [],
  max_players: 2,
  min_players: 2,
  name: 'Checkers',
  pieceDefs: [
    {
      height: 50,
      id: 'b4b9bb30-682e-11ef-80b8-ff61d53bc280',
      images: ['⚫️'],
      name: 'Black',
      type: 0,
      width: 50,
    },
    {
      height: 50,
      id: 'baf298a0-682e-11ef-80b8-ff61d53bc280',
      images: ['🔴'],
      name: 'Red',
      type: 0,
      width: 50,
    },
  ],
  playerPieces: false,
  props: {
    attachments: [],
    bgHeight: '',
    bgUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chessboard_green_squares.svg/512px-Chessboard_green_squares.svg.png',
    bgWidth: '',
    pieces: {
      '017bd8e0-682f-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: '017bd8e0-682f-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'baf298a0-682e-11ef-80b8-ff61d53bc280',
        x: 345,
        y: 406.5,
      },
      '0431aa10-682f-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: '0431aa10-682f-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'baf298a0-682e-11ef-80b8-ff61d53bc280',
        x: 475,
        y: 408.5,
      },
      '05f8fc90-682f-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: '05f8fc90-682f-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'b4b9bb30-682e-11ef-80b8-ff61d53bc280',
        x: 151,
        y: 87.5,
      },
      '07507640-682f-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: '07507640-682f-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'b4b9bb30-682e-11ef-80b8-ff61d53bc280',
        x: 88,
        y: 153.5,
      },
      '08a557e0-682f-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: '08a557e0-682f-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'b4b9bb30-682e-11ef-80b8-ff61d53bc280',
        x: 156,
        y: 217.5,
      },
      '0ab17b90-682f-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: '0ab17b90-682f-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'b4b9bb30-682e-11ef-80b8-ff61d53bc280',
        x: 219,
        y: 152.5,
      },
      '0c994e60-682f-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: '0c994e60-682f-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'b4b9bb30-682e-11ef-80b8-ff61d53bc280',
        x: 283,
        y: 89.5,
      },
      '0df757c0-682f-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: '0df757c0-682f-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'b4b9bb30-682e-11ef-80b8-ff61d53bc280',
        x: 282,
        y: 216.5,
      },
      '0f455b90-682f-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: '0f455b90-682f-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'b4b9bb30-682e-11ef-80b8-ff61d53bc280',
        x: 346,
        y: 150.5,
      },
      '10fccf90-682f-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: '10fccf90-682f-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'b4b9bb30-682e-11ef-80b8-ff61d53bc280',
        x: 410,
        y: 90.5,
      },
      '12767740-682f-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: '12767740-682f-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'b4b9bb30-682e-11ef-80b8-ff61d53bc280',
        x: 408,
        y: 218.5,
      },
      '13e04070-682f-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: '13e04070-682f-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'b4b9bb30-682e-11ef-80b8-ff61d53bc280',
        x: 474,
        y: 151.5,
      },
      '156e8190-682f-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: '156e8190-682f-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'b4b9bb30-682e-11ef-80b8-ff61d53bc280',
        x: 538,
        y: 88.5,
      },
      '173f22e0-682f-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: '173f22e0-682f-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'b4b9bb30-682e-11ef-80b8-ff61d53bc280',
        x: 539,
        y: 216.5,
      },
      'da3c1650-682e-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: 'da3c1650-682e-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'baf298a0-682e-11ef-80b8-ff61d53bc280',
        x: 89,
        y: 538.5,
      },
      'e55fa650-682e-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: 'e55fa650-682e-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'baf298a0-682e-11ef-80b8-ff61d53bc280',
        x: 152,
        y: 473.5,
      },
      'e70d2f40-682e-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: 'e70d2f40-682e-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'baf298a0-682e-11ef-80b8-ff61d53bc280',
        x: 217,
        y: 538.5,
      },
      'e8ba1bf0-682e-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: 'e8ba1bf0-682e-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'baf298a0-682e-11ef-80b8-ff61d53bc280',
        x: 283,
        y: 474.5,
      },
      'eb06a400-682e-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: 'eb06a400-682e-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'baf298a0-682e-11ef-80b8-ff61d53bc280',
        x: 346,
        y: 536.5,
      },
      'ecd4ad40-682e-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: 'ecd4ad40-682e-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'baf298a0-682e-11ef-80b8-ff61d53bc280',
        x: 412,
        y: 475.5,
      },
      'ee5e8190-682e-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: 'ee5e8190-682e-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'baf298a0-682e-11ef-80b8-ff61d53bc280',
        x: 474,
        y: 537.5,
      },
      'f02a8f00-682e-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: 'f02a8f00-682e-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'baf298a0-682e-11ef-80b8-ff61d53bc280',
        x: 538,
        y: 473.5,
      },
      'fe061310-682e-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: 'fe061310-682e-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'baf298a0-682e-11ef-80b8-ff61d53bc280',
        x: 87,
        y: 408.5,
      },
      'ffafa460-682e-11ef-80b8-ff61d53bc280': {
        attachments: [],
        id: 'ffafa460-682e-11ef-80b8-ff61d53bc280',
        imageIdx: 0,
        typeId: 'baf298a0-682e-11ef-80b8-ff61d53bc280',
        x: 218,
        y: 408.5,
      },
    },
    players: ['uhCAkf_yXZslfKu0106-HaZzwwXR2OQi4U6pu47giv5T8dKEhn1Gb'],
    turn: 0,
  },
  status: '',
  turns: true,
};
