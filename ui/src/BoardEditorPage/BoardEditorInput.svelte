<script lang="ts">
  export let label: string;
  export let value: string | number = '';
  export let type: string = 'text';
  export let onInput: (value: string) => void = () => {};
  let klass: string = '';
  export { klass as class };
</script>

<div class={`relative ${klass}`}>
  <input
    class="peer px4 py2 h10 rounded-md block w-full text-black/60 text-lg outline-main-500"
    placeholder={label}
    {type}
    {value}
    on:input={({ currentTarget }) => onInput(currentTarget.value)}
  />
  <div
    class="peer-placeholder-shown:hidden absolute -left-1 -top-3 bg-main-400 text-white text-sm rounded-md px1"
    >{label}</div
  >
</div>
