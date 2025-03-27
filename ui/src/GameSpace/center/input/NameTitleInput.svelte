<script lang="ts">
  import { cx } from '~/center/lib/util';

  export let value: string;
  export let onChange: (value: string) => void;
  export let disabled = false;

  function handleTitleBlur(ev: { currentTarget: HTMLHeadingElement }) {
    onChange(ev.currentTarget.innerText);
  }

  function handleTitleKeydown(ev: KeyboardEvent & { currentTarget: HTMLHeadingElement }) {
    if (ev.key === 'Enter') {
      ev.currentTarget.blur();
    }
  }
</script>

<h1
  class={cx('font-bold text-2xl px1 ml2 h9 flexcs text-white rounded-md outline-main-500', {
    'hocus:(bg-gray-100 text-black/80 text-shadow-none!)': !disabled,
  })}
  on:keydown={handleTitleKeydown}
  style="text-shadow: 0 1px 0 rgba(0,0,0,.5)"
  contenteditable={!disabled}
  on:blur={handleTitleBlur}
>
  {value}
</h1>
