<script lang="ts">
  import { cx } from '~/center/lib/util';
  import { tooltip } from '~/center/lib/tooltip';

  export let onClose = () => {};
  export let counter = 0;
  export let title: string;
  let isOpen = false;

  let closeOnWindowClick = false;
  function toggleOpen() {
    isOpen = !isOpen;
    if (isOpen) {
      setTimeout(() => {
        closeOnWindowClick = true;
      }, 100);
      computeMaxHeight();
    } else {
      onClose();
      closeOnWindowClick = false;
    }
  }

  function computeMaxHeight() {
    const { top, height } = buttonEl.getBoundingClientRect();
    const documentHeight = document.documentElement.clientHeight;
    maxHeight = documentHeight - top - height;
  }

  $: handleClickWindow = () => {
    if (closeOnWindowClick && isOpen) {
      toggleOpen();
    }
  };

  let buttonEl: HTMLButtonElement;
  let maxHeight: 1200;
</script>

<svelte:window on:click={handleClickWindow} on:resize={computeMaxHeight} />

<div class="relative">
  <button
    bind:this={buttonEl}
    use:tooltip={title}
    class={cx('h12 w12 text-white flexcc hover:bg-black/10', {
      'bg-black/30!': isOpen,
    })}
    on:click={toggleOpen}
  >
    <slot name="icon" />
    {#if counter > 0}
      <div
        class="bg-red-500 text-sm text-white h4 w4 flexcc rounded-full absolute bottom-2 right-2"
      >
        {counter}
      </div>
    {/if}
  </button>
  {#if isOpen}
    <div
      class="bg-main-900 rounded-b-md top-full right-0 absolute flex flex-col z-50 shadow-lg"
      on:click={(ev) => ev.stopPropagation()}
      style={`max-height: ${maxHeight}px`}
    >
      <div class="p4">{title}</div>
      <div class="flex-grow overflow-auto">
        <slot />
      </div>
    </div>
  {/if}
</div>
