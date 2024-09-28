<script lang="ts">
  import ArrowUpIcon from '~icons/fa6-solid/arrow-up';
  import DoubleArrowUpIcon from '~icons/fa6-solid/arrows-up-to-line';
  import TrashIcon from '~icons/fa6-solid/trash';

  const base = 'relative bg-black/10 p2 b b-gray-300 flexcc text-black/60 hover:bg-black/5 z-20';
  const klass = `${base} rounded-md`;
  const groupKlass = `${base} b-r-0 last:(rounded-r-md b-r) first:rounded-l-md flex-grow`;
</script>

<div class="flex space-x-2 mb2">
  <div class="flex flex-grow">
    <button class={groupKlass}><DoubleArrowUpIcon /></button>
    <button class={groupKlass}><ArrowUpIcon /></button>
    <button class={groupKlass}><ArrowUpIcon class="rotate-180" /></button>
    <button class={groupKlass}><DoubleArrowUpIcon class="rotate-180" /></button>
  </div>
  <button class={klass}> <TrashIcon /></button>
</div>
