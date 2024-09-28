<script lang="ts">
  import TrashIcon from '~icons/fa6-solid/trash';
  import LockIcon from '~icons/fa6-solid/lock';
  import LockOpenIcon from '~icons/fa6-solid/lock-open';
  import MoveIcon from '~icons/fa6-solid/up-down-left-right';
  import ArrowsLeftRight from '~icons/fa6-solid/arrows-left-right';
  import RotateIcon from '~icons/fa6-solid/rotate-right';
  import GearIcon from '~icons/fa6-solid/gear';
  import AttachmentIcon from '~icons/fa6-solid/paperclip';
  import ArrowUpIcon from '~icons/fa6-solid/arrow-up';
  import DoubleArrowUpIcon from '~icons/fa6-solid/arrows-up-to-line';

  import { tooltip } from '~/shared/tooltip';

  import { type LockConfig } from './types.d';

  export let lockConfig: LockConfig;
  export let onLock = (lockConfig: LockConfig) => {};

  const base = 'relative bg-black/10 p2 b b-gray-300 flexcc text-black/60 hover:bg-black/5 z-20';
  const klass = `${base} rounded-md`;
  const groupKlass = `${base} b-r-0 last:(rounded-r-md b-r) first:rounded-l-md flex-grow`;
  const groupKlassL2 = groupKlass.replace('p2', 'p.5').replace('b-gray-300', 'b-gray-500');
  const klassL2 = klass.replace('b-gray-300', 'b-gray-400');

  $: processLocking = (
    position: number,
    size: number,
    rotation: number,
    config: number,
    wals: number,
  ) => {
    console.log('Processing locking', position, size, rotation, config, wals);
    const targetLock: LockConfig = {
      position: !!position,
      size: !!size,
      rotation: !!rotation,
      config: !!config,
      wals: !!wals,
    };

    const newLock = { ...lockConfig };
    if (!isLocked(position, size, rotation, config, wals)) {
      Object.entries(targetLock).forEach(([k, v]) => {
        if (v) {
          newLock[k as keyof LockConfig] = true;
        }
      });
    } else {
      Object.entries(targetLock).forEach(([k, v]) => {
        if (v) {
          newLock[k as keyof LockConfig] = false;
        }
      });
    }

    onLock(newLock);
  };

  $: isLocked = (
    position: number,
    size: number,
    rotation: number,
    config: number,
    wals: number,
  ) => {
    const targetLock: LockConfig = {
      position: !!position,
      size: !!size,
      rotation: !!rotation,
      config: !!config,
      wals: !!wals,
    };

    return Object.entries(targetLock).every(([k, v]) => {
      if (!v) {
        return true;
      } else {
        return lockConfig[k as keyof LockConfig] === v;
      }
    });
  };
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
  <button
    on:click={() => processLocking(1, 1, 1, 1, 1)}
    use:tooltip={'Everything'}
    class="p2 w-10 flex-shrink-0 flexcc group"
  >
    {#if isLocked(1, 1, 1, 1, 1)}
      <div class="text-red-600 drop-shadow-border">
        <LockIcon class="relative z-20 " />
      </div>
    {:else}
      <LockOpenIcon class="relative z-20" />
    {/if}
    <div class="group-hover:bg-white/40 absolute inset-0 z-10 rounded-md"></div>
  </button>
  <div class="relative z-20 flex bg-black/10 b b-gray-400 rounded-md p1 flex-basis-4">
    <div class="flex bg-black/10 rounded-md flex-basis-3 z-20">
      <button
        on:click={() => processLocking(1, 0, 0, 0, 0)}
        use:tooltip={'Movement'}
        class={groupKlassL2}
      >
        <MoveIcon />
        {#if lockConfig.position}
          <div class="text-[8px] absolute top-.5 right-.5 text-red-600 drop-shadow-border">
            <LockIcon />
          </div>
        {/if}
      </button>
      <button
        on:click={() => processLocking(0, 1, 0, 0, 0)}
        use:tooltip={'Resizing'}
        class={groupKlassL2}
        ><ArrowsLeftRight class="rotate-45" />
        {#if lockConfig.size}
          <div class="text-[8px] absolute top-.5 right-.5 text-red-600 drop-shadow-border">
            <LockIcon />
          </div>
        {/if}</button
      >
      <button
        on:click={() => processLocking(0, 0, 1, 0, 0)}
        use:tooltip={'Rotation'}
        class={groupKlassL2}
        ><RotateIcon class="rotate-45 scale-x-[-1] relative top-.5" />
        {#if lockConfig.rotation}
          <div class="text-[8px] absolute top-.5 right-.5 text-red-600 drop-shadow-border">
            <LockIcon />
          </div>
        {/if}
      </button>
    </div>
    <button
      on:click={() => processLocking(1, 1, 1, 0, 0)}
      use:tooltip={'Positioning'}
      class="p1 w-10 flex-shrink-0 flexcc group"
    >
      {#if isLocked(1, 1, 1, 0, 0)}
        <div class="text-red-600 drop-shadow-border">
          <LockIcon class="relative z-20 " />
        </div>
      {:else}
        <LockOpenIcon class="relative z-20" />
      {/if}
      <div class="group-hover:bg-white/40 absolute inset-0 z-10 rounded-md"></div>
    </button>
  </div>
  <button
    on:click={() => processLocking(0, 0, 0, 1, 0)}
    use:tooltip={'Configuration'}
    class={klassL2}
    ><GearIcon />
    {#if lockConfig.config}
      <div class="text-[8px] absolute top-.5 right-.5 text-red-600 drop-shadow-border">
        <LockIcon />
      </div>
    {/if}
  </button>
  <button
    on:click={() => processLocking(0, 0, 0, 0, 1)}
    use:tooltip={'Attachments'}
    class={klassL2}
  >
    <AttachmentIcon />
    {#if lockConfig.wals}
      <div class="text-[8px] absolute top-.5 right-.5 text-red-600 drop-shadow-border">
        <LockIcon />
      </div>
    {/if}
  </button>
</div>

<style>
  .drop-shadow-border {
    filter: drop-shadow(0 1px 0 #000) drop-shadow(0 -1px 0 #000) drop-shadow(1px 0 0 #000)
      drop-shadow(-1px 0 0 #000);
  }
</style>
