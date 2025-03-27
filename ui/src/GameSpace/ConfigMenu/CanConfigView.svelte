<script lang="ts">
  import { type CanConfig } from '~/store';
  export let canConfig: CanConfig;

  import MoveIcon from '~icons/fa6-solid/up-down-left-right';
  import ArrowsLeftRight from '~icons/fa6-solid/arrows-left-right';
  import RotateIcon from '~icons/fa6-solid/rotate-right';
  import GearIcon from '~icons/fa6-solid/gear';
  import AttachmentIcon from '~icons/fa6-solid/paperclip';
  import TrashIcon from '~icons/fa6-solid/trash';
  import CopyIcon from '~icons/fa6-solid/copy';
  import { cx } from '~/center/lib/util';
  import { tooltip } from '~/center/lib/tooltip';

  const klass = (v) =>
    cx('flex-grow pointer-events-auto text-green-600/90 drop-shadow-border flexcc h-full', {
      'opacity-50 saturate-0': !v,
    });

  function tooltipText(can: boolean, text: string) {
    return `${can ? 'Can' : 'Cannot'} ${text}`;
  }
</script>

<div class="flex bg-black/10 b-b b-black/10 -mx-2 -mt2 mb2 h8">
  <div class={klass(canConfig.move)} use:tooltip={tooltipText(canConfig.move, 'be moved')}
    ><MoveIcon /></div
  >
  <div class={klass(canConfig.resize)} use:tooltip={tooltipText(canConfig.resize, 'be resized')}
    ><ArrowsLeftRight class="rotate-45" /></div
  >
  <div class={klass(canConfig.rotate)} use:tooltip={tooltipText(canConfig.rotate, 'be rotated')}
    ><RotateIcon /></div
  >
  <div
    class={klass(canConfig.configurate)}
    use:tooltip={tooltipText(canConfig.configurate, 'be configured')}><GearIcon /></div
  >
  <div
    class={klass(canConfig.attach)}
    use:tooltip={tooltipText(canConfig.attach, 'add/remove attachments')}><AttachmentIcon /></div
  >
  <div class={klass(canConfig.remove)} use:tooltip={tooltipText(canConfig.remove, 'be removed')}
    ><TrashIcon /></div
  >
  <div
    class={klass(canConfig.duplicate)}
    use:tooltip={tooltipText(canConfig.duplicate, 'be duplicated')}><CopyIcon /></div
  >
</div>
