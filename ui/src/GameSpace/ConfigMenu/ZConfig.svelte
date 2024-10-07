<script lang="ts">
  import ArrowUpIcon from '~icons/fa6-solid/arrow-up';
  import DoubleArrowUpIcon from '~icons/fa6-solid/arrows-up-to-line';

  export let onMoveZ: (z: 'top' | 'bottom' | 'up' | 'down') => void;
  export let disabled: boolean;

  const klass = `
    flex-grow flexcc
    p2
    b b-gray-300 b-r-0 last:(rounded-r-md b-r) first:rounded-l-md
    bg-black/10 hover:bg-black/5 disabled:(opacity-50 saturate-50 bg-black/10)
    text-black/60
  `;
</script>

<div class="flex flex-grow">
  <button {disabled} on:click={() => onMoveZ('top')} class={klass}><DoubleArrowUpIcon /></button>
  <button {disabled} on:click={() => onMoveZ('up')} class={klass}><ArrowUpIcon /></button>
  <button {disabled} on:click={() => onMoveZ('down')} class={klass}
    ><ArrowUpIcon class="rotate-180" /></button
  >
  <button {disabled} on:click={() => onMoveZ('bottom')} class={klass}
    ><DoubleArrowUpIcon class="rotate-180" /></button
  >
</div>
