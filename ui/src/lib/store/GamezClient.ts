// Handles the Gamez Zome
// which provides the boards definitions
import { type ActionCommittedSignal, EntryRecord, ZomeClient } from '@holochain-open-dev/utils';
import { type ActionHash, type AppClient, type Link } from '@holochain/client';

import { type BoardState } from './board';

export const ZOME_NAME = 'gamez';

export type BoardDef = {
  board: string;
};

export type BoardDefData = {
  originalHash: ActionHash;
  board: BoardState;
  record: EntryRecord<BoardDef>;
};

export type EntryTypes = { type: 'BoardDef' } & BoardDef;
export type GamezSignal = ActionCommittedSignal<EntryTypes, any>;

export default class GamezClient extends ZomeClient<GamezSignal> {
  constructor(
    public client: AppClient,
    public roleName,
    public zomeName = ZOME_NAME,
  ) {
    super(client, roleName, ZOME_NAME);
  }

  async createBoardDef(def: BoardState): Promise<EntryRecord<BoardDef>> {
    return new EntryRecord(await this.callZome('create_board_def', { board: JSON.stringify(def) }));
  }
  async updateBoardDef(
    origHash: ActionHash,
    prevHash: ActionHash,
    def: BoardState,
  ): Promise<EntryRecord<BoardDef>> {
    return new EntryRecord(
      await this.callZome('update_board_def', {
        original_board_def_hash: origHash,
        previous_board_def_hash: prevHash,
        updated_board_def: { board: JSON.stringify(def) },
      }),
    );
  }
  async getBoardDefs(): Promise<Link[]> {
    const results = await this.callZome('get_board_defs', undefined);
    return results;
  }
  async getBoardDef(hash: ActionHash): Promise<EntryRecord<BoardDef> | undefined> {
    const record = await this.callZome('get_board_def', hash);
    if (!record) return undefined;

    const def: EntryRecord<BoardDef> = new EntryRecord(record);
    return def;
  }
}
