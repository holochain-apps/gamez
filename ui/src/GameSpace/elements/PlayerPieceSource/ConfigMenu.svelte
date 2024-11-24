<script lang="ts">
  import { type GameSpaceSyn } from '~/store';
  import Checkbox from '../../ui/Checkbox.svelte';
  import IntegerInput from '../../ui/IntegerInput.svelte';
  import { type PlayerPieceSourceElement } from './type';

  export let el: PlayerPieceSourceElement;
  export let onUpdate: (el: Partial<PlayerPieceSourceElement>) => void;
  export let gameSpace: GameSpaceSyn;

  $: state = gameSpace.state;
</script>

<div class="flex flex-col space-y-4">
  <Checkbox
    value={el.showNames}
    label="Show names"
    onInput={(v) => onUpdate({ showNames: v })}
    disabled={el.lock.config}
  />
  <Checkbox
    value={el.canOnlyPickOwnPiece}
    label="Can only pick own piece"
    onInput={(v) => onUpdate({ canOnlyPickOwnPiece: v })}
    disabled={el.lock.config}
  />
  <Checkbox
    value={el.showEmptyPlayersSlots}
    label="Show empty players slots"
    onInput={(v) => onUpdate({ showEmptyPlayersSlots: v })}
    disabled={el.lock.config}
  />
  <IntegerInput
    value={el.limit}
    label="Limit"
    onInput={(limit) => onUpdate({ limit })}
    disabled={el.lock.config}
  />
  <IntegerInput
    value={el.size}
    label="Size"
    onInput={(size) => onUpdate({ size })}
    disabled={el.lock.config}
  />
</div>
