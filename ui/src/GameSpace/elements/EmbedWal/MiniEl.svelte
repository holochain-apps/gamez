<script lang="ts">
  import CaretDownIcon from '~icons/fa6-solid/caret-down';
  import PaperclipIcon from '~icons/fa6-solid/paperclip';
  import ArrowUpRightFromSquareIcon from '~icons/fa6-solid/arrow-up-right-from-square';
  import type { EmbedWalElement } from './type';
  import { cx } from '~/lib/util';

  export let el: EmbedWalElement;
  let klass: string = '';
  export { klass as class };
  $$restProps; // This prevents Svelte warnings from unused props
</script>

<div
  class={`${klass} bg-gray-100 rounded-lg w-full h-full flex flex-col b-3 b-white/30 overflow-hidden`}
>
  <div class="h8 flex-shrink-0 flex text-lg p2 bg-gray-200">
    <div class="flex-grow h-full flexcs">
      <div class="text-black/50 bg-slate-500 rounded-full w5 h5"> </div>
      <div class="bg-black/15 h-4 mx2 rounded-md w-30 flex-grow"></div>
      <ArrowUpRightFromSquareIcon class="h-full text-main-400" />
    </div>
    <CaretDownIcon class={cx('ml3 -mt1 transition', { '-rotate-180': el.preview })} />
  </div>
  {#if el.preview}
    <div
      class="w-full h-full flexcc"
      style={`font-size: ${Math.min(Math.min(el.width, el.height) * 0.5, 200)}px;`}>📎</div
    >
  {/if}
</div>
