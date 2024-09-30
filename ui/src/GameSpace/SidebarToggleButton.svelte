<script lang="ts">
  import cx from 'classnames';

  export let current: string;
  export let value: string;
  export let onClick: (value: string) => void;
</script>

<button
  class={cx('h14 w14 flexcc b b-black/10', {
    'bg-black/30 text-white': current === value,
    'bg-white/20': current !== value,
  })}
  on:click={() => onClick(value)}><slot /></button
>
