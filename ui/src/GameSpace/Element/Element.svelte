<script lang="ts">
  import type { GElement, GameSpaceSyn } from '~/store';
  import * as elements from '../elements';

  export let el: GElement;
  let klass: string = '';
  export { klass as class };

  $: Element = elements[el.type].Element as any;
</script>

<div class="size-full">
  <svelte:component this={Element} {el} />
</div>
