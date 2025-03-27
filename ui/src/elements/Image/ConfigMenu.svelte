<script lang="ts">
  import { type ImageElement } from './type';
  import Input from '~/GameSpace/center/input/Input.svelte';

  export let el: ImageElement;
  export let onUpdate: (el: ImageElement) => void;
</script>

<div>
  <Input label="URL" value={el.url} onInput={(url) => onUpdate({ ...el, url })} />
</div>
