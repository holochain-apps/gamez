<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import GripVerticalIcon from '~icons/fa6-solid/grip-vertical';
  import TrashIcon from '~icons/fa6-solid/trash';
  import { PieceDef, PieceType } from '~/lib/store';
  import Input from './BoardEditorInput.svelte';
  import EmojiPicker from './EmojiPicker.svelte';
  // import { cloneDeep } from 'lodash';

  const D = createEventDispatcher<{
    delete: void;
    change: PieceDef;
  }>();

  export let def: PieceDef;
  // let defNew = cloneDeep(def);

  function setName(name: string) {
    D('change', { ...def, name });
  }

  function setPieceType(pieceType: PieceType) {
    D('change', { ...def, images: [], type: pieceType });
  }

  function setWidth(width: number) {
    D('change', { ...def, width });
  }

  function setHeight(height: number) {
    D('change', { ...def, height });
  }

  function setImageUrl(imageUrl: string) {
    D('change', { ...def, images: [imageUrl] });
  }

  let emojiPickerTarget: HTMLButtonElement;
  let emojiPickerOpen = false;
  function openEmojiPicker() {
    emojiPickerOpen = true;
  }

  function pickedEmoji(emoji: string) {
    D('change', { ...def, images: [emoji] });
    emojiPickerOpen = false;
  }

  function cancelPickEmoji() {
    emojiPickerOpen = false;
  }
</script>

<div class="bg-black/10 p2 rounded-md mb4 last:mb0 relative pl8 b b-black/10">
  <GripVerticalIcon class="absolute top-0 left-0 h-full w-8 px2 cursor-grab" />
  {#if emojiPickerOpen}
    <EmojiPicker
      target={emojiPickerTarget}
      on:cancel={cancelPickEmoji}
      on:select={({ detail }) => pickedEmoji(detail)}
    />
  {/if}
  <div class="flex mb4">
    <Input
      class="flex-grow"
      label="Name *"
      type="text"
      value={def.name}
      on:input={({ detail }) => setName(detail)}
    />
    <button class="h-10 w-8 ml4 hover:text-red-200" on:click={() => D('delete')}>
      <TrashIcon class="" />
    </button>
  </div>
  <div class="flex mb4">
    <select
      class="rounded-md text-black/60 px4 py2 h10 flex-grow outline-main-500"
      value={def.type}
      on:change={({ currentTarget }) => setPieceType(parseInt(currentTarget.value))}
    >
      <option value={PieceType.Emoji}>Emoji</option>
      <option value={PieceType.Image}>Image</option>
    </select>
    {#if def.type == PieceType.Emoji}
      <button
        class="flexcc w10 h10 ml4 rounded-md text-lg bg-white"
        on:click={openEmojiPicker}
        bind:this={emojiPickerTarget}>{def.images[0] || ''}</button
      >
    {/if}
  </div>
  {#if def.type == PieceType.Image}
    <Input
      class="mb4"
      label="Image URL"
      type="text"
      value={def.images[0]}
      on:input={({ detail }) => setImageUrl(detail)}
    />
  {/if}

  <div class="flex space-x-4">
    <Input
      label="Width"
      type="number"
      value={def.width}
      on:input={({ detail }) => setWidth(parseInt(detail))}
    />
    <Input
      label="Height"
      type="number"
      value={def.height}
      on:input={({ detail }) => setHeight(parseInt(detail))}
    />
  </div>
</div>
