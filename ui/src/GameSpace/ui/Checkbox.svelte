<script lang="ts">
  export let label: string = 'Checkbox';
  export let value: boolean;
  export let onInput: (value: boolean) => void = () => {};
  export let disabled = false;
  let klass: string = '';
  export { klass as class };
</script>

<label class={klass}>
  <input
    type="checkbox"
    checked={value}
    {disabled}
    class="mr2"
    on:change={({ currentTarget }) => {
      onInput(currentTarget.checked);
    }}
  />
  {label}
</label>
