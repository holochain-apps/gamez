import { get, writable } from 'svelte/store';

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
      gameSpaceHash: string;
    };

const history: Route[] = [];
const route = writable<Route>({ id: 'home' });
const nav = (newRoute: Route) => {
  history.push(get(route));
  route.set(newRoute);
};
const goBack = () => {
  nav(history.pop());
};

export { route, nav, goBack };
