import { getContext, setContext } from 'svelte';

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
      id: 'board';
      boardHash: Uint8Array;
    };

export function setRouteContext({
  nav,
  route,
}: {
  nav: (newRoute: Route) => void;
  route: () => Route;
}) {
  setContext('route', { nav, route });
}

export function getRouteContext() {
  const { nav, route } = getContext<{ route: () => Route; nav: (newRoute: Route) => void }>(
    'route',
  );
  return { nav, route: route() };
}
