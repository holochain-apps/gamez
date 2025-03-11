import type { WeaveUrl } from '@theweave/api';
import { getContext as sGetContext, setContext as sSetContext } from 'svelte';

import clients from '~/clients';
import { colorSequence, exportAsJson, filterMap, importFromJson, toAsset, uuid } from '~/lib/util';

import { createDocsStore } from './docs.svelte';
import presets from './presets';
// import * as syn from './syn-store.svelte';
import {
  type AgentKey,
  type GElement,
  type Log,
  type NotificationsConfig,
  type PlayerSlot,
} from './types';

export type MainStore = ReturnType<typeof createMainStore>;

type GameSpacesMap = { [key: string]: GameSpace };

function createMainStore() {
  const docs = createDocsStore<GameSpace>(GameSpace.fromJSON);
  // const synStore = syn.createMainStore<GameSpace>();

  Object.entries(presets).forEach(([hash, preset]) => {
    if (!docs[hash]) {
      docs.setDocument(hash, GameSpace.fromJSON(preset));
    }
  });

  type Cmd =
    | ['create-gamespace', Partial<GameSpaceObject>]
    | ['import-from-json']
    | ['delete-gamespace', string]
    | ['archive', string]
    | ['unarchive', string]
    | ['export-as-json', string];

  async function commands(...cmd: Cmd) {
    switch (cmd[0]) {
      case 'create-gamespace': {
        return docs.createDocument(generateGameSpace(cmd[1] || {}));
        break;
      }
      case 'import-from-json': {
        const value = await importFromJson();
        const validState = validateGameSpace(value);
        if (validState) {
          validState.playersSlots = validState.playersSlots.map((s) => ({ ...s, pubKey: null }));
          validState.creator = clients.agentKeyB64;
          docs.createDocument(GameSpace.fromJSON(validState));
        } else {
          alert('Invalid game space');
        }
        break;
      }
      case 'export-as-json': {
        const gameSpace = docs.docs[cmd[1]]!;
        const filename = gameSpace.name.toLocaleLowerCase().replaceAll(/\s+/g, '-') + '.json';
        exportAsJson(filename, gameSpace);
        break;
      }
      case 'delete-gamespace': {
        docs.deleteDocument(cmd[1]);
        break;
      }
      case 'archive': {
        docs.updateDocument(cmd[1], { isArchived: true });
      }
      case 'unarchive': {
        docs.updateDocument(cmd[1], { isArchived: false });
      }
    }
  }

  let gameSpaces = $derived(filterMap(docs.docs, (d) => !d.isLibraryItem && !d.isArchived));
  let archivedGameSpaces = $derived(filterMap(docs.docs, (d) => !d.isLibraryItem && d.isArchived));
  let libraryItems = $derived(filterMap(docs.docs, (d) => d.isLibraryItem && !d.isArchived));
  let archivedLibraryItems = $derived(filterMap(docs.docs, (d) => d.isLibraryItem && d.isArchived));

  return {
    cmd: commands,
    get gameSpaces() {
      return gameSpaces;
    },
    get libraryItems() {
      return libraryItems;
    },
    get archivedGameSpaces() {
      return archivedGameSpaces;
    },
    get archivedLibraryItems() {
      return archivedLibraryItems;
    },
    get docs() {
      return docs.docs;
    },
  };
}

export const createStoreContext = () => sSetContext('main-store', createMainStore());
export const getContext = () => sGetContext<MainStore>('main-store');

//  ██████╗  █████╗ ███╗   ███╗███████╗    ███████╗██████╗  █████╗  ██████╗███████╗
// ██╔════╝ ██╔══██╗████╗ ████║██╔════╝    ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝
// ██║  ███╗███████║██╔████╔██║█████╗      ███████╗██████╔╝███████║██║     █████╗
// ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝      ╚════██║██╔═══╝ ██╔══██║██║     ██╔══╝
// ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗    ███████║██║     ██║  ██║╚██████╗███████╗
//  ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝    ╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝

const VERSION = 9;

type GameSpaceObject = {
  version: typeof VERSION;
  icon: string;
  name: string;
  creator: string;
  elements: GElement[];
  wals: WeaveUrl[];
  isStewarded: boolean;
  isLibraryItem: boolean;
  isArchived: boolean;
  playersSlots: PlayerSlot[];
  lastChangeAt: number;
  activityLog: Log[];
  notificationsConfigOverride: Record<AgentKey, Partial<NotificationsConfig>>;
};

