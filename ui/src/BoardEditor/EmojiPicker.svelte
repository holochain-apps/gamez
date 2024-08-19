<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  import 'emoji-picker-element';
  import { Picker } from 'emoji-picker-element';
  import { adjustRectToDocument, rectangleToStyle } from '~/lib/floatingRectangle';

  const D = createEventDispatcher<{ select: string; cancel: void }>();

  export let target: HTMLElement;
  let el: HTMLElement;

  onMount(() => {
    const picker = new Picker();
    picker.style.width = '100%';
    picker.style.height = '100%';
    el.appendChild(picker);
    picker.addEventListener('emoji-click', (ev: any) => {
      D('select', ev.detail.unicode);
    });
    (picker.shadowRoot.querySelector('#search') as HTMLInputElement).focus();
  });

  const { left, top, width } = target.getBoundingClientRect();

  const documentDimensions = {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };

  const rectangle = adjustRectToDocument(
    {
      left: left + width + 8,
      top: top,
      width: 360,
      height: 300,
      scale: 1,
    },
    documentDimensions,
  );
</script>

<div class="fixed inset-0 z-90">
  <div
    class="absolute z-20 bg-white shadow-md rounded-md overflow-hidden"
    style={rectangleToStyle(rectangle)}
    bind:this={el}
  ></div>
  <div
    class="absolute z-10 w-full h-full bg-black/10"
    on:click={() => {
      D('cancel');
    }}
  ></div>
</div>
