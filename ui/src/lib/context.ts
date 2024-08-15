import { getContext, setContext } from 'svelte';

import { GamezStore } from '../shared/store';

export const setStoreContext = (getter: () => GamezStore) => setContext('store', { store: getter });
export const getStoreContext = () => getContext<{ store: () => GamezStore }>('store').store();
