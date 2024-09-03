import { getContext, setContext } from 'svelte';
import { writable } from 'svelte/store';

export type Route =
  | {
      id: 'home';
    }
  | {
      id: 'newGameDef';
    }
  | {
      id: 'editGameDef';
      defHash: Uint8Array;
    }
  | {
      id: 'editBoard';
      boardHash: Uint8Array;
    }
  | {
      id: 'board';
      boardHash: Uint8Array;
    }
  | {
      id: 'gameSpace';
      gameSpaceHash: Uint8Array;
    };

const route = writable<Route>({ id: 'home' });
const nav = (newRoute: Route) => {
  route.set(newRoute);
};

export { route, nav };

// export function setRouteContext(props: { nav: (newRoute: Route) => void; getRoute: () => Route }) {
//   setContext('route', props);
// }

// export function getRouteContext() {
//   return getContext<{ getRoute: () => Route; nav: (newRoute: Route) => void }>('route');
// }
