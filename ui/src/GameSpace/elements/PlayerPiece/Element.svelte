<script lang="ts">
  import type { PlayerPieceElement } from './type';
  import { type GameSpaceSyn } from '~/store';
  import PlayerIcon from '~/GameSpace/ui/PlayerIcon.svelte';

  export let el: Pick<PlayerPieceElement, 'width' | 'height' | 'playerSlot'>;
  export let gameSpace: GameSpaceSyn;
  let klass: string = '';
  export { klass as class };
  export let style = '';
  $$restProps; // This prevents Svelte warnings from unused props

  $: state = gameSpace.state;
  $: playerInfo = $state ? $state.playersSlots[el.playerSlot] : null;
  $: color = playerInfo ? playerInfo.color : '#000';

  $: size = Math.min(el.width, el.height);
</script>

<PlayerIcon pubKey={playerInfo?.pubKey} slot={el.playerSlot} {size} {color} class={klass} {style} />
