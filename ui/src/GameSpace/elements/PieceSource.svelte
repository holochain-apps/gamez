<script lang="ts">
  import type { PieceSourceElement } from '../types';

  export let el: PieceSourceElement;
</script>

<div class="w-full h-full bg-red-500">{JSON.stringify(el)}</div>
