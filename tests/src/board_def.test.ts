import { assert, test } from 'vitest';

import { dhtSync, runScenario } from '@holochain-open-dev/tryorama';
import { ActionHash, Link, Record } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

import { appSource, createBoardDef, getBoardDef, sampleBoardDef } from './common.js';

const decodeEntry = (record: Record): any =>
  decode((record.entry as any).Present.entry);

// These tests exercise the `gamez` coordinator's externs end to end on hdk 0.7 across two
// conductors. Nothing in the UI calls this zome (the UI talks only to `syn` and
// `profiles`), so this file is the only thing that ever runs the migrated Rust.
//
// It also reaches `gamez_integrity`'s `validate` callback -- but only since the commit that
// corrected `dnas/gamez/workdir/dna.yaml` to give the `gamez` coordinator
// `dependencies: [gamez_integrity]`. Before that its ops were attributed to
// `profiles_integrity` (zome_index 2) and all of gamez's entry/link validation was dead.
// Do not trust the per-step notes below on faith: they are mutation-verified, i.e. making
// `validate_create_board_def` or `validate_create_link_all_board_defs` return `Invalid`
// makes this test FAIL. If you change the manifest wiring, re-run that mutation.
//
// Both agents hold a full arc here, so each is an authority for every op; "author" vs
// "authority" below describes which validation path runs, not which conductor runs it.
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

    // Alice creates a BoardDef. Author/record-authority path: OpRecord::CreateEntry and
    // OpRecord::CreateLink (AllBoardDefs). Entry- and link-authority paths:
    // OpEntry::CreateEntry and OpLink::CreateLink, on both agents.
    // Mutation-verified: an Invalid from validate_create_board_def or from
    // validate_create_link_all_board_defs fails this call at commit time.
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

    // Alice updates it. Author/record-authority path: OpRecord::UpdateEntry (which
    // re-fetches the original record and narrows it to an entry-creation action) plus
    // OpRecord::CreateLink (BoardDefUpdates). Entry-, update- and link-authority paths:
    // OpEntry::UpdateEntry, OpUpdate::Entry and OpLink::CreateLink.
    // Not asserted here: nothing drives either delete-link validator, because no
    // coordinator extern calls delete_link -- so the only two Invalid returns in
    // board_def.rs remain unreachable through the public API.
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

    // Alice deletes it. Author/record-authority path: OpRecord::DeleteEntry (which
    // re-fetches the original record, narrows it, checks visibility and re-deserialises the
    // entry -- that last step now resolves against gamez_integrity's own zome index).
    // Delete-authority path: OpDelete. This step asserts only that the delete commits and
    // validates; it does not assert what get_board_def returns afterwards.
    const deleteHash: ActionHash = await alice.cells[0].callZome({
      zome_name: 'gamez',
      fn_name: 'delete_board_def',
      payload: originalActionHash,
    });
    assert.ok(deleteHash);

    await dhtSync([alice, bob], dnaHash);
  });
});
