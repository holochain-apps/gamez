import {   type SynStore, WorkspaceStore, DocumentStore, type Commit } from "@holochain-syn/core";
import { Board } from "./board";
import { EntryRecord, LazyHoloHashMap, } from "@holochain-open-dev/utils";
import { derived, get, writable, type Readable, type Writable } from "svelte/store";
import type { BoardDelta, BoardState } from "./board";
import { type AgentPubKey, type EntryHash, decodeHashFromBase64, type EntryHashB64, type AgentPubKeyB64, encodeHashToBase64 } from "@holochain/client";
import {toPromise, type AsyncReadable, pipe, joinAsync, sliceAndJoin, asyncDerived, alwaysSubscribed} from '@holochain-open-dev/stores'
import type { v1 as uuidv1 } from "uuid";
import type { ProfilesStore } from "@holochain-open-dev/profiles";

export enum BoardType {
    active = "active",
    archived = "archived"
}

export interface TypedHash {
    hash: EntryHash
    type: BoardType
}

export interface BoardAndLatestState {
    board: Board,
    latestState: BoardState,
    tip: EntryHash,
}


export class BoardList {
    activeBoardHashes: AsyncReadable<EntryHash[]>
    archivedBoardHashes: AsyncReadable<EntryHash[]>
    activeBoard: Writable<Board| undefined> = writable(undefined)
    allBoards: AsyncReadable<ReadonlyMap<Uint8Array, BoardAndLatestState>>
    activeBoardHash: Writable<EntryHash| undefined> = writable(undefined)
    activeBoardHashB64: Readable<string| undefined> = derived(this.activeBoardHash, s=> s ? encodeHashToBase64(s): undefined)
    boardCount: AsyncReadable<number>

    boardData2 = new LazyHoloHashMap( documentHash => {
        const docStore = this.synStore.documents.get(documentHash)

        const board = pipe(docStore.allWorkspaces,
            workspaces => 
                new Board(docStore,  new WorkspaceStore(docStore, Array.from(workspaces.keys())[0]))
        )
        const latestState = pipe(board, 
            board => board.workspace.latestSnapshot
            )
        const tip = pipe(board,
            board => board.workspace.tip
            )
        return alwaysSubscribed(pipe(joinAsync([board, latestState, tip]), ([board, latestState, tip]) => {return {board,latestState, tip: tip ? tip.entryHash: undefined}}))
    })

    agentBoardHashes: LazyHoloHashMap<AgentPubKey, AsyncReadable<Array<BoardAndLatestState>>> = new LazyHoloHashMap(agent =>
        pipe(this.activeBoardHashes,
            documentHashes => joinAsync(documentHashes.map(documentHash=>this.synStore.documents.get(documentHash).allAuthors)),
            (documentsAuthors, documentHashes) => {
                const agentBoardHashes: AsyncReadable<BoardAndLatestState>[] = []
                const b64 = encodeHashToBase64(agent)
                for (let i = 0; i< documentsAuthors.length; i+=1) {
                    if (documentsAuthors[i].find(a=>encodeHashToBase64(a) == b64)) {
                        const hash = documentHashes[i]
                        //const state = this.boardData2.get(hash).workspace.latestSnapshot
                        //agentDocuments.push(asyncDerived(state, state=>{return {hash, state}}))
                        const x = this.boardData2.get(hash)
                        agentBoardHashes.push(x)
                    }
                }
                return joinAsync(agentBoardHashes)
            },
        )
    )
        
    allAgentBoards: AsyncReadable<ReadonlyMap<AgentPubKey, Array<BoardAndLatestState>>>
       
    constructor(public profilseStore: ProfilesStore, public synStore: SynStore) {
        this.allAgentBoards = pipe(this.profilseStore.agentsWithProfile,
            agents=>sliceAndJoin(this.agentBoardHashes, agents)
        )
   

        const boardHashes = asyncDerived(this.synStore.documentsByTag.get(BoardType.active),x=>Array.from(x.keys()))
        this.activeBoardHashes = boardHashes
        const archivedHashes = asyncDerived(this.synStore.documentsByTag.get(BoardType.archived),x=>Array.from(x.keys()))
        this.archivedBoardHashes = archivedHashes

        // const activeTypedHashes = asyncDerived(boardHashes, hashes=>hashes.map(hash=>{const h:TypedHash = {hash, type:BoardType.active}; return h}))
        // const archivedTypedHashes = asyncDerived(archivedHashes, hashes=>hashes.map(hash=>{const h:TypedHash = {hash,type:BoardType.archived}; return h}))

        // const joinedTyped = joinAsync([activeTypedHashes, archivedTypedHashes])
        // this.typedHashes = asyncDerived(joinedTyped, 
        //     ([active,archived]) => [...active, ...archived]
        //     )

        const joined = joinAsync([boardHashes, archivedHashes])

        const asyncJoined = asyncDerived(joined, 
            ([boards,archived]) => [...boards, ...archived]
            )
        this.allBoards = pipe(asyncJoined,
            docHashes => sliceAndJoin(this.boardData2, docHashes)
        )
        this.boardCount =  asyncDerived(joined,
            ([boards,archived]) => boards.length + archived.length
        )
    }

    async getBoard(documentHash: EntryHash) : Promise<Board | undefined> {
        if (!documentHash) return undefined
        const board = await toPromise(this.boardData2.get(documentHash))
        return board.board
    }

    async setActiveBoard(hash: EntryHash | undefined) {
        if (hash) {
            const board = (await toPromise(this.boardData2.get(hash))).board

            if (board) {
                await board.join()
                console.log("joined")
                this.activeBoard.update((n) => {return board} )
            } else {
                console.log("NO BOARD")
            }
        } else {
            this.activeBoard.update((n) => {return undefined} )
        }
        this.activeBoardHash.update((n) => {return hash} )
    }

    async archiveBoard(documentHash: EntryHash) {
        await this.synStore.client.removeDocumentTag(documentHash, BoardType.active)
        await this.synStore.client.tagDocument(documentHash, BoardType.archived)
        if (encodeHashToBase64(get(this.activeBoardHash)) == encodeHashToBase64(documentHash)) {
            await this.setActiveBoard(undefined)
        }
    }

    async unarchiveBoard(documentHash: EntryHash) {
        await this.synStore.client.removeDocumentTag(documentHash, BoardType.archived)
        await this.synStore.client.tagDocument(documentHash, BoardType.active)
    }

    async closeActiveBoard(leave: boolean) {
        const hash = get(this.activeBoardHash)
        if (hash) {
            if (leave) {
                const board = await this.getBoard(hash)
                if (board) await board.leave()
                else console.log("Board Not Found!")
            }
            this.setActiveBoard(undefined)
        }
    }


    async makeBoard(options: BoardState, fromHash?: EntryHashB64) : Promise<Board> {
        const board = await Board.Create(this.synStore)
        const sessionStore = board.session
        if (!options.name) {
            options.name = "untitled"
        }
        if (options !== undefined) {
            let changes : BoardDelta[] = [{
                type: "set-state",
                state: options
                },
            ]
            if (changes.length > 0) {
                board.requestChanges(changes)
                await sessionStore.commitChanges()
            }
        }
        return board
    }
}
