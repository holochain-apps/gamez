<script lang="ts">
  import { type GameSpaceSyn } from '~/store';
  import type { FooTemplateElement } from './type';

  export let el: FooTemplateElement;
  // export let gameSpace: GameSpaceSyn;
  // export let isLocked: boolean
  $$restProps; // This prevents Svelte warnings from unused props
</script>

<div>
  {JSON.stringify(el)}
</div>
