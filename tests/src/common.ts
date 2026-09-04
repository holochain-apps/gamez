import { CallableCell } from '@holochain-open-dev/tryorama';
import { ActionHash, Record } from '@holochain/client';

export const happPath = () => process.cwd() + '/../workdir/gamez.happ';

export const appSource = () => ({
  appBundleSource: { type: 'path' as const, value: happPath() },
});

export interface BoardDef {
  board: string;
}

export function sampleBoardDef(partial: Partial<BoardDef> = {}): BoardDef {
  return { board: partial.board ?? JSON.stringify({ name: 'Test Board', elements: [] }) };
}

export async function createBoardDef(cell: CallableCell, boardDef?: BoardDef): Promise<Record> {
  return cell.callZome({
    zome_name: 'gamez',
    fn_name: 'create_board_def',
    payload: boardDef ?? sampleBoardDef(),
  });
}

export async function getBoardDef(
  cell: CallableCell,
  originalActionHash: ActionHash,
): Promise<Record | null> {
  return cell.callZome({
    zome_name: 'gamez',
    fn_name: 'get_board_def',
    payload: originalActionHash,
  });
}
