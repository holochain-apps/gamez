<script lang="ts">
  import { type ImageElement } from '../types.d';

  export let el: ImageElement;
  export let onUpdate: (el: ImageElement) => void;
</script>

{JSON.stringify(el)}
