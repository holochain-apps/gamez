<script lang="ts">
  import LockIcon from '~icons/fa6-solid/lock';
  import LockOpenIcon from '~icons/fa6-solid/lock-open';
  import MoveIcon from '~icons/fa6-solid/up-down-left-right';
  import ArrowsLeftRight from '~icons/fa6-solid/arrows-left-right';
  import RotateIcon from '~icons/fa6-solid/rotate-right';
  import GearIcon from '~icons/fa6-solid/gear';
  import AttachmentIcon from '~icons/fa6-solid/paperclip';
  import TrashIcon from '~icons/fa6-solid/trash';
  import CopyIcon from '~icons/fa6-solid/copy';

  import { tooltip } from '~/center/lib/tooltip';

  import { type CanConfig } from '~/store';

  export let canConfig: CanConfig;
  export let onCanChange: (canConfig: CanConfig) => void;

  const base = 'relative bg-black/10 p2 b b-black/10 flexcc text-black/60 hover:bg-black/5 z-20';
  const groupKlass = `${base} b-r-0 last:(rounded-r-md b-r) first:rounded-l-md flex-grow`;
  const groupKlassL2 = groupKlass;

  function handleToggleAll() {
    if (isFullyEnabled) {
      onCanChange({
        move: false,
        resize: false,
        rotate: false,
        configurate: false,
        attach: false,
        remove: false,
        duplicate: false,
      });
    } else {
      onCanChange({
        move: true,
        resize: true,
        rotate: true,
        configurate: true,
        attach: true,
        remove: true,
        duplicate: true,
      });
    }
  }

  $: processNewCanConfig = (
    move: number,
    resize: number,
    rotate: number,
    configurate: number,
    attach: number,
    remove: number,
    duplicate: number,
  ) => {
    const targetCan: CanConfig = {
      move: !!move,
      resize: !!resize,
      rotate: !!rotate,
      configurate: !!configurate,
      attach: !!attach,
      remove: !!remove,
      duplicate: !!duplicate,
    };

    const newCan = { ...canConfig };
    Object.entries(targetCan).forEach(([k, v]) => {
      if (v) {
        newCan[k as keyof CanConfig] = !newCan[k as keyof CanConfig];
      }
    });

    onCanChange(newCan);
  };

  $: isPartiallyEnabled = Object.values(canConfig).some((v) => v);
  $: isFullyEnabled = Object.values(canConfig).every((v) => v);

  // $: isFullyEnabled = (
  //   move: number,
  //   resize: number,
  //   rotate: number,
  //   configurate: number,
  //   attach: number,
  //   remove: number,
  //   duplicate: number,
  // ) => {
  //   const targetCan: CanConfig = {
  //     move: !!move,
  //     resize: !!resize,
  //     rotate: !!rotate,
  //     configurate: !!configurate,
  //     attach: !!attach,
  //     remove: !!remove,
  //     duplicate: !!duplicate,
  //   };

  //   return Object.entries(canConfig).every(([k, v]) => {
  //     if (v) {
  //       return true;
  //     } else {
  //       return targetCan[k as keyof CanConfig] === v;
  //     }
  //   });
  // };
  function tooltipText(can: boolean, text: string) {
    return `${can ? 'Can' : 'Cannot'} ${text}`;
  }
</script>

