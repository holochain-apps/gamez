<script lang="ts">
  import { onMount } from 'svelte';
  import { type GElement } from './types.d';

  import EmojiPicker from '~/shared/EmojiPicker.svelte';

  export let x: number;
  export let y: number;
  export let onUpdateEl = (el: GElement) => {};
  export let onClose = () => {};
  export let el: GElement;

  let element: HTMLDivElement;
  onMount(() => {
    function handleClick(ev: MouseEvent) {
      if (element && !element.contains(ev.target as Node)) {
        onClose();
      }
    }
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  });

  let emojiPickerTarget: HTMLButtonElement;
  let emojiPickerOpen = false;
  function openEmojiPicker() {
    emojiPickerOpen = true;
  }

  function pickedEmoji(emoji: string) {
    if (el.type === 'Piece') {
      emojiPickerOpen = false;
      onUpdateEl({ ...el, display: { mode: 'emoji', value: emoji } });
    }
  }

  function cancelPickEmoji() {
    emojiPickerOpen = false;
  }
</script>

<div
  bind:this={element}
  class="fixed left-0 top-0 w-40 rounded-md bg-white shadow-md b b-black/10 p2"
  style={`
    top: ${y}px;
    left: ${x}px;
  `}
>
  {#if emojiPickerOpen}
    <EmojiPicker target={emojiPickerTarget} onCancel={cancelPickEmoji} onSelect={pickedEmoji} />
  {/if}
  {#if el.type == 'Piece' && el.display.mode === 'emoji'}
    <button
      class="flexcc w10 h10 rounded-md text-2xl bg-main-800 hover:bg-main-900 b b-black/10 text-black"
      on:click={openEmojiPicker}
      bind:this={emojiPickerTarget}>{el.display.value}</button
    >
  {/if}
</div>
