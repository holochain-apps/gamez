import type { DocumentStore, WorkspaceStore, SessionStore, SynStore } from "@holochain-syn/core";
import { get, type Readable } from "svelte/store";
import { v1 as uuidv1 } from "uuid";
import { type AgentPubKey, type EntryHash, type EntryHashB64, encodeHashToBase64, type AgentPubKeyB64, type Timestamp } from "@holochain/client";
import { BoardType } from "./boardList";
import type { HrlB64WithContext } from "@lightningrodlabs/we-applet";

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
  turn: number,
  attachments: Array<HrlB64WithContext>
}

export type BoardEphemeralState = { [key: string]: string };

export interface BoardState {
  status: string;
  name: string;
  max_players: number;
  min_players: number;
  turns: boolean;
  pieceDefs: PieceDef[];
  props: BoardProps;
}
  
  export type BoardDelta =
    | {
        type: "set-state";
        state: BoardState;
      }
    | {
        type: "set-turns";
        turns: boolean;
        }
    | {
        type: "next-turn";
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
  
  export const boardGrammar = {
    initialState()  {
      const state = {
        status: "",
        name: "untitled",
        pieceDefs: [],
        props: {bgUrl:"", pieces:{}, players:[], attachments:[]},
      }
      return state
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
        case "next-turn":
          state.props.turn = (state.props.turn+1)%state.props.players.length
          break;
        case "set-turns":
          state.turns = delta.turns
          break;
        case "set-state":
          if (delta.state.status !== undefined) state.status = delta.state.status
          if (delta.state.turns !== undefined) state.turns = delta.state.turns
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
  
  export type BoardStateData = {
    hash: EntryHash,
    state: BoardState,
  }
  

export class Board {
  public session: SessionStore<BoardState, BoardEphemeralState> | undefined
  public hashB64: EntryHashB64

  constructor(public document: DocumentStore<BoardState, BoardEphemeralState>, public workspace: WorkspaceStore<BoardState, BoardEphemeralState>) {
    this.hashB64 = encodeHashToBase64(this.document.documentHash)
  }

  public static async Create(synStore: SynStore) {
    const initState = boardGrammar.initialState()
    const documentStore = await synStore.createDocument(initState,{})

    await synStore.client.tagDocument(documentStore.documentHash, BoardType.active)

    const workspaceStore = await documentStore.createWorkspace(
        `${new Date}`,
        undefined
       );

    const me = new Board(documentStore, workspaceStore);
    await me.join()
    return me
  }

  get hash() : EntryHash {
    return this.document.documentHash
  }
  async join() {
    if (! this.session) 
      this.session = await this.workspace.joinSession()
    console.log("JOINED", this.session)
  }
  
  async leave() {
    if (this.session) {
      this.session.leaveSession()
      this.session = undefined
      console.log("LEFT SESSION")
    }
  }

  state(): BoardState | undefined {
      if (!this.session) {
        return undefined
      } else {
        return get(this.session.state)
      }
  }

  readableState(): Readable<BoardState> | undefined {
    if (!this.session) {
      return undefined
    } else {
      return this.session.state
    }
  }

  requestChanges(deltas: Array<BoardDelta>) {
    console.log("REQUESTING BOARD CHANGES: ", deltas)
    this.session.change((state,_eph)=>{
      for (const delta of deltas) {
        boardGrammar.applyDelta(delta, state,_eph, undefined)
      }
    })
  }

  sessionParticipants() {
    return this.workspace.sessionParticipants
  }

  participants()  {
    if (!this.session) {
      return undefined
    } else {
      return this.session._participants
    }
  }
  async commitChanges() {
      this.session.commitChanges()
  }
}