<div class="flex bg-black/10 b-b b-black/10 -mx-2 -mt2 pt2 pr2 mb2">
  <button
    class="h-10 w-10 flexcc"
    on:click={handleToggleAll}
    use:tooltip={'Allowed actions during game mode'}
  >
    {#if isFullyEnabled}
      <LockOpenIcon class="" />
    {:else if isPartiallyEnabled}
      <div class="drop-shadow-border">
        <LockIcon class="text-yellow-600" />
      </div>
    {:else}
      <div class="drop-shadow-border">
        <LockIcon class="text-red-600" />
      </div>
    {/if}
  </button>
  <div class="relative flex h-10 flex-grow mb2">
    <!-- <button
    on:click={() => processNewCanConfig(1, 1, 1, 1, 1, 1, 1)}
    use:tooltip={'Everything'}
    class="p2 w-10 flex-shrink-0 flexcc group"
  >
    {#if !isFullyEnabled(1, 1, 1, 1, 1, 1, 1)}
      <div class="text-red-600 drop-shadow-border">
        <LockIcon class="relative z-20 " />
      </div>
    {:else}
      <LockOpenIcon class="relative z-20" />
    {/if}
    <div class="group-hover:bg-white/40 absolute inset-0 z-10 rounded-md"></div>
  </button> -->
    <!-- <div class="relative z-20 flex bg-black/10 b b-gray-400 rounded-md p1 flex-basis-4"> -->
    <!-- <div class="flex bg-black/10 rounded-md z-20"> -->
    <button
      on:click={() => processNewCanConfig(1, 0, 0, 0, 0, 0, 0)}
      use:tooltip={tooltipText(canConfig.move, 'be moved')}
      class={groupKlassL2}
    >
      <MoveIcon />
      {#if !canConfig.move}
        <div class="text-[8px] absolute top-.5 right-.5 text-red-600 drop-shadow-border">
          <LockIcon />
        </div>
      {/if}
    </button>
    <button
      on:click={() => processNewCanConfig(0, 1, 0, 0, 0, 0, 0)}
      use:tooltip={tooltipText(canConfig.resize, 'be resized')}
      class={groupKlassL2}
      ><ArrowsLeftRight class="rotate-45" />
      {#if !canConfig.resize}
        <div class="text-[8px] absolute top-.5 right-.5 text-red-600 drop-shadow-border">
          <LockIcon />
        </div>
      {/if}</button
    >
    <button
      on:click={() => processNewCanConfig(0, 0, 1, 0, 0, 0, 0)}
      use:tooltip={tooltipText(canConfig.rotate, 'be rotated')}
      class={groupKlassL2}
      ><RotateIcon class="rotate-45 scale-x-[-1] relative top-.5" />
      {#if !canConfig.rotate}
        <div class="text-[8px] absolute top-.5 right-.5 text-red-600 drop-shadow-border">
          <LockIcon />
        </div>
      {/if}
    </button>
    <button
      on:click={() => processNewCanConfig(0, 0, 0, 1, 0, 0, 0)}
      use:tooltip={tooltipText(canConfig.configurate, 'be configured')}
      class={groupKlassL2}
      ><GearIcon />
      {#if !canConfig.configurate}
        <div class="text-[8px] absolute top-.5 right-.5 text-red-600 drop-shadow-border">
          <LockIcon />
        </div>
      {/if}
    </button>
    <button
      on:click={() => processNewCanConfig(0, 0, 0, 0, 1, 0, 0)}
      use:tooltip={tooltipText(canConfig.attach, 'add/remove attachments')}
      class={groupKlassL2}
    >
      <AttachmentIcon />
      {#if !canConfig.attach}
        <div class="text-[8px] absolute top-.5 right-.5 text-red-600 drop-shadow-border">
          <LockIcon />
        </div>
      {/if}
    </button>
    <button
      on:click={() => processNewCanConfig(0, 0, 0, 0, 0, 1, 0)}
      use:tooltip={tooltipText(canConfig.remove, 'be removed')}
      class={groupKlassL2}
    >
      <TrashIcon />
      {#if !canConfig.remove}
        <div class="text-[8px] absolute top-.5 right-.5 text-red-600 drop-shadow-border">
          <LockIcon />
        </div>
      {/if}
    </button>
    <button
      on:click={() => processNewCanConfig(0, 0, 0, 0, 0, 0, 1)}
      use:tooltip={tooltipText(canConfig.duplicate, 'be duplicated')}
      class={groupKlassL2}
    >
      <CopyIcon />
      {#if !canConfig.duplicate}
        <div class="text-[8px] absolute top-.5 right-.5 text-red-600 drop-shadow-border">
          <LockIcon />
        </div>
      {/if}
    </button>
    <!-- </div> -->
    <!-- <button
      on:click={() => processNewCanConfig(1, 1, 1, 0, 0, 0, 0)}
      use:tooltip={'Positioning'}
      class="p1 w-10 flex-shrink-0 flexcc group"
    >
      {#if !isFullyEnabled(1, 1, 1, 0, 0, 0, 0)}
        <div class="text-red-600 drop-shadow-border">
          <LockIcon class="relative z-20 " />
        </div>
      {:else}
        <LockOpenIcon class="relative z-20" />
      {/if}
      <div class="group-hover:bg-white/40 absolute inset-0 z-10 rounded-md"></div>
    </button> -->
    <!-- </div> -->
  </div>
</div>

<style>
  .drop-shadow-border {
    filter: drop-shadow(0 1px 0 #000) drop-shadow(0 -1px 0 #000) drop-shadow(1px 0 0 #000)
      drop-shadow(-1px 0 0 #000);
  }
</style>
