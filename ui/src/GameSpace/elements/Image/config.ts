import { type ImageElement } from './type';

const config = {
  type: 'Image',
  version: 1,
  label: 'Image',
  icon: '🖼',
  build: (): Partial<ImageElement> => ({
    height: 250,
    width: 250,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chessboard_green_squares.svg/512px-Chessboard_green_squares.svg.png',
  }),
};

export default config;
