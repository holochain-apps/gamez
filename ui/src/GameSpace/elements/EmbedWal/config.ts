import { type EmbedWalElement } from './type';

const config = {
  type: 'EmbedWal',
  version: 1,
  label: 'Embed',
  icon: '📎',
  build: (): Partial<EmbedWalElement> => ({
    height: 200,
    width: 200,
    url: '',
  }),
};

export default config;
