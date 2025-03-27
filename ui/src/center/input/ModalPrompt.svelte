<script lang="ts">
  import { onMount } from 'svelte';
  import Portal from 'svelte-portal';
  import { fade } from 'svelte/transition';
  import Input from '~/GameSpace/center/input/Input.svelte';
  export let title: string;
  export let placeholder: string;
  export let defaultValue: string;
  export let onCancel: () => void;
  export let onConfirm: (value: string) => void;

  let value: string = defaultValue;

  let inputEl: HTMLInputElement;

  onMount(() => {
    inputEl.focus();
  });

  function handleKeyDown(ev: KeyboardEvent) {
    if (ev.key === 'Enter') {
      onConfirm(value);
    } else if (ev.key === 'Escape') {
      onCancel();
    }
  }
</script>

<Portal target="body">
  <div out:fade={{ duration: 150 }} on:keydown={handleKeyDown}>
    <div
      class="fixed z-100 w-100 left-1/2 -translate-x-1/2 top-50 bg-gray-200 rounded-md shadow-lg overflow-hidden"
    >
      <div class="p2 bg-main-500 text-white text-lg">{title}</div>
      <div class="p2 py4">
        <Input
          label={placeholder}
          type="text"
          {value}
          onInput={(v) => (value = v)}
          bind:inputRef={inputEl}
        />
      </div>
      <div class="p2 flexce bg-gray-300">
        <button class="hover:bg-gray-200 px2 py1 rounded-md text-black/60" on:click={onCancel}
          >Cancel</button
        >
        <button
          class="bg-main-500 text-white rounded-md px2 py1 ml2 hover:filter-brightness-110 b b-black/10 disabled:(saturate-0 filter-brightness-100!)"
          disabled={!value}
          on:click={() => onConfirm(value)}>Confirm</button
        >
      </div>
    </div>
    <div class="fixed z-90 bg-black/10 inset-0" on:click={onCancel}></div>
  </div>
</Portal>
