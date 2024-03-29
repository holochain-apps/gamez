import type { BoardState } from "./board";

enum PieceType {
    Emoji,
    Image,
  }
  
export const GO: BoardState = 
{
    "name": "Go",
    "status": "",
    "max_players": 2,
    "min_players": 2,
    "turns" : true,
    "playerPieces" : false,
    "boundTo": [],
    "pieceDefs": [
        {
            "type": PieceType.Emoji,
            "images": [
                "⚪️"
            ],
            "height":25,
            "width":25,
            "name": "White",
            "id": "04dccef0-272f-11ee-b38c-d589530c7a77"
        },
        {
            "type": PieceType.Emoji,
            "images": [
                "⚫️"
            ],
            "height":25,
            "width":25,
            "name": "Black",
            "id": "13f82600-272f-11ee-b38c-d589530c7a77"
        }
    ],
    "props": {
        "bgUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Blank_Go_board.svg/600px-Blank_Go_board.svg.png?20140621020717",
        "bgHeight": "",
        "bgWidth": "",
        "pieces": {
        },
        "players": [],
        "attachments": [],
        "turn": 0,
    },
}

export const CHESS : BoardState = 
{
    "status": "",
    "max_players": 2,
    "min_players": 2,
    "turns": true,
    "playerPieces" : false,
    "name": "Chess",
    "boundTo": [],
    "pieceDefs": [
        {
            "type": PieceType.Emoji,
            "images": [
                "♔"
            ],
            "height":50,
            "width":50,
            "name": "White King",
            "id": "9b1495f0-2654-11ee-92c9-138314b60697"
        },
        {
            "type": PieceType.Emoji,
            "images": [
                "♕"
            ],
            "height":50,
            "width":50,
            "name": "White Queen",
            "id": "9b1495f1-2654-11ee-92c9-138314b60697"
        },
        {
            "type": PieceType.Emoji,
            "images": [
                "♗"
            ],
            "height":50,
            "width":50,
            "name": "White Bisop",
            "id": "9b1495f2-2654-11ee-92c9-138314b60697"
        },
        {
            "type": PieceType.Emoji,
            "images": [
                "♖"
            ],
            "height":50,
            "width":50,
            "name": "White Rook",
            "id": "9b1495f3-2654-11ee-92c9-138314b60697"
        },
        {
            "type": PieceType.Emoji,
            "images": [
                "♙"
            ],
            "height":50,
            "width":50,
            "name": "White Pawn",
            "id": "9b1495f4-2654-11ee-92c9-138314b60697"
        },
        {
            "type": PieceType.Emoji,
            "images": [
                "♘"
            ],
            "height":50,
            "width":50,
            "name": "White Knight",
            "id": "9b1495f5-2654-11ee-92c9-138314b60697"
        },
        {
            "type": PieceType.Emoji,
            "images": [
                "♚"
            ],
            "height":50,
            "width":50,
            "name": "Black King",
            "id": "9b1495e0-2654-11ee-92c9-138314b60697"
        },
        {
            "type": PieceType.Emoji,
            "images": [
                "♛"
            ],
            "height":50,
            "width":50,
            "name": "Black Queen",
            "id": "9b1495e1-2654-11ee-92c9-138314b60697"
        },
        {
            "type": PieceType.Emoji,
            "images": [
                "♝"
            ],
            "height":50,
            "width":50,
            "name": "Black Bisop",
            "id": "9b1495e2-2654-11ee-92c9-138314b60697"
        },
        {
            "type": PieceType.Emoji,
            "images": [
                "♜"
            ],
            "height":50,
            "width":50,
            "name": "Black Rook",
            "id": "9b1495e3-2654-11ee-92c9-138314b60697"
        },
        {
            "type": PieceType.Emoji,
            "images": [
                "♟"
            ],
            "height":50,
            "width":50,
            "name": "Black Pawn",
            "id": "9b1495e4-2654-11ee-92c9-138314b60697"
        },
        {
            "type": PieceType.Emoji,
            "images": [
                "♞"
            ],
            "height":50,
            "width":50,
            "name": "Black Knight",
            "id": "9b1495e5-2654-11ee-92c9-138314b60697"
        }
    ],
    "props": {
        "attachments": [],
        "players": [],
        "turn": 0,
        "bgUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chessboard_green_squares.svg/512px-Chessboard_green_squares.svg.png",
        "bgHeight": "",
        "bgWidth": "",
        "pieces": {
            "01d98160-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "01d98160-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f4-2654-11ee-92c9-138314b60697",
                "x": 432,
                "y": 158
            },
            "05afddc0-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "05afddc0-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f4-2654-11ee-92c9-138314b60697",
                "x": 559,
                "y": 163
            },
            "0ab0d770-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "0ab0d770-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f4-2654-11ee-92c9-138314b60697",
                "x": 497,
                "y": 161
            },
            "117293f0-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "117293f0-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f4-2654-11ee-92c9-138314b60697",
                "x": 369.9914855957031,
                "y": 158.98863220214844
            },
            "4ff73770-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "4ff73770-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e4-2654-11ee-92c9-138314b60697",
                "x": 111.98861694335938,
                "y": 478.9971466064453
            },
            "58fc2d30-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "58fc2d30-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e4-2654-11ee-92c9-138314b60697",
                "x": 175,
                "y": 474
            },
            "5ba63e90-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "5ba63e90-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e4-2654-11ee-92c9-138314b60697",
                "x": 237,
                "y": 482
            },
            "5e07fc50-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "5e07fc50-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e4-2654-11ee-92c9-138314b60697",
                "x": 305,
                "y": 475
            },
            "6094c1b0-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "6094c1b0-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e4-2654-11ee-92c9-138314b60697",
                "x": 367,
                "y": 480
            },
            "6317c310-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "6317c310-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e4-2654-11ee-92c9-138314b60697",
                "x": 432,
                "y": 475
            },
            "65c88b30-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "65c88b30-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e4-2654-11ee-92c9-138314b60697",
                "x": 496,
                "y": 479
            },
            "687a64c0-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "687a64c0-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e4-2654-11ee-92c9-138314b60697",
                "x": 559,
                "y": 478
            },
            "73025100-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "73025100-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e0-2654-11ee-92c9-138314b60697",
                "x": 364,
                "y": 543
            },
            "7d606e20-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "7d606e20-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e5-2654-11ee-92c9-138314b60697",
                "x": 497,
                "y": 540
            },
            "83146420-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "83146420-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e5-2654-11ee-92c9-138314b60697",
                "x": 174,
                "y": 541
            },
            "88a14a20-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "88a14a20-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e3-2654-11ee-92c9-138314b60697",
                "x": 107,
                "y": 543
            },
            "8ba5fea0-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "8ba5fea0-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e3-2654-11ee-92c9-138314b60697",
                "x": 560,
                "y": 542
            },
            "960c3210-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "960c3210-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e1-2654-11ee-92c9-138314b60697",
                "x": 303,
                "y": 548
            },
            "9cca4510-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "9cca4510-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e2-2654-11ee-92c9-138314b60697",
                "x": 235,
                "y": 540
            },
            "a53d3400-272c-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "a53d3400-272c-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495e2-2654-11ee-92c9-138314b60697",
                "x": 430,
                "y": 543
            },
            "dccb92f0-272b-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "dccb92f0-272b-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f0-2654-11ee-92c9-138314b60697",
                "x": 359.9942932128906,
                "y": 96.98863220214844
            },
            "dd1f3130-272b-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "dd1f3130-272b-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f1-2654-11ee-92c9-138314b60697",
                "x": 306.9886169433594,
                "y": 97.99430847167969
            },
            "dd7678f0-272b-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "dd7678f0-272b-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f2-2654-11ee-92c9-138314b60697",
                "x": 250.99716186523438,
                "y": 99
            },
            "ddf51ed0-272b-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "ddf51ed0-272b-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f3-2654-11ee-92c9-138314b60697",
                "x": 557.9942932128906,
                "y": 93.99147033691406
            },
            "deceb5f0-272b-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "deceb5f0-272b-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f4-2654-11ee-92c9-138314b60697",
                "x": 113.99148559570312,
                "y": 159.99147033691406
            },
            "df358e10-272b-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "df358e10-272b-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f5-2654-11ee-92c9-138314b60697",
                "x": 493.9886169433594,
                "y": 95.98863220214844
            },
            "ef603240-272b-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "ef603240-272b-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f5-2654-11ee-92c9-138314b60697",
                "x": 177.99148559570312,
                "y": 94.99147033691406
            },
            "f2c07440-272b-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "f2c07440-272b-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f2-2654-11ee-92c9-138314b60697",
                "x": 424,
                "y": 97
            },
            "f5731120-272b-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "f5731120-272b-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f3-2654-11ee-92c9-138314b60697",
                "x": 109.90908813476562,
                "y": 94.93182373046875
            },
            "f8f7a400-272b-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "f8f7a400-272b-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f4-2654-11ee-92c9-138314b60697",
                "x": 182,
                "y": 158
            },
            "fc8a40a0-272b-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "fc8a40a0-272b-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f4-2654-11ee-92c9-138314b60697",
                "x": 241,
                "y": 160
            },
            "ff52d680-272b-11ee-b38c-d589530c7a77": {
                "attachments": [ ], "id": "ff52d680-272b-11ee-b38c-d589530c7a77",
                "imageIdx": 0,
                "typeId": "9b1495f4-2654-11ee-92c9-138314b60697",
                "x": 307,
                "y": 161
            }
        }
    },
}

export const WORLD: BoardState = {
    "boundTo": [],
    "max_players": 99,
    "min_players": 1,
    "name": "World",
    "pieceDefs": [],
    "playerPieces": true,
    "props": {
        "attachments": [],
        "bgHeight": "",
        "bgUrl": "https://h5pstudio.ecampusontario.ca/sites/default/files/h5p/content/9451/images/image-5f6645b4ef14e.jpg",
        "bgWidth": "1200",
        "pieces": {},
        "players": [
        ],
        "turn": 0
    },
    "status": "",
    "turns": false
}