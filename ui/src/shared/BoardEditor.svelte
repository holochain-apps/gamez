<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import DragDropList, { VerticalDropZone, reorder, type DropEvent } from 'svelte-dnd-list';
  import 'emoji-picker-element';
  import '@shoelace-style/shoelace/dist/components/select/select.js';
  import '@shoelace-style/shoelace/dist/components/option/option.js';
  import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
  import '@shoelace-style/shoelace/dist/components/button/button.js';
  import '@shoelace-style/shoelace/dist/components/input/input.js';
  import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';

  import { PieceDef, type BoardProps, Board, type BoardState, PieceType } from './board';
  import SvgIcon from './SvgIcon.svelte';
  import { cloneDeep } from 'lodash';
  import { BoardType } from './boardList';

  // import type { GamezStore } from './store';
  // const { getStore } :any = getContext('gzStore');
  // const store:GamezStore = getStore();

  export let handleSave;
  export let handleDelete = undefined;
  export let canDelete = false;
  export let cancelEdit;

  const generateBlankBoardProps = (): BoardProps => ({
    bgUrl: '',
    pieces: {},
    players: [],
    attachments: [],
    turn: 0,
    bgHeight: '',
    bgWidth: '',
  });

  let text = '';
  let minPlayers = '';
  let maxPlayers = '';
  let props: BoardProps = generateBlankBoardProps();
  let pieceDefs: Array<PieceDef> = [];
  let nameInput;
  let turns = false;
  let turnsInput;
  let playerPieces = false;
  let playerPiecesInput;

  $: valid =
    text != '' &&
    props.bgUrl != '' &&
    parseInt(minPlayers) >= 1 &&
    parseInt(maxPlayers) - parseInt(minPlayers) >= 0;

  export const reset = () => {
    nameInput.value = '';
    maxPlayersInput.value = '';
    minPlayersInput.value = '';
    text = '';
    maxPlayers = '';
    minPlayers = '';
    props = {
      bgUrl: '',
      pieces: {},
      players: [],
      attachments: [],
      turn: 0,
      bgHeight: '',
      bgWidth: '',
    };
    pieceDefs = [];
    turns = false;
    turnsInput.value = false;
    playerPieces = false;
    playerPiecesInput.value = false;
  };

  export const edit = async (state: BoardState) => {
    text = state.name;
    nameInput.value = text;
    maxPlayers = state.max_players ? `${state.max_players}` : '';
    maxPlayersInput.value = maxPlayers;
    minPlayers = state.min_players ? `${state.min_players}` : '';
    minPlayersInput.value = minPlayers;
    pieceDefs = cloneDeep(state.pieceDefs);
    props = state.props ? cloneDeep(state.props) : generateBlankBoardProps();
    turns = state.turns;
    turnsInput.checked = turns;
    playerPieces = state.playerPieces;
    playerPiecesInput.checked = playerPieces;
  };

  const addPieceDef = () => {
    pieceDefs.push(new PieceDef(PieceType.Emoji, 'smiley', 30, 30, [`🙂`]));
    pieceDefs = pieceDefs;
  };
  const deletePieceDef = (index) => () => {
    pieceDefs.splice(index, 1);
    pieceDefs = pieceDefs;
  };
  onMount(async () => {});
  const parseIntPlayers = (val: string): number => {
    let v = parseInt(val);
    return isNaN(v) ? 0 : v;
  };
  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      cancelEdit();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave(
        text,
        pieceDefs,
        props,
        parseIntPlayers(minPlayers),
        parseIntPlayers(maxPlayers),
        turns,
        playerPieces,
      );
    } else if (e.key === 'Tab') {
      // trap focus
      const tabbable = Array.from(document.querySelectorAll('input'));

      let index = tabbable.findIndex((elem) => elem == document.activeElement);

      if (index === -1 && e.shiftKey) index = 0;

      index += tabbable.length + (e.shiftKey ? -1 : 1);
      index %= tabbable.length;

      tabbable[index].focus();
      e.preventDefault();
    }
  };
  const onDropPieceDefs = ({ detail: { from, to } }: CustomEvent<DropEvent>) => {
    if (!to || from === to || from.dropZoneID !== 'pieceDefs') {
      return;
    }

    pieceDefs = reorder(pieceDefs, from.index, to.index);
  };
  let showEmojiPicker: number | undefined = undefined;
  let emojiDialog, minPlayersInput, maxPlayersInput;
