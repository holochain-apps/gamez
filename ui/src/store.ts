import {
    type AppAgentClient,
    type AgentPubKeyB64,
    type RoleName,
    encodeHashToBase64,
    type AgentPubKey,
    type ActionHash,
    type Link,
    type EntryHash,
    decodeHashFromBase64,
    type DnaHash,
  } from '@holochain/client';
import { SynStore,  SynClient} from '@holochain-syn/core';
import type {  BoardState } from './board';
import { BoardList } from './boardList';
import TimeAgo from "javascript-time-ago"
import en from 'javascript-time-ago/locale/en'
import { CHESS, GO, WORLD } from './defaultGames';
import type { ProfilesStore } from '@holochain-open-dev/profiles';
import { EntryRecord, LazyHoloHashMap, ZomeClient } from '@holochain-open-dev/utils';
import { collectionStore, type AsyncReadable, latestVersionOfEntryStore, pipe, joinAsync, sliceAndJoin, asyncDerived, type Writable, writable, get, type Unsubscriber } from '@holochain-open-dev/stores';
import type { ActionCommittedSignal } from '@holochain-open-dev/utils';
import type { WeClient } from '@lightningrodlabs/we-applet';
import { HoloHashMap } from '@holochain-open-dev/utils/dist/holo-hash-map';
import { getMyDna } from './util';


TimeAgo.addDefaultLocale(en)

const ZOME_NAME = 'gamez'

export type BoardDef = 
{
    board: string
}

export type BoardDefData = 
{
    originalHash: ActionHash,
    board: BoardState,
    record: EntryRecord<BoardDef>,
}

export type EntryTypes =
  | ({ type: 'BoardDef' } & BoardDef);

export type GamezSignal = ActionCommittedSignal<EntryTypes, any>;

export class GamezClient extends ZomeClient<GamezSignal> {
    constructor(public client: AppAgentClient, public roleName, public zomeName = ZOME_NAME) {
        super(client, roleName, zomeName);
    }

    async createBoardDef(def: BoardState) : Promise<EntryRecord<BoardDef>> {
        return new EntryRecord(await this.callZome('create_board_def', {board: JSON.stringify(def)}))
    }
    async updateBoardDef(origHash: ActionHash, prevHash:ActionHash, def: BoardState) : Promise<EntryRecord<BoardDef>> {
        return new EntryRecord(await this.callZome('update_board_def', {
            original_board_def_hash: origHash,
            previous_board_def_hash: prevHash,
            updated_board_def: {board: JSON.stringify(def)}}))
    }
    async getBoardDefs() : Promise<Link[]> {
        const results = await this.callZome('get_board_defs', undefined)
        return results
    }
    async getBoardDef(hash: ActionHash) : Promise<EntryRecord<BoardDef>| undefined> {
        const record = await this.callZome('get_board_def', hash)
        if (!record) return undefined;

        const def: EntryRecord<BoardDef> = new EntryRecord(record);
        return def
    }
}

export enum SeenType {
    Tip="t",
}

export interface UIProps {
    tips: HoloHashMap<EntryHash,EntryHash>
}

export class GamezStore {
    myAgentPubKeyB64: AgentPubKeyB64
    timeAgo = new TimeAgo('en-US')
    boardList: BoardList;
    updating = false
    synStore: SynStore;
    client: GamezClient;
    defLinks: AsyncReadable<Link[]>
    defHashes: AsyncReadable<ActionHash[]>
    defs: LazyHoloHashMap<ActionHash,AsyncReadable<BoardDefData>> = new LazyHoloHashMap(
        (hash: ActionHash) => {
            const latestVersion = latestVersionOfEntryStore(this.client, () =>
                this.client.getBoardDef(hash)
            );
            const asyncBoard = pipe(latestVersion,
                record => JSON.parse(record.entry.board) as BoardState
                )
            return pipe(joinAsync([asyncBoard, latestVersion]), ([board, record]) => {return {originalHash: hash, board,record}})
        }
    )
    defsList: AsyncReadable<BoardDefData[]>
    uiProps: Writable<UIProps> 
    unsub: Unsubscriber
    dnaHash: DnaHash

    constructor(
        public weClient : WeClient,
        public profilesStore: ProfilesStore,
        protected clientIn: AppAgentClient,
        protected roleName: RoleName,
        protected zomeName: string = ZOME_NAME
    ) {
        this.client = new GamezClient(
            clientIn,
            this.roleName,
            this.zomeName
          );
        getMyDna(roleName, clientIn).then(res=>{
            this.dnaHash = res
          })
        this.myAgentPubKeyB64 = encodeHashToBase64(this.myAgentPubKey);

        this.synStore = new SynStore(new SynClient(clientIn,this.roleName,"syn"))
        this.boardList = new BoardList(profilesStore, this.synStore, weClient) 
        this.defLinks = collectionStore(
            this.client,
            () => this.client.getBoardDefs(),
            'AllBoardDefs'
          );
        this.defHashes = asyncDerived(this.defLinks,
            links=> links.map(link=>link.target)
        )
        this.defsList = pipe(this.defHashes, 
            hashes=> sliceAndJoin(this.defs,hashes),
            map=>Array.from(map.values())
        )
        this.boardList.activeBoard.subscribe((board)=>{
            if (this.unsub) {
                this.unsub()
                this.unsub = undefined
            }
            if (board != undefined) {
                this.unsub = board.workspace.tip.subscribe((tip)=>{
                    if (tip.status == "complete" && tip.value) {
                        this.updateSeenTip(board.hash, tip.value.entryHash)
                    }
                })
            }
        })

        this.uiProps = writable({
            tips: new HoloHashMap,
        })
        for (let i = 0; i < localStorage.length; i+=1){
            const key = localStorage.key(i)
            const [type, boardHashB64, cardId] = key.split(":")
            if (type == SeenType.Tip) {
                const tipB64 = localStorage.getItem(key)
                this.setSeenTip(decodeHashFromBase64(boardHashB64), decodeHashFromBase64(tipB64))
            }
        }
    }

    updateSeenTip(boardHash: EntryHash, tip:EntryHash) {
        localStorage.setItem(`${SeenType.Tip}:${encodeHashToBase64(boardHash)}`, encodeHashToBase64(tip))
        this.setSeenTip(boardHash, tip)
    }

    setSeenTip(boardHash:EntryHash, tip: EntryHash) {
        this.uiProps.update((n) => {
            n.tips.set(boardHash,tip)
            return n
        })
    }

    setUIprops(props:{}) {
        this.uiProps.update((n) => {
            Object.keys(props).forEach(key=>n[key] = props[key])
            return n
        })
    }

   
    get myAgentPubKey(): AgentPubKey {
        return this.client.client.myPubKey;
    }

    async makeGameType(board: BoardState) : Promise<any> {
        return await this.client.createBoardDef(board)
    }

    async addDefaultGames(name:string): Promise<any> {
        let board: BoardState
        switch(name) {
            case "Chess": 
                board = CHESS
                break;
            case "Go" :
                board = GO
                break;
            case "World":
                board = WORLD
                break;
        }
        if (board) {
            await this.client.createBoardDef(board)
        }
    }


}