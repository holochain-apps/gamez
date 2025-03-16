<script lang="ts">
  import { type GameSpaceSyn } from '~/store';
  import Checkbox from '../../ui/Checkbox.svelte';
  import IntegerInput from '../../ui/IntegerInput.svelte';
  import { type PlayerPieceSourceElement } from './type';

  export let el: PlayerPieceSourceElement;
  export let onUpdate: (el: Partial<PlayerPieceSourceElement>) => void;
  export let gameSpace: GameSpaceSyn;
</script>

<div class="flex flex-col space-y-4">
  <Checkbox value={el.showNames} label="Show names" onInput={(v) => onUpdate({ showNames: v })} />
  <Checkbox
    value={el.canOnlyPickOwnPiece}
    label="Can only pick own piece"
    onInput={(v) => onUpdate({ canOnlyPickOwnPiece: v })}
  />
  <Checkbox
    value={el.showEmptyPlayersSlots}
    label="Show empty players slots"
    onInput={(v) => onUpdate({ showEmptyPlayersSlots: v })}
  />
  <IntegerInput value={el.limit} label="Limit" onInput={(limit) => onUpdate({ limit })} />
  <IntegerInput value={el.size} label="Size" onInput={(size) => onUpdate({ size })} />
</div>
