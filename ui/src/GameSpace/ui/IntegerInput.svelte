<script lang="ts">
  import Input from './Input.svelte';

  export let label: string;
  export let value: string | number = '';
  export let onInput: (value: number) => void = () => {};
  let klass: string = '';
  export { klass as class };
</script>

<Input
  type="number"
  class={klass}
  {label}
  {value}
  onInput={(newVal) => onInput(parseInt(newVal))}
/>
