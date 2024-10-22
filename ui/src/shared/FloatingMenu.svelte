<script lang="ts" generics="T">
  import Portal from 'svelte-portal';
  import { fade } from 'svelte/transition';
  import { adjustRectToDocument, rectangleToStyle } from '~/lib/floatingRectangle';

  export let target: HTMLElement;
  export let options: [T, any][] | T[];
  export let onSelect: (value: T) => void;
  export let onCancel: () => void;
  export let snapTo: 'bl' | 'br' | 'tl' | 'tr' = 'bl';
  export let snapFrom: 'bl' | 'br' | 'tl' | 'tr' = 'tl';
  $: normalizedOptions = options.map((o) => (Array.isArray(o) ? o : [o, o])) as [T, any][];

  let el: HTMLElement;
  let elStyle = '';
  let recalculateStyleFun: () => void;
  $: {
    recalculateStyleFun = () => {
      if (el) {
        const documentDimensions = {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
        };
        const targetRect = target.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const rectangle = adjustRectToDocument(
          {
            left:
              targetRect.left +
              (snapTo === 'br' || snapTo === 'tr' ? targetRect.width : 0) -
              (snapFrom === 'br' || snapFrom === 'tr' ? elRect.width : 0),
            top:
              targetRect.top +
              (snapTo == 'bl' || snapTo == 'br' ? targetRect.height : 0) -
              (snapFrom === 'bl' || snapFrom === 'br' ? elRect.height : 0),
            width: elRect.width,
            height: elRect.height,
            scale: 1,
          },
          documentDimensions,
        );
        elStyle = rectangleToStyle(rectangle);
      }
    };
    recalculateStyleFun();
  }

  let canCancel = false;
  setTimeout(() => {
    canCancel = true;
  }, 100);
  function handleWindowClickCancel() {
    if (canCancel) {
      onCancel();
    }
  }

  function handleWindowKeyCancel(ev: KeyboardEvent) {
    if (ev.key === 'Escape') {
      onCancel();
    }
  }

  function handleClickOption(ev: MouseEvent, value: T) {
    ev.stopPropagation();
    onSelect(value);
  }
</script>

<svelte:window
  on:keydown={handleWindowKeyCancel}
  on:click={handleWindowClickCancel}
  on:resize={recalculateStyleFun}
/>

<Portal target="body">
  <div
    class="fixed z-100 bg-gray-200 rounded-md shadow-lg bg-gradient-to-b from-white/10 to-white/0 b b-white/10 b-b-2 b-b-black/10 b-t-white/30 py1.5 flex flex-col"
    bind:this={el}
    style={elStyle}
    out:fade={{ duration: 150 }}
  >
    {#each normalizedOptions as [value, label]}
      <button
        class="px3 py.5 hover:(bg-main-500 text-white/80) text-black/80 text-left mx-[-1px]"
        on:click={(ev) => handleClickOption(ev, value)}><span class="">{label}</span></button
      >
    {/each}
  </div>
</Portal>
