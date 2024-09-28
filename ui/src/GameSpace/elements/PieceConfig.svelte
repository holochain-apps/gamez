<script lang="ts">
  import EmojiPicker from '~/shared/EmojiPicker.svelte';
  import { type PieceElement } from '../types.d';

  export let el: PieceElement;
  export let onUpdate: (el: PieceElement) => void;

  let emojiPickerTarget: HTMLButtonElement;
  let emojiPickerOpen = false;
  function openEmojiPicker() {
    emojiPickerOpen = true;
  }

  function pickedEmoji(emoji: string) {
    emojiPickerOpen = false;
    onUpdate({ ...el, display: { mode: 'emoji', value: emoji } });
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
