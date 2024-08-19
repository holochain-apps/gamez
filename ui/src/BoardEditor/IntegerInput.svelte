<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Input from './BoardEditorInput.svelte';

  export let label: string;
  export let value: string | number = '';
  let klass: string = '';
  export { klass as class };

  const D = createEventDispatcher<{ input: number }>();
</script>

<Input
  type="number"
  class={klass}
  {label}
  {value}
  on:input={({ detail }) => D('input', parseInt(detail))}
/>
