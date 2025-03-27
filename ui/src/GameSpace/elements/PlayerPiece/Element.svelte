<script lang="ts">
  import type { PlayerPieceElement } from './type';
  import { getGSS, type GameSpaceSyn } from '~/store';
  import PlayerIcon from '~/GameSpace/ui/PlayerIcon.svelte';

  export let el: Pick<PlayerPieceElement, 'width' | 'height' | 'playerSlot'>;

  let klass: string = '';
  export { klass as class };
  export let style = '';

  const GSS = getGSS();
  $: GS = GSS.state;
  $: playerInfo = $GS ? $GS.playersSlots[el.playerSlot] : null;
  $: color = playerInfo ? playerInfo.color : '#000';

  $: size = Math.min(el.width, el.height);
</script>

<div class="relative size-full">
  <div class="absolute inset-0 rounded-full opacity-0 z-100"></div>
  <PlayerIcon
    pubKey={playerInfo?.pubKey}
    slot={el.playerSlot}
    {size}
    {color}
    class={klass}
    {style}
  />
</div>
