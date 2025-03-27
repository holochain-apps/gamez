<script lang="ts">
  import type { GElement } from '~/store';
  import * as elements from '../elements';

  export let el: GElement;

  $: Element = elements[el.type].Element as any;
</script>

<svelte:component this={Element} {el} />
