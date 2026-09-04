pub mod board_def;
pub use board_def::*;
use hdi::prelude::*;
#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[hdk_entry_types]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
    BoardDef(BoardDef),
}
#[derive(Serialize, Deserialize)]
#[hdk_link_types]
pub enum LinkTypes {
    AllBoardDefs,
    BoardDefUpdates,
}
#[hdk_extern]
pub fn genesis_self_check(
    _data: GenesisSelfCheckData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_agent_joining(
    _agent_pub_key: AgentPubKey,
    _membrane_proof: &Option<MembraneProof>,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
#[hdk_extern]
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
    match op.flattened::<EntryTypes, LinkTypes>()? {
        // The entry authority. 0.6 called this op variant "store entry".
        FlatOp::CreateEntry(store_entry) => {
            match store_entry {
                OpEntry::CreateEntry { app_entry, action } => {
                    match app_entry {
                        EntryTypes::BoardDef(space) => {
                            validate_create_board_def(
                                action.into(),
                                space,
                            )
                        }
                    }
                }
                OpEntry::UpdateEntry { app_entry, action, .. } => {
                    match app_entry {
                        EntryTypes::BoardDef(space) => {
                            validate_create_board_def(
                                action.into(),
                                space,
                            )
                        }
                    }
                }
                _ => Ok(ValidateCallbackResult::Valid),
            }
        }
        // The entry authority for an update. 0.6 called it "register update".
        FlatOp::Update(update_entry) => {
            match update_entry {
                OpUpdate::Entry {
                    app_entry,
                    action,
                } => {
                    match app_entry {
                        EntryTypes::BoardDef(space) => {
                            validate_update_board_def(
                                action,
                                space,
                            )
                        }
                    }
                }
                _ => Ok(ValidateCallbackResult::Valid),
            }
        }
        // The entry authority for a delete. 0.6 called it "register delete".
        FlatOp::Delete(delete_entry) => {
            match delete_entry {
                OpDelete{ action } => {
                    validate_delete_board_def(action)
                }
            }
        }
        // The link authority. 0.6 had two separate top-level variants here (one for
        // link creation, one for link deletion); 0.7 merges them under FlatOp::Link.
        // base/target/tag are read off the same actions the 0.6 flattener read them
        // off: the create-link action in both cases.
        FlatOp::Link(op_link) => {
            match op_link {
                OpLink::CreateLink { link_type, action } => {
                    let base_address = action.data.base_address.clone();
                    let target_address = action.data.target_address.clone();
                    let tag = action.data.tag.clone();
                    match link_type {
                        LinkTypes::BoardDefUpdates => {
                            validate_create_link_board_def_updates(
                                action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                        LinkTypes::AllBoardDefs => {
                            validate_create_link_all_board_defs(
                                action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                    }
                }
                OpLink::DeleteLink { original_action, link_type, action } => {
                    let base_address = original_action.data.base_address.clone();
                    let target_address = original_action.data.target_address.clone();
                    let tag = original_action.data.tag.clone();
                    match link_type {
                        LinkTypes::BoardDefUpdates => {
                            validate_delete_link_board_def_updates(
                                action,
                                original_action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                        LinkTypes::AllBoardDefs => {
                            validate_delete_link_all_board_defs(
                                action,
                                original_action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                    }
                }
            }
        }
        // The record (action) authority. 0.6 called this op variant "store record".
        FlatOp::CreateRecord(store_record) => {
            match store_record {
                OpRecord::CreateEntry { app_entry, action } => {
                    match app_entry {
                        EntryTypes::BoardDef(space) => {
                            validate_create_board_def(
                                action.into(),
                                space,
                            )
                        }
                    }
                }
                OpRecord::UpdateEntry {
                    app_entry,
                    action,
                    ..
                } => {
                    let original_action_hash = action.data.original_action_address.clone();
                    let original_record = must_get_valid_record(original_action_hash)?;
                    let original_action = original_record.action().clone();
                    let _original_action = match TypedAction::<
                        EntryCreationData,
                    >::try_from(original_action) {
                        Ok(original_action) => original_action,
                        Err(_) => {
                            return Ok(
                                ValidateCallbackResult::Invalid(
                                    "Original action for an update must be a Create or Update action"
                                        .to_string(),
                                ),
                            );
                        }
                    };
                    match app_entry {
                        EntryTypes::BoardDef(space) => {
                            let result = validate_create_board_def(
                                action.clone().into(),
                                space.clone(),
                            )?;
                            if let ValidateCallbackResult::Valid = result {
                                let original_board_def: Option<BoardDef> = original_record
                                    .entry()
                                    .to_app_option()
                                    .map_err(|e| wasm_error!(e))?;
                                let _original_board_def = match original_board_def {
                                    Some(space) => space,
                                    None => {
                                        return Ok(
                                            ValidateCallbackResult::Invalid(
                                                "The updated entry type must be the same as the original entry type"
                                                    .to_string(),
                                            ),
                                        );
                                    }
                                };
                                validate_update_board_def(
                                    action,
                                    space,
                                )
                            } else {
                                Ok(result)
                            }
                        }
                    }
                }
                OpRecord::DeleteEntry { action, .. } => {
                    let original_action_hash = action.data.deletes_address.clone();
                    let original_record = must_get_valid_record(original_action_hash)?;
                    let original_action = original_record.action().clone();
                    let original_action = match TypedAction::<
                        EntryCreationData,
                    >::try_from(original_action) {
                        Ok(original_action) => original_action,
                        Err(_) => {
                            return Ok(
                                ValidateCallbackResult::Invalid(
                                    "Original action for a delete must be a Create or Update action"
                                        .to_string(),
                                ),
                            );
                        }
                    };
                    let app_entry_type = match original_action.entry_type() {
                        EntryType::App(app_entry_type) => app_entry_type,
                        _ => {
                            return Ok(ValidateCallbackResult::Valid);
                        }
                    };
                    let entry = match original_record.entry().as_option() {
                        Some(entry) => entry,
                        None => {
                            if original_action.entry_type().visibility().is_public() {
                                return Ok(
                                    ValidateCallbackResult::Invalid(
                                        "Original record for a delete of a public entry must contain an entry"
                                            .to_string(),
                                    ),
                                );
                            } else {
                                return Ok(ValidateCallbackResult::Valid);
                            }
                        }
                    };
                    let _original_app_entry = match EntryTypes::deserialize_from_type(
                        app_entry_type.zome_index.clone(),
                        app_entry_type.entry_index.clone(),
                        &entry,
                    )? {
                        Some(app_entry) => app_entry,
                        None => {
                            return Ok(
                                ValidateCallbackResult::Invalid(
                                    "Original app entry must be one of the defined entry types for this zome"
                                        .to_string(),
                                ),
                            );
                        }
                    };
                    validate_delete_board_def(
                        action,
                    )
                }
                OpRecord::CreateLink {
                    link_type,
                    action,
                } => {
                    let base_address = action.data.base_address.clone();
                    let target_address = action.data.target_address.clone();
                    let tag = action.data.tag.clone();
                    match link_type {
                        LinkTypes::BoardDefUpdates => {
                            validate_create_link_board_def_updates(
                                action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                        LinkTypes::AllBoardDefs => {
                            validate_create_link_all_board_defs(
                                action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                    }
                }
                OpRecord::DeleteLink { action } => {
                    let original_action_hash = action.data.link_add_address.clone();
                    let base_address = action.data.base_address.clone();
                    let record = must_get_valid_record(original_action_hash)?;
                    let create_link = match TypedAction::<
                        CreateLinkData,
                    >::try_from(record.action().clone()) {
                        Ok(create_link) => create_link,
                        Err(_) => {
                            return Ok(
                                ValidateCallbackResult::Invalid(
                                    "The action that a DeleteLink deletes must be a CreateLink"
                                        .to_string(),
                                ),
                            );
                        }
                    };
                    let link_type = match LinkTypes::from_type(
                        create_link.data.zome_index.clone(),
                        create_link.data.link_type.clone(),
                    )? {
                        Some(lt) => lt,
                        None => {
                            return Ok(ValidateCallbackResult::Valid);
                        }
                    };
                    let target_address = create_link.data.target_address.clone();
                    let tag = create_link.data.tag.clone();
                    match link_type {
                        LinkTypes::BoardDefUpdates => {
                            validate_delete_link_board_def_updates(
                                action,
                                create_link,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                        LinkTypes::AllBoardDefs => {
                            validate_delete_link_all_board_defs(
                                action,
                                create_link,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                    }
                }
                OpRecord::CreatePrivateEntry { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::UpdatePrivateEntry { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::CreateCapClaim { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::CreateCapGrant { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::UpdateCapClaim { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::UpdateCapGrant { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::Dna { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::OpenChain { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::CloseChain { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::InitZomesComplete { .. } => Ok(ValidateCallbackResult::Valid),
                _ => Ok(ValidateCallbackResult::Valid),
            }
        }
        // The chain authority. 0.6 called this op variant "register agent activity".
        FlatOp::AgentActivity(agent_activity) => {
            match agent_activity {
                OpActivity::CreateAgent { agent, action } => {
                    let prev_action_hash = action
                        .prev_action()
                        .cloned()
                        .ok_or(
                            wasm_error!(
                                WasmErrorInner::Guest("CreateAgent action must have a previous action"
                                .to_string())
                            ),
                        )?;
                    let previous_action = must_get_action(prev_action_hash)?;
                    match &previous_action.action().data {
                        ActionData::AgentValidationPkg(
                            AgentValidationPkgData { membrane_proof, .. },
                        ) => validate_agent_joining(agent, membrane_proof),
                        _ => {
                            Ok(
                                ValidateCallbackResult::Invalid(
                                    "The previous action for a `CreateAgent` action must be an `AgentValidationPkg`"
                                        .to_string(),
                                ),
                            )
                        }
                    }
                }
                _ => Ok(ValidateCallbackResult::Valid),
            }
        }
    }
}
