import type { WeaveClient } from '@theweave/api';
import { derived, get, type Readable, writable, type Writable } from 'svelte/store';

import type { ProfilesStore } from '@holochain-open-dev/profiles';
import {
  alwaysSubscribed,
  asyncDerived,
  type AsyncReadable,
  joinAsync,
  pipe,
  sliceAndJoin,
  toPromise,
} from '@holochain-open-dev/stores';
import type { AsyncStatus } from '@holochain-open-dev/stores';
import { EntryRecord, LazyHoloHashMap } from '@holochain-open-dev/utils';
import {
  type Commit,
  type Document,
  DocumentStore,
  type SynStore,
  WorkspaceStore,
} from '@holochain-syn/core';
import {
  type AgentPubKey,
  type AgentPubKeyB64,
  decodeHashFromBase64,
  encodeHashToBase64,
  type EntryHash,
  type EntryHashB64,
  type Timestamp,
} from '@holochain/client';

import { Board } from './board';
import type { BoardDelta, BoardState } from './board';
import { SeenType } from './store';

export enum BoardType {
  active = 'active',
  archived = 'archived',
  deleted = 'deleted',
}

export interface TypedHash {
  hash: EntryHash;
  type: BoardType;
}

export interface BoardAndLatestState {
  board: Board;
  latestState: BoardState;
  tip: EntryRecord<Commit> | undefined;
  document: EntryRecord<Document>;
}

export class BoardList {
  activeBoardHashes: AsyncReadable<EntryHash[]>;
  archivedBoardHashes: AsyncReadable<EntryHash[]>;
  activeBoard: Writable<Board | undefined> = writable(undefined);
  allBoards: AsyncReadable<ReadonlyMap<Uint8Array, BoardAndLatestState>>;
  activeBoardHash: Writable<EntryHash | undefined> = writable(undefined);
  activeBoardHashB64: Readable<string | undefined> = derived(this.activeBoardHash, (s) =>
    s ? encodeHashToBase64(s) : undefined,
  );
  boardCount: AsyncReadable<number>;

  boardData2 = new LazyHoloHashMap((documentHash) => {
    const docStore = this.synStore.documents.get(documentHash);

    const board = pipe(docStore.allWorkspaces, (workspaces) => {
      const board = new Board(
        docStore,
        new WorkspaceStore(docStore, Array.from(workspaces.keys())[0]),
      );
      // TODO: fix once we know if our applet is in front or not.
      if (this.weaveClient) {
        board.workspace.tip.subscribe((tip) => {
          if (tip.status == 'complete' && tip.value) {
            const tipRecord = tip.value;
            const tipB64 = encodeHashToBase64(tipRecord.entryHash);
            const key = `${SeenType.Tip}:${board.hashB64}`;
            const seenTipB64 = localStorage.getItem(key);
            const activeBoard = get(this.activeBoard);

            if (
              tipB64 != seenTipB64 &&
              (!activeBoard || encodeHashToBase64(activeBoard.hash) != board.hashB64)
            ) {
              this.weaveClient.notifyFrame([
                {
                  title: `Board updated`,
                  body: '',
                  notification_type: 'change',
                  icon_src: undefined,
                  urgency: 'low',
                  timestamp: Date.now(),
                },
              ]);
            }
          }
        });
      }
      return board;
    });
    const latestState = pipe(board, (board) => board.workspace.latestState);
    const tip = pipe(board, (board) => board.workspace.tip);
    const document = pipe(docStore.record, (document) => document);

    return alwaysSubscribed(
      pipe(
        joinAsync([board, latestState, tip, document]),
        ([board, latestState, tip, document]) => {
          return { board, latestState, tip: tip ? tip : undefined, document };
        },
      ),
    );
  });

  agentBoardHashes: LazyHoloHashMap<AgentPubKey, AsyncReadable<Array<BoardAndLatestState>>> =
    new LazyHoloHashMap((agent) =>
      pipe(
        this.activeBoardHashes,
        (documentHashes) =>
          joinAsync(
            documentHashes.map(
              (documentHash) => this.synStore.documents.get(documentHash).allAuthors,
            ),
          ),
        (documentsAuthors, documentHashes) => {
          const agentBoardHashes: AsyncReadable<BoardAndLatestState>[] = [];
          const b64 = encodeHashToBase64(agent);
          for (let i = 0; i < documentsAuthors.length; i += 1) {
            if (documentsAuthors[i].find((a) => encodeHashToBase64(a) == b64)) {
              const hash = documentHashes[i];
              //const state = this.boardData2.get(hash).workspace.latestSnapshot
              //agentDocuments.push(asyncDerived(state, state=>{return {hash, state}}))
              const x: Readable<AsyncStatus<BoardAndLatestState>> = this.boardData2.get(hash);
              agentBoardHashes.push(x);
            }
          }
          return joinAsync(agentBoardHashes);
        },
      ),
    );

