<script lang="ts">
  import { tooltip as tooltipDirective } from './tooltip';

  export let tooltip: string = undefined;
  export let title: string = undefined;
  let klass: string = '';
  export { klass as class };
  export let mode: 'sm' | 'lg' | 'icon';

  $: modeClass =
    mode === 'sm'
      ? 'text-sm rounded-md px2 py1'
      : mode === 'lg'
        ? 'text-base rounded-md px2 py1'
        : 'rounded-full p0 h8 w8 text-sm';
</script>

<button
  use:tooltipDirective={tooltip}
  class={`
    flexcc
    bg-main-600 text-white hover:bg-main-700 @dark:(bg-white/20 hover:bg-white/30)
    text-base rounded-md font-normal ${modeClass} ${klass}`}
  on:click
  {title}
>
  <slot />
</button>