type UiState = {
  zoom: number;
  panX: number;
  panY: number;
  surfaceContainer: HTMLDivElement;
};

export class GameSpace {
  version: typeof VERSION = VERSION;
  icon = $state('');
  name = $state('');
  creator = $state('');
  elements = $state<GElement[]>([]);
  wals = $state<WeaveUrl[]>([]);
  isStewarded = $state<boolean>(false);
  isLibraryItem = $state<boolean>(false);
  isArchived = $state<boolean>(false);
  playersSlots = $state<PlayerSlot[]>([]);
  lastChangeAt = $state<number>(0);
  activityLog = $state<Log[]>([]);
  notificationsConfigOverride = $state<Record<AgentKey, Partial<NotificationsConfig>>>({});

  ui = $state<UiState>({ zoom: 1, panX: 0, panY: 0, surfaceContainer: null });

  constructor(gs: GameSpaceObject) {
    this.icon = gs.icon;
    this.name = gs.name;
    this.creator = gs.creator;
    this.elements = gs.elements;
    this.wals = gs.wals;
    this.isStewarded = gs.isStewarded;
    this.isLibraryItem = gs.isLibraryItem;
    this.isArchived = gs.isArchived;
    this.playersSlots = gs.playersSlots;
    this.lastChangeAt = gs.lastChangeAt;
    this.activityLog = gs.activityLog;
    this.notificationsConfigOverride = gs.notificationsConfigOverride;
  }

  static fromJSON(gs: GameSpaceObject) {
    return new GameSpace(gs);
  }

  toJSON(): GameSpaceObject {
    return {
      version: this.version,
      icon: this.icon,
      name: this.name,
      creator: this.creator,
      elements: this.elements,
      wals: this.wals,
      isStewarded: this.isStewarded,
      isLibraryItem: this.isLibraryItem,
      isArchived: this.isArchived,
      playersSlots: this.playersSlots,
      lastChangeAt: this.lastChangeAt,
      activityLog: this.activityLog,
      notificationsConfigOverride: this.notificationsConfigOverride,
    };
  }

  participants = $derived.by(() => {
    return { active: [clients.agentKeyB64] };
  });

  canJoinGame = $derived.by(() => {
    if (this.isLibraryItem) return false;
    const alreadyJoined = !!this.playersSlots.find((s) => s.pubKey === clients.agentKeyB64);
    if (alreadyJoined) return false;
    const freeSlot = this.playersSlots.findIndex((p) => p.pubKey === null);
    if (freeSlot === -1) return false;
    return true;
  });

  canLeaveGame = $derived.by(() => {
    const alreadyJoined = !!this.playersSlots.find((s) => s.pubKey === clients.agentKeyB64);
    if (!alreadyJoined) return false;
    return true;
  });

  isSteward = $derived.by(() => {
    if (!this.isStewarded) return true;
    return this.creator === clients.agentKeyB64;
  });

  permissions = $derived.by(() => {
    const params = {
      isCreator: this.creator === clients.agentKeyB64,
      isPlaying: this.canLeaveGame,
      isArchived: this.isArchived,
    };
    const canEdit =
      ((params.isCreator || params.isPlaying) && !params.isArchived) || this.isLibraryItem;
    return {
      ...params,
      canJoin: this.canJoinGame,
      canLeave: this.canLeaveGame,
      canEditComponents: canEdit,
      canAddComponents: canEdit,
      canEditSpace: canEdit,
    };
  });

  getSurfaceCoordinates(clientX, clientY): { x: number; y: number } | null {
    const { left, top, width, height } = this.ui.surfaceContainer.getBoundingClientRect();
    if (clientX < left || clientX > left + width || clientY < top || clientY > top + height) {
      return null;
    }
    const surfaceX = clientX - left;
    const surfaceY = clientY - top;
    return { x: surfaceX / this.ui.zoom - this.ui.panX, y: surfaceY / this.ui.zoom - this.ui.panY };
  }

  getCurrentCenter(): { x: number; y: number } {
    const { width, height } = this.ui.surfaceContainer.getBoundingClientRect();
    return {
      x: width / 2 / this.ui.zoom - this.ui.panX,
      y: height / 2 / this.ui.zoom - this.ui.panY,
    };
  }

