<script lang="ts">
  import { type EmbedWalElement } from './type';
  import Input from '../../ui/Input.svelte';

  export let el: EmbedWalElement;
  export let onUpdate: (el: Partial<EmbedWalElement>) => void;
</script>

<div>
  <!-- <Input
    disabled={el.lock.config}
    label="URL"
    value={el.url}
    onInput={(url) => onUpdate({ uuid: el.uuid, url })}
  /> -->
</div>
