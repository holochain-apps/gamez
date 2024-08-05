import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";
import { version, dnaVersion } from "./package.json"; // Import version from package.json

// https://vitejs.dev/config/
// @unocss-include
export default defineConfig({
  plugins: [
    svelte(),
    UnoCSS(),
    Icons({ compiler: "svelte", defaultClass: "block" }),
  ],
  server: {
    hmr: {
      host: "localhost",
    },
    watch: {
      usePolling: true,
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(version), // Define a global constant
    __DNA_VERSION__: JSON.stringify(dnaVersion), // Define a global constant
  },
});
