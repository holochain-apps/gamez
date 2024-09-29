<script lang="ts">
  import type { EmbedWalElement } from '../types';

  export let el: EmbedWalElement;
  let klass: string = '';
  export { klass as class };
</script>

<div class={`${klass} bg-white w-full h-full`}>
  {JSON.stringify(el)}
</div>
