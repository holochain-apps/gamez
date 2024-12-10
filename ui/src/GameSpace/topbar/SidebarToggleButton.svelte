<script lang="ts">
  import cx from 'classnames';

  export let current: string;
  export let value: string;
  export let onClick: (value: string) => void;
</script>

<button
  class={cx('h12 w12 text-white flexcc hover:bg-black/10', {
    'bg-black/30!': current === value,
  })}
  on:click={() => onClick(value)}><slot /></button
>
