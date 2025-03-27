<script lang="ts">
  import cx from 'classnames';
  export let label: string;
  export let value: string | number = '';
  export let type: string = 'text';
  export let onInput: (value: string) => void = () => {};
  export let disabled = false;
  export let error = false;
  export let inputRef: HTMLInputElement = null;
  let klass: string = '';
  export { klass as class };
</script>

<div class={`relative ${klass}`}>
  <input
    class={cx(
      'peer px4 py2 h10 rounded-md block w-full text-black/60 text-lg outline-main-500 b b-black/20 bg-white',
      {
        'outline-red-500 bg-red-500/5': error,
        'outline-main-500': !error,
      },
    )}
    placeholder={label}
    {disabled}
    {type}
    {value}
    on:input={({ currentTarget }) => onInput(currentTarget.value)}
    on:focus
    on:blur
    on:keydown
    bind:this={inputRef}
  />
  <div
    class="peer-placeholder-shown:hidden absolute -left-1 -top-3 bg-main-400 text-white text-sm rounded-md px1"
    >{label}</div
  >
</div>
