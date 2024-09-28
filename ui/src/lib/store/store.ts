import { isWeaveContext, type WeaveClient } from '@theweave/api';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

import type { ProfilesStore } from '@holochain-open-dev/profiles';
import {
  asyncDerived,
  type AsyncReadable,
  collectionStore,
  get,
  joinAsync,
  latestVersionOfEntryStore,
  lazyLoad,
  pipe,
  sliceAndJoin,
  type Unsubscriber,
  type Writable,
  writable,
} from '@holochain-open-dev/stores';
import { EntryRecord, LazyHoloHashMap, ZomeClient } from '@holochain-open-dev/utils';
import type { ActionCommittedSignal } from '@holochain-open-dev/utils';
import { HoloHashMap } from '@holochain-open-dev/utils/dist/holo-hash-map';
import { SynClient, SynStore } from '@holochain-syn/core';
import {
  type ActionHash,
  type AgentPubKey,
  type AgentPubKeyB64,
  type AppClient,
  decodeHashFromBase64,
  type DnaHash,
  encodeHashToBase64,
  type EntryHash,
  type Link,
  type RoleName,
} from '@holochain/client';

import { getMyDna } from '../util';
import type { BoardState } from './board';
import { BoardList } from './boardList';
import * as defaultGames from './defaultGames';
import GamezClient, { type BoardDefData } from './GamezClient';

TimeAgo.addDefaultLocale(en);

export enum SeenType {
  Tip = 't',
}

export interface UIProps {
  tips: HoloHashMap<EntryHash, EntryHash>;
  showArchived: boolean;
}

export class GamezStore {
  myAgentPubKeyB64: AgentPubKeyB64;
  timeAgo = new TimeAgo('en-US');
  boardList: BoardList;
  updating = false;
  synStore: SynStore;
  client: GamezClient;
  defLinks: AsyncReadable<Link[]>;
  defHashes: AsyncReadable<ActionHash[]>;
  defs: LazyHoloHashMap<ActionHash, AsyncReadable<BoardDefData>> = new LazyHoloHashMap(
    (hash: ActionHash) => {
      const latestVersion = latestVersionOfEntryStore(this.client, () =>
        this.client.getBoardDef(hash),
      );
      const asyncBoard = pipe(
        latestVersion,
        (record) => JSON.parse(record.entry.board) as BoardState,
      );
      return pipe(joinAsync([asyncBoard, latestVersion]), ([board, record]) => {
        return { originalHash: hash, board, record };
      });
    },
  );
  defsList: AsyncReadable<BoardDefData[]>;
  uiProps: Writable<UIProps>;
  unsub: Unsubscriber;
  dnaHash: AsyncReadable<DnaHash>;
  agentIsSteward: AsyncReadable<boolean>;

  constructor(
    public weaveClient: WeaveClient,
    public profilesStore: ProfilesStore,
    protected clientIn: AppClient,
    protected roleName: RoleName,
  ) {
    this.client = new GamezClient(clientIn, this.roleName);
    this.dnaHash = lazyLoad(async () => {
      return await getMyDna(roleName, clientIn);
    });
    this.myAgentPubKeyB64 = encodeHashToBase64(this.myAgentPubKey);
    this.agentIsSteward = lazyLoad(async () => {
      return (
        !isWeaveContext() ||
        (isWeaveContext() && (await weaveClient.myGroupPermissionType()).type === 'Steward')
      );
    });

    // Board / Game Types definitions
    // Use zome

    this.defLinks = collectionStore(this.client, () => this.client.getBoardDefs(), 'AllBoardDefs');
    this.defHashes = asyncDerived(this.defLinks, (links) => links.map((link) => link.target));
    this.defsList = pipe(
      this.defHashes,
      (hashes) => sliceAndJoin(this.defs, hashes),
      (map) => Array.from(map.values()),
    );

    // Created Games boards
    // Use syn
    this.synStore = new SynStore(new SynClient(clientIn, this.roleName, 'syn'));
    this.boardList = new BoardList(profilesStore, this.synStore, weaveClient);
    this.boardList.activeBoard.subscribe((board) => {
      if (this.unsub) {
        this.unsub();
        this.unsub = undefined;
      }
      if (board != undefined) {
        this.unsub = board.workspace.tip.subscribe((tip) => {
          if (tip.status == 'complete' && tip.value) {
            this.updateSeenTip(board.hash, tip.value.entryHash);
          }
        });
      }
    });

    this.uiProps = writable({
      tips: new HoloHashMap(),
      showArchived: false,
    });

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      const [type, boardHashB64, cardId] = key.split(':');
      if (type == SeenType.Tip) {
        const tipB64 = localStorage.getItem(key);
        this.setSeenTip(decodeHashFromBase64(boardHashB64), decodeHashFromBase64(tipB64));
      }
    }
  }

  updateSeenTip(boardHash: EntryHash, tip: EntryHash) {
    localStorage.setItem(
      `${SeenType.Tip}:${encodeHashToBase64(boardHash)}`,
      encodeHashToBase64(tip),
    );
    this.setSeenTip(boardHash, tip);
  }

  setSeenTip(boardHash: EntryHash, tip: EntryHash) {
    this.uiProps.update((n) => {
      n.tips.set(boardHash, tip);
      return n;
    });
  }

  setUIprops(props: {}) {
    this.uiProps.update((n) => {
      Object.keys(props).forEach((key) => (n[key] = props[key]));
      return n;
    });
  }

  get myAgentPubKey(): AgentPubKey {
    return this.client.client.myPubKey;
  }

  async makeGameType(board: BoardState): Promise<any> {
    return await this.client.createBoardDef(board);
  }
}
