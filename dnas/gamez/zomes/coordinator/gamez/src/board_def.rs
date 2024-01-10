use hdk::prelude::*;
use gamez_integrity::*;

#[hdk_extern]
pub fn create_board_def(board_def: BoardDef) -> ExternResult<Record> {
    let board_def_hash = create_entry(&EntryTypes::BoardDef(board_def.clone()))?;
    let record = get(board_def_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly created BoardDef"))
            ),
        )?;
    let path = Path::from("all_board_defs");
    create_link(path.path_entry_hash()?, board_def_hash.clone(), LinkTypes::AllBoardDefs, ())?;
    Ok(record)
}
#[hdk_extern]
pub fn get_board_def(original_board_def_hash: ActionHash) -> ExternResult<Option<Record>> {
    let input = GetLinksInputBuilder::try_new(original_board_def_hash.clone(), LinkTypes::BoardDefUpdates)?.build();
    let links = get_links(input)?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_board_def_hash = match latest_link {
        Some(link) => ActionHash::try_from(link.target.clone()).map_err(|err| wasm_error!(err))?,
        None => original_board_def_hash.clone(),
    };
    get(latest_board_def_hash, GetOptions::default())
}
#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateBoardDefInput {
    pub original_board_def_hash: ActionHash,
    pub previous_board_def_hash: ActionHash,
    pub updated_board_def: BoardDef,
}
#[hdk_extern]
pub fn update_board_def(input: UpdateBoardDefInput) -> ExternResult<Record> {
    let updated_board_def_hash = update_entry(
        input.previous_board_def_hash.clone(),
        &input.updated_board_def,
    )?;
    create_link(
        input.original_board_def_hash.clone(),
        updated_board_def_hash.clone(),
        LinkTypes::BoardDefUpdates,
        (),
    )?;
    let record = get(updated_board_def_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly updated BoardDef"))
            ),
        )?;
    Ok(record)
}

#[hdk_extern]
pub fn delete_board_def(original_board_def_hash: ActionHash) -> ExternResult<ActionHash> {
    delete_entry(original_board_def_hash)
}

#[hdk_extern]
pub fn get_board_defs(_: ()) -> ExternResult<Vec<Link>> {
    let path = Path::from("all_board_defs");
    let input = GetLinksInputBuilder::try_new(path.path_entry_hash()?, LinkTypes::AllBoardDefs)?.build();
    let links = get_links(input)?;

    Ok(links)
}