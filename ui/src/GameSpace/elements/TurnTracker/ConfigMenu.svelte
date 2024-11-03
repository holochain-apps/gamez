<script lang="ts">
  import Checkbox from '~/GameSpace/ui/Checkbox.svelte';
  import { type TurnTrackerElement } from './type';

  export let el: TurnTrackerElement;
  export let onUpdate: (el: Partial<TurnTrackerElement>) => void;
  // export let gameSpace: any = null;
  $$restProps; // This prevents Svelte warnings from unused props
</script>

<div>
  <Checkbox
    value={el.showTimers}
    label="Show timers"
    onInput={(v) => onUpdate({ showTimers: v })}
    disabled={el.lock.config}
  />
</div>
