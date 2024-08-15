<script lang="ts">
  import { cloneDeep } from 'lodash';
  import '@shoelace-style/shoelace/dist/components/button/button.js';
  import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';

  import {
    isWeContext,
    type WAL,
    weaveUrlFromWal,
    type WeaveUrl,
  } from '@lightningrodlabs/we-applet';

  import { getStoreContext } from '~/lib/context';
  import type { Board, Piece } from '~/lib/board';
  import SvgIcon from '~/shared/SvgIcon.svelte';

  import AttachmentsList from './AttachmentsList.svelte';

  const store = getStoreContext();
  let piece: Piece | undefined;
  let attachments: Array<WeaveUrl> = [];

  $: attachments = attachments;

  export let activeBoard: Board;
  export const close = () => {
    dialog.hide();
  };
  export const open = (p: Piece) => {
    piece = p;
    attachments = piece.attachments ? cloneDeep(piece.attachments) : [];
    dialog.show();
  };
  let dialog;
  $: attachments;

  function removeAttachment(index: number) {
    attachments.splice(index, 1);
    attachments = attachments;
    handleSave();
  }

  const addAttachment = async () => {
    const wal = await store.weaveClient.userSelectWal();
    if (wal) {
      _addAttachment(wal);
    }
  };

  const _addAttachment = (wal: WAL) => {
    attachments.push(weaveUrlFromWal(wal));
    attachments = attachments;
    handleSave();
  };

  const handleSave = async () => {
    if (piece) {
      activeBoard.requestChanges([
        {
          type: 'set-piece-attachments',
          id: piece.id,
          attachments,
        },
      ]);
    }
  };
</script>

<sl-dialog class="text-black/60!" label="Attached Assets" bind:this={dialog}>
  {#if isWeContext()}
    <AttachmentsList {attachments} on:remove-attachment={(e) => removeAttachment(e.detail)} />

    <div class="flex justify-content:center">
      <button class="h10 w10 flexcc rounded-full hover:bg-gray/20" on:click={() => addAttachment()}>
        <SvgIcon icon="searchPlus" size="25" />
      </button>
    </div>
  {/if}
</sl-dialog>

<style>
  sl-dialog::part(panel) {
    background: #ffffff;
    border: 2px solid rgb(166 115 55 / 26%);
    border-bottom: 2px solid rgb(84 54 19 / 50%);
    border-top: 2px solid rgb(166 115 55 / 5%);
    box-shadow: 0px 15px 40px rgb(130 107 58 / 35%);
    border-radius: 10px;
  }
</style>