  allAgentBoards: AsyncReadable<ReadonlyMap<AgentPubKey, Array<BoardAndLatestState>>>;

  constructor(
    public profilesStore: ProfilesStore,
    public synStore: SynStore,
    public weaveClient: WeaveClient,
  ) {
    this.allAgentBoards = pipe(this.profilesStore.agentsWithProfile, (agents) =>
      sliceAndJoin(this.agentBoardHashes, agents),
    );

    const boardHashes = asyncDerived(this.synStore.documentsByTag.get(BoardType.active), (x) =>
      Array.from(x.keys()),
    );
    this.activeBoardHashes = boardHashes;
    const archivedHashes = asyncDerived(this.synStore.documentsByTag.get(BoardType.archived), (x) =>
      Array.from(x.keys()),
    );
    this.archivedBoardHashes = archivedHashes;

    // const activeTypedHashes = asyncDerived(boardHashes, hashes=>hashes.map(hash=>{const h:TypedHash = {hash, type:BoardType.active}; return h}))
    // const archivedTypedHashes = asyncDerived(archivedHashes, hashes=>hashes.map(hash=>{const h:TypedHash = {hash,type:BoardType.archived}; return h}))

    // const joinedTyped = joinAsync([activeTypedHashes, archivedTypedHashes])
    // this.typedHashes = asyncDerived(joinedTyped,
    //     ([active,archived]) => [...active, ...archived]
    //     )

    const joined = joinAsync([boardHashes, archivedHashes]);

    const asyncJoined = asyncDerived(joined, ([boards, archived]) => [...boards, ...archived]);
    this.allBoards = pipe(asyncJoined, (docHashes) => sliceAndJoin(this.boardData2, docHashes));
    this.boardCount = asyncDerived(joined, ([boards, archived]) => boards.length + archived.length);
  }

  async getBoard(documentHash: EntryHash): Promise<Board | undefined> {
    if (!documentHash) return undefined;
    const board = await toPromise(this.boardData2.get(documentHash));
    return board.board;
  }

  async setActiveBoard(hash: EntryHash | undefined) {
    if (hash) {
      const board = (await toPromise(this.boardData2.get(hash))).board;

      if (board) {
        await board.join();
        console.log('joined');
        this.activeBoard.update((n) => {
          return board;
        });
      } else {
        console.log('NO BOARD');
      }
    } else {
      this.activeBoard.update((n) => {
        return undefined;
      });
    }
    this.activeBoardHash.update((n) => {
      return hash;
    });
  }

  async archiveBoard(documentHash: EntryHash) {
    await this.synStore.client.removeDocumentTag(documentHash, BoardType.active);
    await this.synStore.client.tagDocument(documentHash, BoardType.archived);
    if (encodeHashToBase64(get(this.activeBoardHash)) == encodeHashToBase64(documentHash)) {
      await this.setActiveBoard(undefined);
    }
  }

  async deleteBoard(documentHash: EntryHash) {
    await this.synStore.client.removeDocumentTag(documentHash, BoardType.active);
    await this.synStore.client.removeDocumentTag(documentHash, BoardType.archived);
    await this.synStore.client.tagDocument(documentHash, BoardType.deleted);
    if (encodeHashToBase64(get(this.activeBoardHash)) == encodeHashToBase64(documentHash)) {
      await this.setActiveBoard(undefined);
    }
  }

  async unarchiveBoard(documentHash: EntryHash) {
    await this.synStore.client.removeDocumentTag(documentHash, BoardType.archived);
    await this.synStore.client.tagDocument(documentHash, BoardType.active);
  }

  async closeActiveBoard(leave: boolean) {
    const hash = get(this.activeBoardHash);
    if (hash) {
      if (leave) {
        const board = await this.getBoard(hash);
        if (board) await board.leave();
        else console.log('Board Not Found!');
      }
      this.setActiveBoard(undefined);
    }
  }

  async makeBoard(options: BoardState): Promise<Board> {
    if (!options.name) {
      options.name = 'untitled';
    }
    const board = await Board.Create(this.synStore, options);
    return board;
  }
}
