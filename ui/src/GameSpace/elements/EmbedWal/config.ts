import { type EmbedWalElement, VERSION } from './type';

const config = {
  type: 'EmbedWal',
  version: VERSION,
  label: 'Embed',
  icon: '📎',
  build: (): Partial<EmbedWalElement> => ({
    height: 200,
    width: 200,
    url: '',
    preview: true,
    storedHeight: 200,
  }),
};

export default config;
