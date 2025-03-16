import '@shoelace-style/shoelace/dist/themes/light.css';
import '@theweave/elements/dist/elements/select-asset-menu';
import '@unocss/reset/tailwind.css';
import 'svooltip/styles.css';
import 'virtual:uno.css';

import '@holochain-open-dev/profiles/dist/elements/create-profile.js';
import '@holochain-open-dev/profiles/dist/elements/profile-prompt.js';
import '@holochain-open-dev/profiles/dist/elements/profiles-context.js';

import './app.css';
import App from './App.svelte';
import clients from './clients';
import { appletServices } from './we';

(async () => {
  await clients.connect(appletServices);

  let app: App = null;
  function handleVisibilityChange() {
    if (app) return;

    if (document.visibilityState === 'visible') {
      app = new App({
        target: document.body,
        props: {},
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }

  handleVisibilityChange();
  document.addEventListener('visibilitychange', handleVisibilityChange);
})();
