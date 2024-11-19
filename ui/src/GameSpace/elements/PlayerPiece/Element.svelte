<script lang="ts">
  import cx from 'classnames';
  import type { PlayerPieceElement } from './type';
  import { type GameSpaceSyn } from '~/store';
  import AgentAvatar from '~/shared/AgentAvatar.svelte';

  export let el: Pick<PlayerPieceElement, 'width' | 'height' | 'playerSlot'>;
  export let gameSpace: GameSpaceSyn;
  let klass: string = '';
  export { klass as class };
  export let style = '';
  $$restProps; // This prevents Svelte warnings from unused props

  $: state = gameSpace.state;
  $: playerInfo = $state ? $state.playersSlots[el.playerSlot] : null;
  $: color = playerInfo ? playerInfo.color : '#000';
  $: contrastColor = '#fff';

  $: size = Math.min(el.width, el.height);

  $: {
    console.log(el);
  }
</script>

<div
  class={`relative flexcc rounded-full text-white b-2 b-black/10 shadow-md ${klass}`}
  style={`width: ${size}px; height: ${size}px; background-color: ${color}; color: ${contrastColor}; ${style}`}
>
  {#if playerInfo?.pubKey}
    <AgentAvatar pubKey={playerInfo.pubKey} size={size - 4} class="relative z-20" />
  {/if}
  <div class="absolute z-10 inset-0 flexcc mix-blend-difference opacity-50">{el.playerSlot + 1}</div
  >
</div>
