import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import UnoCSS from 'unocss/vite';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

import { dnaVersion, version } from './package.json';

// Import version from package.json

// https://vitejs.dev/config/
// @unocss-include
export default defineConfig({
  plugins: [svelte(), UnoCSS(), Icons({ compiler: 'svelte', defaultClass: 'block' })],
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
    alias: {
      // Well this is not ideal
      '~/BoardEditor': path.resolve(__dirname, './src/BoardEditor'),
      '~/Home': path.resolve(__dirname, './src/Home'),
      '~/GamezPane': path.resolve(__dirname, './src/GamezPane'),
      '~/Layout': path.resolve(__dirname, './src/Layout'),
      '~/shared': path.resolve(__dirname, './src/shared'),
      '~/lib': path.resolve(__dirname, './src/lib'),
    },
  },
});