  topZ(pieceId: string = null) {
    const piece = pieceId ? this.elements.find((v) => v.uuid === pieceId) : null;
    const maxZ = this.elements.reduce((max, el) => (el.z > max ? el.z : max), 0);
    const maxZCount = this.elements.filter((v) => v.z === maxZ).length;
    const shouldIncreaseZ = piece ? piece.z < maxZ || (piece.z === maxZ && maxZCount > 1) : true;
    return shouldIncreaseZ ? maxZ + 1 : piece.z;
  }

  hash = $derived('');

  el(uuid: string) {
    return this.elements.find((e) => e.uuid === uuid);
  }

  async cmd(
    ...c:
      | ['join-session']
      | ['leave-session']
      | ['join-game']
      | ['leave-game']
      | ['add-to-pocket']
      | ['update', Partial<GameSpaceObject>]
      | ['add-element', GElement]
      | ['update-element', Partial<GElement>]
      | ['remove-element', string]
      | ['move-z', string, 'top' | 'bottom' | 'up' | 'down']
  ) {
    switch (c[0]) {
      case 'join-session': {
        break;
      }
      case 'leave-session': {
        break;
      }
      case 'add-to-pocket': {
        const asset = toAsset(this.hash);
        clients.weave.assets.assetToPocket(asset);
        break;
      }
      case 'update': {
        for (let key in c[1]) {
          this[key] = c[1][key];
        }
        break;
      }
      case 'join-game': {
        const freeSlot = this.playersSlots.findIndex((p) => p.pubKey === null);
        const alreadyPlaying = this.playersSlots.find((p) => p.pubKey === clients.agentKeyB64);
        if (freeSlot !== -1 && !alreadyPlaying) {
          this.playersSlots[freeSlot].pubKey = clients.agentKeyB64;
        }
        // addLog({ message: 'joined the game', type: 'join' });
        break;
      }
      case 'leave-game': {
        const playerIndex = this.playersSlots.findIndex((p) => p.pubKey === clients.agentKeyB64);
        if (playerIndex !== -1) {
          this.playersSlots[playerIndex].pubKey = null;
          // addLog({ message: 'left the game', type: 'left' });
        }
        break;
      }
      case 'add-element': {
        console.log('Adding element', c[1], this.elements);
        const maxZ = this.elements.reduce((max, el) => (el.z > max ? el.z : max), 0);
        const elementToAdd = { ...c[1], uuid: c[1].uuid || uuid(), z: maxZ + 1 };
        // $state.elements.push(elementToAdd);
        // const label = getLabel(elementToAdd.type);
        this.elements.push(elementToAdd);
        break;
      }
      case 'update-element': {
        this.elements.forEach((e) => {
          if (e.uuid === c[1].uuid) {
            for (const key in c[1]) {
              e[key] = c[1][key];
            }
          }
        });
        break;
      }
      case 'remove-element': {
        this.elements = this.elements.filter((e) => e.uuid === c[1]);
        break;
      }
      case 'move-z': {
        if (this.elements.length < 2) return;
        const el = this.el(c[1]);
        if (!el) return; // This could happen with some weird race condition if an element is deleted

        // Normalize the Z numbers to be sequential without spaces
        let sorted = [...this.elements];
        sorted.sort((a, b) => a.z - b.z);
        sorted.forEach((e, i) => {
          e.z = i; // This actually mutates the element
        });
        sorted = sorted.filter((e) => e.uuid !== el.uuid);

        const zShift = c[2];
        if (zShift === 'top') {
          sorted.push(el);
        } else if (zShift === 'bottom') {
          sorted.unshift(el);
        } else if (zShift === 'up') {
          const index = sorted.findIndex((e) => e.z > el.z);
          sorted.splice(index + 1, 0, el);
        } else if (zShift === 'down') {
          sorted.reverse();
          const index = sorted.findIndex((e) => e.z < el.z);
          sorted.splice(index + 1, 0, el);
          sorted.reverse();
        }

        sorted.forEach((e, i) => {
          e.z = i; // This actually mutates the element
        });
        break;
      }
    }
  }
}

