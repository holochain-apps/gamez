<script lang="ts">
  import Checkbox from '~/GameSpace/center/input/Checkbox.svelte';
  import { type TurnTrackerElement } from './type';

  export let el: TurnTrackerElement;
  export let onUpdate: (el: Partial<TurnTrackerElement>) => void;
</script>

<div>
  <Checkbox
    value={el.showTimers}
    label="Show timers"
    onInput={(v) => onUpdate({ showTimers: v })}
  />
</div>
<div>
  <Checkbox
    value={el.showEmptyPlayersSlots}
    label="Show empty players slots"
    onInput={(v) => onUpdate({ showEmptyPlayersSlots: v })}
  />
</div>
