<script lang="ts">
  import Checkbox from '~/GameSpace/ui/Checkbox.svelte';

  import { type EmbedWalElement } from './type';
  // import Input from '../../ui/Input.svelte';

  export let el: EmbedWalElement;
  export let onUpdate: (el: Partial<EmbedWalElement>) => void;
  $$restProps; // This prevents Svelte warnings from unused props
</script>

<div>
  <Checkbox
    value={el.preview}
    label={'Preview'}
    onInput={(preview) => onUpdate({ uuid: el.uuid, preview })}
  />
</div>
