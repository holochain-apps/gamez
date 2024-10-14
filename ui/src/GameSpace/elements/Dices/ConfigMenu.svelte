<script lang="ts">
  import { type DicesElement } from './type';
  import Input from '../../ui/Input.svelte';

  export let el: DicesElement;
  export let onUpdate: (el: Partial<DicesElement>) => void;
</script>

<div>
  <!-- <Input
    disabled={el.lock.config}
    label=""
    value={el.url}
    onInput={(url) => onUpdate({ ...el, url })}
  /> -->
</div>
