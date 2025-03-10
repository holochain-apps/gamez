import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readdirSync } from 'fs';
import path from 'path';
import UnoCSS from 'unocss/vite';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

import { dnaVersion, version } from './package.json';

// Import version from package.json

// https://vitejs.dev/config/
// @unocss-include
export default defineConfig({
  plugins: [
    svelte(),
    UnoCSS(),
    Icons({ compiler: 'svelte', defaultClass: 'block' }),
    checker({
      typescript: { tsconfigPath: path.resolve(__dirname, './tsconfig.json') },
    }),
  ],
  server: {
    hmr: {
      host: 'localhost',
    },
    watch: {
      usePolling: true,
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(version), // Define a global constant
    __DNA_VERSION__: JSON.stringify(dnaVersion), // Define a global constant
  },
  resolve: {
    alias: [{ find: '~', replacement: path.resolve(__dirname, './src') }],
  },
});