export function generateGameSpace(gs: Partial<GameSpaceObject>): GameSpace {
  return GameSpace.fromJSON({
    version: 9,
    name: 'Game Space',
    icon: '♟',
    creator: clients.agentKeyB64,
    elements: [],
    wals: [],
    isStewarded: false,
    isLibraryItem: false,
    isArchived: false,
    playersSlots: [
      { color: colorSequence(0, 4), pubKey: null },
      { color: colorSequence(1, 4), pubKey: null },
      { color: colorSequence(2, 4), pubKey: null },
      { color: colorSequence(3, 4), pubKey: null },
    ],
    lastChangeAt: Date.now(),
    activityLog: [],
    notificationsConfigOverride: {},
    ...gs,
  });
}

function validateGameSpace(inputData: any): GameSpace | null {
  let data = { ...inputData };
  // TODO: Use JSON schema and some automatic validation
  if (typeof data.version !== 'number') return null;

  if (data.version !== VERSION) {
    data = migration(data);
    if (data.version !== VERSION) throw new Error(`Version is not ${VERSION} and couldn't migrate`);
  }

  if (typeof data.name !== 'string') throw new Error(`'name' must be a string`);
  if (!data.elements || !Array.isArray(data.elements))
    throw new Error(`'elements' must be an array`);
  if (!data.wals || !Array.isArray(data.wals)) throw new Error(`'wals' must be an array`);
  if (typeof data.isStewarded !== 'boolean') throw new Error(`'isStewarded' must be a boolean`);
  if (typeof data.isArchived !== 'boolean') throw new Error(`'isArchived' must be a boolean`);
  if (typeof data.isLibraryItem !== 'boolean') throw new Error(`'isLibraryItem' must be a boolean`);
  if (!data.playersSlots || !Array.isArray(data.playersSlots))
    throw new Error(`'playersSlots' must be an array slot and pubKey properties`);
  if (typeof data.lastChangeAt !== 'number') throw new Error(`'lastChangeAt' must be a number`);

  return data as GameSpace;
}

function migration(gottenState: GameSpace): GameSpace {
  if ((gottenState.version as 3) === 3) {
    gottenState.lastChangeAt = Date.now();
    // @ts-ignore
    gottenState.version = 4;
  }
  if ((gottenState.version as 4) === 4) {
    const status = (gottenState as any).status;
    gottenState.isArchived = false;
    gottenState.isLibraryItem = false;
    if (status === 'archived') gottenState.isArchived = true;
    if (status === 'library') gottenState.isLibraryItem = true;
    // @ts-ignore
    delete gottenState.status;
    // @ts-ignore
    gottenState.version = 5;
  }

  if ((gottenState.version as 5) === 5) {
    const max = (gottenState as any)?.minMaxPlayers[1] || 0;
    gottenState.playersSlots = [];
    for (let i = 0; i < max; i++) {
      gottenState.playersSlots.push({
        color: colorSequence(i, max),
        pubKey: (gottenState as any)?.players[i] || null,
      });
    }
    // @ts-ignore
    gottenState.version = 6;
  }

  if ((gottenState.version as 6) === 6) {
    gottenState.elements.forEach((el) => {
      if (el.type === 'TurnTracker') {
        if ((el.version as 1) === 1) {
          el.showEmptyPlayersSlots = true;
          el.turnsLog.forEach((tl) => {
            const oldTl = tl as unknown as { player: null | string };
            if (oldTl.player === null) {
              tl.playerSlot = -1;
            } else if (oldTl.player) {
              const index = gottenState.playersSlots.findIndex((p) => p.pubKey === oldTl.player);
              // The player might have left the game
              // In that case we don't have the information about which player slot it was on, so let's just assign slot 0
              tl.playerSlot = index !== -1 ? index : 0;
            }
            delete oldTl.player;
          });
          el.version = 2;
        }
      }

      if (el.type === 'PlayerPiece') {
        if ((el.version as 2) === 2) {
          el.version = 3;
          const agent = (el as any).agent;
          el.playerSlot = gottenState.playersSlots.findIndex((p) => p.pubKey === agent) || 0;
          delete (el as any).agent;
          delete (el as any).colorRing;
        }
      }

      if (el.type === 'Dice') {
        if ((el.version as 1) === 1) {
          el.rolls.forEach((roll) => {
            if ((roll as any).player) {
              roll.playerSlot =
                gottenState.playersSlots.findIndex((p) => p.pubKey === (roll as any).player) || 0;
            }
          });
        }
      }
    });
    // @ts-ignore
    gottenState.version = 7;
  }

  if ((gottenState.version as 7) === 7) {
    gottenState.icon = '♟';
    // @ts-ignore
    gottenState.version = 8;
  }

  return gottenState;
}
