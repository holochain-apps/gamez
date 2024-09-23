<script lang="ts">
  import type { ImageElement } from '../types';

  export let el: ImageElement;
</script>

<img src={el.url} alt="Board" draggable={false} width={el.width} height={el.height} />
