<script lang="ts">
  import { type GameSpaceSyn } from '../../store/GameSpaceSyn';
  import { type PlayerPieceElement } from './type';

  export let el: PlayerPieceElement;
  export let onUpdate: (el: PlayerPieceElement) => void;
  export let gameSpace: GameSpaceSyn;

  $: state = gameSpace.state;
</script>

<div></div>
