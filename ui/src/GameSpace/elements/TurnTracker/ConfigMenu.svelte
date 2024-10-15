<script lang="ts">
  import { type TurnTrackerElement } from './type';

  export let el: TurnTrackerElement;
  export let onUpdate: (el: Partial<TurnTrackerElement>) => void;
  export let gameSpace: any = null;
</script>

<div>
  {JSON.stringify(el)}
</div>
