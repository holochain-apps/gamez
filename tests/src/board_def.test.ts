import { assert, test } from 'vitest';

import { dhtSync, runScenario } from '@holochain-open-dev/tryorama';
import { ActionHash, Link, Record } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

import { appSource, createBoardDef, getBoardDef, sampleBoardDef } from './common.js';

const decodeEntry = (record: Record): any =>
  decode((record.entry as any).Present.entry);

// These tests exist to exercise the gamez integrity zome's `validate` callback, which
// nothing in the UI calls (the UI only talks to the `syn` and `profiles` zomes). Every
// assertion below that reads data on *Bob's* conductor only succeeds if Bob's authority
// validation accepted the op Alice authored.
test('create, get, update and delete a BoardDef', async () => {
  await runScenario(async (scenario) => {
    const [alice, bob] = await scenario.addPlayersWithApps([appSource(), appSource()]);
    await scenario.shareAllAgents();

    const dnaHash = alice.cells[0].cell_id[0];

    // Nothing there yet.
    let links: Link[] = await bob.cells[0].callZome({
      zome_name: 'gamez',
      fn_name: 'get_board_defs',
      payload: null,
    });
    assert.equal(links.length, 0);

    // Alice creates a BoardDef. This exercises, on Alice, OpRecord::CreateEntry and
    // OpRecord::CreateLink (AllBoardDefs); and on Bob, OpEntry::CreateEntry and
    // OpLink::CreateLink.
    const created: Record = await createBoardDef(alice.cells[0]);
    assert.ok(created);
    const originalActionHash: ActionHash = created.signed_action.hashed.hash;

    await dhtSync([alice, bob], dnaHash);

    // Bob validated and integrated both the entry and the collection link.
    links = await bob.cells[0].callZome({
      zome_name: 'gamez',
      fn_name: 'get_board_defs',
      payload: null,
    });
    assert.equal(links.length, 1);

    const readBack = await getBoardDef(bob.cells[0], originalActionHash);
    assert.ok(readBack);
    assert.deepEqual(decodeEntry(readBack!), sampleBoardDef());

    // Alice updates it. On Alice: OpRecord::UpdateEntry (which re-fetches the original
    // record and narrows it to an entry-creation action) plus OpRecord::CreateLink
    // (BoardDefUpdates). On Bob: OpEntry::UpdateEntry, OpUpdate::Entry and
    // OpLink::CreateLink.
    const updatedDef = sampleBoardDef({ board: JSON.stringify({ name: 'Renamed', elements: [] }) });
    const updated: Record = await alice.cells[0].callZome({
      zome_name: 'gamez',
      fn_name: 'update_board_def',
      payload: {
        original_board_def_hash: originalActionHash,
        previous_board_def_hash: originalActionHash,
        updated_board_def: updatedDef,
      },
    });
    assert.ok(updated);

    await dhtSync([alice, bob], dnaHash);

    const afterUpdate = await getBoardDef(bob.cells[0], originalActionHash);
    assert.ok(afterUpdate);
    assert.deepEqual(decodeEntry(afterUpdate!), updatedDef);

    // Alice deletes it. On Alice: OpRecord::DeleteEntry (which re-fetches the original
    // record, narrows it, checks visibility and re-deserialises the entry). On Bob:
    // OpDelete.
    const deleteHash: ActionHash = await alice.cells[0].callZome({
      zome_name: 'gamez',
      fn_name: 'delete_board_def',
      payload: originalActionHash,
    });
    assert.ok(deleteHash);

    await dhtSync([alice, bob], dnaHash);
  });
});
