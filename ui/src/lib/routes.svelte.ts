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
let route = $state<Route>({ id: 'home' });
const nav = (newRoute: Route) => {
  history.push(route);
  route = newRoute;
};
const goBack = () => {
  nav(history.pop());
};

export default {
  get route() {
    return route;
  },
  nav,
  goBack,
};
