<script lang="ts">
  import cx from 'classnames';
  export let active: string;
  export let value: string;
  export let onClick: (value: string) => void;
  $: isActive = active === value;
</script>

<button
  on:click={() => onClick(value)}
  class={cx(
    'relative flexcc bg-white/10 hover:bg-white/20 h-full px2  b b-b-0 b-t-white/20 rounded-t-md b-white/10 uppercase text-sm tracking-wider',
    {
      'bg-white/30 text-white/100  bg-gradient-to-b from-white/10 to-white/0': isActive,
      'bg-white/10 text-white/80': !isActive,
    },
  )}
>
  {#if isActive}
    <div class="drop-shadow-[0_1px_0_#0002] absolute inset-0 flexcc font-bold"><slot /></div>
  {/if}
  <div class={cx({ 'opacity-0': isActive })}>
    <slot />
  </div>
</button>
