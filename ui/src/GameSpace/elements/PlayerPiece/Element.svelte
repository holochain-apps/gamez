<script lang="ts">
  import cx from 'classnames';
  import type { PlayerPieceElement } from './type';
  import AgentAvatar from '~/shared/AgentAvatar.svelte';

  export let el: Pick<PlayerPieceElement, 'width' | 'height' | 'agent' | 'colorRing'>;
  // export let gameSpace: any = null;
  let klass: string = '';
  export { klass as class };
  export let style = '';
  $$restProps; // This prevents Svelte warnings from unused props

  $: size = Math.min(el.width, el.height) - (el.colorRing ? 6 : 0);
</script>

<AgentAvatar
  pubKey={el.agent}
  {size}
  class={cx(klass, 'w-full h-full', {
    'inline-block outline-solid outline-red outline-3 m[3px]': !!el.colorRing,
  })}
  style={`${style} ${el.colorRing ? `outline-color: ${el.colorRing}` : ''}`}
/>
