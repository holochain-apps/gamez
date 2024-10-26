<script lang="ts">
  import { type FooTemplateElement } from './type';

  export let el: FooTemplateElement;
  // export let onUpdate: (el: Partial<FooTemplateElement>) => void;
  // export let gameSpace: any = null;
  $$restProps; // This prevents Svelte warnings from unused props
</script>

<div>
  {JSON.stringify(el)}
</div>
