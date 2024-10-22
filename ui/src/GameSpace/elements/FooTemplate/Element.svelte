<script lang="ts">
  import { type GameSpaceSyn } from '~/store';
  import type { FooTemplateElement } from './type';

  export let el: FooTemplateElement;
  export let gameSpace: GameSpaceSyn;
</script>

<div>
  {JSON.stringify(el)}
</div>