</script>

<svelte:window on:keydown={handleKeydown} />
<div class="board-editor">
  <div class="edit-title">
    <sl-input
      label="Name"
      required
      class="textarea"
      maxlength="60"
      bind:this={nameInput}
      on:input={(e) => (text = e.target.value)}
    ></sl-input>
  </div>
  <div style="display:flex; flex-direction:row;align-items:center">
    <sl-input
      style="width:100px"
      label="Min Players"
      class="textarea"
      maxlength="2"
      bind:this={minPlayersInput}
      on:input={(e) => (minPlayers = e.target.value)}
    ></sl-input>
    <sl-input
      style="width:100px"
      label="Max Players"
      class="textarea"
      maxlength="2"
      bind:this={maxPlayersInput}
      on:input={(e) => (maxPlayers = e.target.value)}
    ></sl-input>
    <sl-checkbox
      bind:this={turnsInput}
      on:sl-input={(e) => {
        turns = e.target.checked;
      }}>Enforce Turns</sl-checkbox
    >
  </div>
  <div class="edit-piece-defs unselectable">
    <sl-checkbox
      bind:this={playerPiecesInput}
      on:sl-input={(e) => {
        playerPieces = e.target.checked;
      }}>Players Are Pieces</sl-checkbox
    >

    <div class="title-text">
      Pieces:

      <sl-button role="button" tabindex="0" circle size="small" on:click={() => addPieceDef()}>
        <SvgIcon size="12" icon="faPlus" />
      </sl-button>
    </div>
    <sl-dialog label="Choose Emoji" bind:this={emojiDialog}>
      <emoji-picker
        on:emoji-click={(e) => {
          pieceDefs[showEmojiPicker].images[0] = e.detail.unicode;
          showEmojiPicker = undefined;
          emojiDialog.hide();
        }}
      ></emoji-picker>
    </sl-dialog>
    <DragDropList
      id="pieceDefs"
      type={VerticalDropZone}
      itemSize={160}
      itemCount={pieceDefs.length}
      on:drop={onDropPieceDefs}
      let:index
      itemClass="unselectable"
    >
      <div class="piece-def">
        <div class="grip"><SvgIcon size="12" icon="faGripVertical" /></div>
        <div style="display:flex; flex-direction:column; ">
          <div style="display:flex; flex-direction:row; align-items:flex-end;">
            <sl-select
              style="margin-bottom:4px"
              label="Piece Type"
              on:sl-change={(e) => {
                pieceDefs[index].type = parseInt(e.target.value);
              }}
            >
              <sl-option value={PieceType.Emoji}>Emoji</sl-option>
              <sl-option value={PieceType.Image}>Image</sl-option>
            </sl-select>
            <sl-input
              label="Name"
              style="width:165px;margin-left:10px"
              class="textarea"
              value={pieceDefs[index].name}
              title="piece name"
              on:input={(e) => (pieceDefs[index].name = e.target.value)}
            >
            </sl-input>
            <sl-input
              label="Width"
              style="width:70px;"
              maxlength={3}
              class="textarea"
              value={pieceDefs[index].width}
              on:input={(e) => (pieceDefs[index].width = parseInt(e.target.value))}
            >
            </sl-input>
            <sl-input
              label="Height"
              style="width:70px;"
              maxlength={3}
              class="textarea"
              value={pieceDefs[index].height}
              on:input={(e) => (pieceDefs[index].height = parseInt(e.target.value))}
            >
            </sl-input>
          </div>
          <div style="display:flex; flex-direction:row; align-items:flex-end;">
            {#if pieceDefs[index].type === PieceType.Emoji}
              <sl-input
                label="Emoji"
                style="width:65px;"
                class="textarea"
                maxlength={1}
                value={pieceDefs[index].images[0]}
                title="piece value"
                on:input={(e) => (pieceDefs[index].images[0] = e.target.value)}
              >
              </sl-input>
              <sl-button
                role="button"
                tabindex="0"
                style="margin-bottom:5px"
                on:click={() => {
                  showEmojiPicker = index;
                  emojiDialog.show();
                }}
              >
                Pick
              </sl-button>
            {/if}
            {#if pieceDefs[index].type === PieceType.Image}
              <sl-input
                label="Image URL"
                class="textarea"
                value={pieceDefs[index].images[0]}
                title="piece image"
                on:input={(e) => (pieceDefs[index].images[0] = e.target.value)}
              >
              </sl-input>
              <img
                alt={`${pieceDefs[index].name} piece`}
                src={pieceDefs[index].images[0]}
                width="40"
                height="40"
              />
            {/if}
          </div>
        </div>
        <sl-button
          role="button"
          tabindex="0"
          style="margin-left:25px"
          size="small"
          on:click={deletePieceDef(index)}
        >
          <SvgIcon size="12" icon="faTrash" />
        </sl-button>
      </div>
    </DragDropList>
  </div>

  <div style="display:flex; flex-direction:row; align-items:flex-end;">
    <sl-input
      label="Background Image"
      required
      class="textarea"
      maxlength="255"
      value={props.bgUrl}
      on:input={(e) => (props.bgUrl = e.target.value)}
    />
    {#if props.bgUrl}
      <img alt="Board" src={props.bgUrl} width="40" height="40" />
    {:else}
      <div style="width:40px;height:40px"></div>
    {/if}
  </div>

  <div style="display:flex; flex-direction:row; align-items:flex-end;">
    <sl-input
      label="Board Width"
      style="width:170px;"
      class="textarea"
      value={props.bgWidth}
      on:input={(e) => (props.bgWidth = e.target.value)}
    >
    </sl-input>
    <sl-input
      label="Board Height"
      style="width:170px;"
      class="textarea"
      value={props.bgHeight}
      on:input={(e) => (props.bgHeight = e.target.value)}
    >
    </sl-input>
  </div>

  <div class="controls">
    {#if handleDelete}
      {#if canDelete}
        <sl-button
          role="button"
          tabindex="0"
          on:click={() => handleDelete(BoardType.deleted)}
          variant="warning"
        >
          Delete
        </sl-button>
      {/if}
      <sl-button
        role="button"
        tabindex="0"
        style="margin-left:10px"
        on:click={() => handleDelete(BoardType.archived)}
      >
        Archive
      </sl-button>
    {/if}
    <sl-button role="button" tabindex="0" on:click={cancelEdit} style="margin-left:10px">
      Cancel
    </sl-button>
    <sl-button
      role="button"
      tabindex="0"
      disabled={!valid}
      style="margin-left:10px"
      on:click={() =>
        handleSave(
          text,
          pieceDefs,
          props,
          parseIntPlayers(minPlayers),
          parseIntPlayers(maxPlayers),
          turns,
          playerPieces,
        )}
      variant="primary"
    >
      Save
    </sl-button>
  </div>
</div>

<style>
  .board-editor {
    display: flex;
    flex-basis: 500px;
    font-style: normal;
    font-weight: 600;
    color: #000000;
    flex-direction: column;
    justify-content: flex-start;
  }
  .textarea {
    width: 100%;
    padding: 5px;
    margin-right: 5px;
    font-weight: normal;
  }

  .controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding-left: 7px;
    padding-top: 10px;
  }
  .piece-def {
    border: solid 1px lightgray;
    padding: 10px;
    border-radius: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .grip {
    margin-right: 10px;
    cursor: pointer;
  }
  .title-text {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-weight: normal;
    margin-left: 5px;
    margin-right: 15px;
  }
  .unselectable {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
</style>
