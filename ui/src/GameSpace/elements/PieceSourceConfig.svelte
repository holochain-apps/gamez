<script lang="ts">
  // import EmojiPicker from '~/shared/EmojiPicker.svelte';
  import { type PieceSourceElement } from '../types.d';

  export let el: PieceSourceElement;
  export let onUpdate: (el: PieceSourceElement) => void;
</script>

{JSON.stringify(el)}
