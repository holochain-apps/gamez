<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Input from './BoardEditorInput.svelte';

  export let label: string;
  export let value: string | number = '';
  export let onInput: (value: number) => void = () => {};
  let klass: string = '';
  export { klass as class };

  const D = createEventDispatcher<{ input: number }>();
</script>

<Input
  type="number"
  class={klass}
  {label}
  {value}
  onInput={(newVal) => onInput(parseInt(newVal))}
/>
