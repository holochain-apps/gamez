<script lang="ts">
  import TrashIcon from '~icons/fa6-solid/trash';
  import LockIcon from '~icons/fa6-solid/lock';
  import LockOpenIcon from '~icons/fa6-solid/lock-open';
  import MoveIcon from '~icons/fa6-solid/up-down-left-right';
  import ResizeIcon from '~icons/fa6-solid/expand';
  import RotateIcon from '~icons/fa6-solid/rotate-right';
  import GearIcon from '~icons/fa6-solid/gear';
  import AttachmentIcon from '~icons/fa6-solid/paperclip';
  import ArrowUpIcon from '~icons/fa6-solid/arrow-up';
  import DoubleArrowUpIcon from '~icons/fa6-solid/arrows-up-to-line';

  const base = 'relative bg-black/10 p2 b b-gray-300 flexcc text-black/60 hover:bg-black/5 z-20';
  const klass = `${base} rounded-md`;
  const groupKlass = `${base} b-r-0 last:(rounded-r-md b-r) first:rounded-l-md flex-grow`;
  const groupKlassL2 = groupKlass.replace('p2', 'p.5').replace('b-gray-300', 'b-gray-500');
  const klassL2 = klass.replace('b-gray-300', 'b-gray-400');
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
<div class="relative flex bg-black/10 b b-gray-300 rounded-md space-x-2 p1 mb2">
  <button class="p2 flex-basis-1 flex-grow flexcc group">
    <LockIcon class="relative z-20" />
    <div class="group-hover:bg-white/40 absolute inset-0 z-10 rounded-md"></div>
  </button>
  <div class="relative z-20 flex bg-black/10 b b-gray-400 rounded-md p1 flex-basis-4">
    <div class="flex bg-black/10 rounded-md flex-basis-3 z-20">
      <button class={groupKlassL2}><MoveIcon /></button>
      <button class={groupKlassL2}><ResizeIcon /></button>
      <button class={groupKlassL2}><RotateIcon /></button>
    </div>
    <button class="p1 flex-basis-1 group">
      <LockIcon class="relative z-20" />
      <div class="group-hover:bg-white/40 absolute inset-0 z-10 rounded-md"></div>
    </button>
  </div>
  <button class={klassL2}><GearIcon /></button>
  <button class={klassL2}><AttachmentIcon /></button>
</div>
