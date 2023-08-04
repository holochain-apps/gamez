import type { RootStore, SynGrammar, WorkspaceStore } from "@holochain-syn/core";
import { get } from "svelte/store";
import { v1 as uuidv1 } from "uuid";
import { type AgentPubKey, type EntryHash, type EntryHashB64, encodeHashToBase64, type AgentPubKeyB64, type Timestamp } from "@holochain/client";

export enum PieceType {
  Emoji,
  Image,
}

export interface Piece {
  id: uuidv1,
  typeId: uuidv1
  x: number,
  y: number,
  imageIdx: number,
}

export class  PieceDef {
  id: uuidv1
  constructor(
    public type: PieceType,
    public name: string, 
    public height:number,
    public width: number,
    public images: Array<string> // possible things a piece can look like
    ){
      this.id = uuidv1()
  }
}

export type BoardProps = {
  pieces: {[key: string]: Piece},
  bgUrl: string,
  players: Array<AgentPubKeyB64>,
}

export interface BoardState {
  status: string;
  name: string;
  max_players: number;
  min_players: number;
  pieceDefs: PieceDef[];
  props: BoardProps;
}
  
  export type BoardDelta =
    | {
        type: "set-state";
        state: BoardState;
      }
    | {
        type: "set-status";
        status: string;
      }
    | {
        type: "set-name";
        name: string;
      }
    | {
        type: "set-player-range";
        min_players: number;
        max_players: number;
      }
    | {
        type: "set-props";
        props: BoardProps;
      }
    | {
        type: "set-piece-defs";
        pieceDefs: PieceDef[];
      }
    | {
        type: "add-player";
        player: AgentPubKeyB64;
      }
      | {
        type: "remove-player";
        player: AgentPubKeyB64;
      }
    | {
        type: "add-piece";
        pieceType: uuidv1;
        imageIdx: number;
        x: number;
        y: number;
      }
    | {
        type: "move-piece";
        id: uuidv1;
        x: number;
        y: number;
      }
  
  export type BoardGrammar = SynGrammar<
  BoardDelta,
  BoardState
  >;
  

  export const boardGrammar: BoardGrammar = {
    initState(state)  {
      state.status = ""
      state.name = "untitled"
      state.pieceDefs = []
      state.props = {bgUrl:"", pieces:{}, players:[]}
    },
    applyDelta( 
      delta: BoardDelta,
      state: BoardState,
      _ephemeralState: any,
      _author: AgentPubKey
    ) {
      switch (delta.type) {
        case "set-status":
          state.status = delta.status
          break;
        case "set-state":
          if (delta.state.status !== undefined) state.status = delta.state.status
          if (delta.state.name !== undefined) state.name = delta.state.name
          if (delta.state.pieceDefs !== undefined) state.pieceDefs = delta.state.pieceDefs
          if (delta.state.props !== undefined) state.props = delta.state.props
          if (delta.state.max_players !== undefined) state.max_players = delta.state.max_players
          if (delta.state.min_players !== undefined) state.min_players = delta.state.min_players
          break;
        case "set-name":
          state.name = delta.name
          break;
        case "set-player-range":
          state.min_players = delta.min_players
          state.max_players = delta.max_players
          break;
        case "set-props":
          state.props = delta.props
          break;
        case "set-piece-defs":
          state.pieceDefs = delta.pieceDefs
          break;
        case "add-player":
          if (state.props.players.length < state.max_players) 
            state.props.players.push(delta.player)
          break;
        case "remove-player":
          const index = state.props.players.findIndex((player) => player=== delta.player)
          if (index>=0) {
            state.props.players.splice(index,1)
          }
          break;
        case "add-piece":
          const id = uuidv1()
          const piece:Piece = {
            id,
            typeId: delta.pieceType,
            x: delta.x,
            y: delta.y,
            imageIdx: delta.imageIdx,
          }
          state.props.pieces[id]=piece
          break;
        case "move-piece":
          state.props.pieces[delta.id].x = delta.x
          state.props.pieces[delta.id].y = delta.y
          break;
        }
    },
  };
  

export const CommitTypeBoard :string = "board"

export class Board {    
    constructor(public workspace: WorkspaceStore<BoardGrammar>) {
    }

    public static async Create(rootStore: RootStore<BoardGrammar>) {
        const workspaceHash = await rootStore.createWorkspace(
            `${new Date}`,
            rootStore.root.entryHash
           );
        const me = new Board(await rootStore.joinWorkspace(workspaceHash));
        return me
    }

    hash() : EntryHash {
        return this.workspace.workspaceHash
    }
    hashB64() : EntryHashB64 {
        return encodeHashToBase64(this.workspace.workspaceHash)
    }
    close() {
        this.workspace.leaveWorkspace()
    }
    state(): BoardState {
        //@ts-ignore
        return get(this.workspace.state)
    }
    requestChanges(deltas: Array<BoardDelta>) {
        console.log("REQUESTING BOARD CHANGES: ", deltas)
        this.workspace.requestChanges(deltas)
    }
    participants()  {
        return this.workspace.participants
    }
    async commitChanges() {
        this.workspace.commitChanges()
    }
}
