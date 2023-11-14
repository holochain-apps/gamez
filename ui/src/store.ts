import {
    type AppAgentClient,
    type AgentPubKeyB64,
    type AppAgentCallZomeRequest,
    type RoleName,
    encodeHashToBase64,
    type AgentPubKey,
  } from '@holochain/client';
import { SynStore,  SynClient, type Commit } from '@holochain-syn/core';
import type {  BoardState } from './board';
import { BoardList } from './boardList';
import TimeAgo from "javascript-time-ago"
import en from 'javascript-time-ago/locale/en'
import { CHESS, GO } from './defaultGames';
import { v1 as uuidv1 } from "uuid";
import type { ProfilesStore } from '@holochain-open-dev/profiles';


TimeAgo.addDefaultLocale(en)

const ZOME_NAME = 'gamez'

export class GamezService {
    constructor(public client: AppAgentClient, public roleName, public zomeName = ZOME_NAME) {}

    private callZome(fnName: string, payload: any) {
        const req: AppAgentCallZomeRequest = {
            role_name: this.roleName,
            zome_name: this.zomeName,
            fn_name: fnName,
            payload
          }
        return this.client.callZome(req);
    }
}

export class GamezStore {
    myAgentPubKeyB64: AgentPubKeyB64
    timeAgo = new TimeAgo('en-US')
    service: GamezService;
    boardList: BoardList;
    updating = false
    synStore: SynStore;
    client: AppAgentClient;

    get myAgentPubKey(): AgentPubKey {
        return this.client.myPubKey;
    }

    constructor(
        public profilesStore: ProfilesStore,
        protected clientIn: AppAgentClient,
        protected roleName: RoleName,
        protected zomeName: string = ZOME_NAME
    ) {
        this.client = clientIn
        this.myAgentPubKeyB64 = encodeHashToBase64(this.client.myPubKey);
        this.service = new GamezService(
          this.client,
          this.roleName,
          this.zomeName
        );
        //@ts-ignore
        this.synStore = new SynStore(new SynClient(this.client,this.roleName,"syn"))
        this.boardList = new BoardList(profilesStore, this.synStore) 
    }

    async makeGameType(board: BoardState) : Promise<any> {
        alert("not implemented")
        // let changes = [{
        //     type: "add-board-type",
        //     boardType: {
        //         id: uuidv1(),
        //         name: board.name,
        //         board
        //     }},
        // ]
        // //@ts-ignore
        // this.boardList.requestChanges(changes)
        // await this.boardList.workspace.commitChanges()       
    }
    async addDefaultGames(name:string): Promise<any> {
        alert("not implemented")

        // let changes = []
        // switch(name) {
        //     case "Chess": changes.push({
        //         type: "add-board-type",
        //         boardType: {
        //             id: uuidv1(),
        //             name: "Chess",
        //             board:CHESS
        //         }})
        //         break;
        //     case "Go" :changes.push({
        //         type: "add-board-type",
        //         boardType: {
        //             id: uuidv1(),
        //             name: "Go",
        //             board:GO
        //         }})
        //         break;
        // }
        // if (changes.length>0) {
        //     //@ts-ignore
        //     this.boardList.requestChanges(changes)
        //     await this.boardList.workspace.commitChanges()
        // }
    }


}