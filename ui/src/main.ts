import { type AppletView, initializeHotReload, isWeaveContext, WeaveClient } from '@theweave/api';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';

import './app.css';
import App from './App.svelte';
import { appletServices } from './we';

(async () => {
  if ((import.meta as any).env.DEV) {
    try {
      await initializeHotReload();
    } catch (e) {
      console.warn(
        'Could not initialize applet hot-reloading. This is only expected to work in a We context in dev mode.',
      );
    }
  }

  const weaveClient = isWeaveContext() ? await WeaveClient.connect(appletServices) : null;

  let app: App = null;
  function handleVisibilityChange() {
    if (app) return;

    if (document.visibilityState === 'visible') {
      app = new App({
        target: document.body,
        props: { weaveClient },
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }

  handleVisibilityChange();
  document.addEventListener('visibilitychange', handleVisibilityChange);
})();
