<script lang="ts">
  import type { ImageElement } from './type';

  export let el: ImageElement;
  // export let gameSpace: any = null;
  $$restProps; // This prevents Svelte warnings from unused props
</script>

<img src={el.url} class="object-contain w-full h-full" alt="Board" draggable={false} />
