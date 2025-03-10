// import { type AppletView, initializeHotReload, isWeaveContext, WeaveClient } from '@theweave/api';
import '@unocss/reset/tailwind.css';
import { mount } from 'svelte';
import 'virtual:uno.css';

import './app.css';
import App from './App.svelte';
import clients from './clients';
import { appletServices } from './we';

(async () => {
  await clients.connect(appletServices);

  let app: any = null;
  function handleVisibilityChange() {
    if (app) return;

    if (document.visibilityState === 'visible') {
      app = mount(App, {
        target: document.body,
        props: {},
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }

  handleVisibilityChange();
  document.addEventListener('visibilitychange', handleVisibilityChange);
})();
