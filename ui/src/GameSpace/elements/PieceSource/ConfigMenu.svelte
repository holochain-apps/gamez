<script lang="ts">
  import EmojiPicker from '~/shared/EmojiPicker.svelte';
  import { type PieceSourceElement } from './type.js';
  import IntegerInput from '../../ui/IntegerInput.svelte';

  export let el: PieceSourceElement;
  export let onUpdate: (el: Partial<PieceSourceElement>) => void;

  let emojiPickerTarget: HTMLButtonElement;
  let emojiPickerOpen = false;
  function openEmojiPicker() {
    emojiPickerOpen = true;
  }

  function pickedEmoji(emoji: string) {
    emojiPickerOpen = false;
    onUpdate({ uuid: el.uuid, display: { mode: 'emoji', value: emoji } });
  }

  function cancelPickEmoji() {
    emojiPickerOpen = false;
  }
</script>

{#if emojiPickerOpen}
  <EmojiPicker target={emojiPickerTarget} onCancel={cancelPickEmoji} onSelect={pickedEmoji} />
{/if}

{#if el.display.mode === 'emoji'}
  <button
    disabled={el.lock.config}
    class="flexcc w10 h10 rounded-md text-2xl bg-main-800 hover:bg-main-900 disabled:(saturate-0 opacity-50 bg-main-800) b b-black/10 text-black"
    on:click={openEmojiPicker}
    bind:this={emojiPickerTarget}>{el.display.value}</button
  >
{/if}

<div class="flex mt4 space-x-2">
  <IntegerInput
    class="flex-1 w-0"
    label="Limit"
    value={el.limit}
    onInput={(limit) => onUpdate({ ...el, limit: limit || null })}
  />
  <IntegerInput
    class="flex-1 w-0"
    label="Width"
    value={el.pieceW}
    onInput={(pieceW) => onUpdate({ ...el, pieceW })}
  />
  <IntegerInput
    class="flex-1 w-0"
    label="Height"
    value={el.pieceH}
    onInput={(pieceH) => onUpdate({ ...el, pieceH })}
  />
</div>
