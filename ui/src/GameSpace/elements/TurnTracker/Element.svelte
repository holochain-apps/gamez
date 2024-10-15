<script lang="ts">
  import { type GameSpaceSyn } from '../../store/GameSpaceSyn';
  import type { TurnTrackerElement } from './type';

  export let el: TurnTrackerElement;
  export let gameSpace: GameSpaceSyn;
</script>

<div>
  {JSON.stringify(el)}
</div>
