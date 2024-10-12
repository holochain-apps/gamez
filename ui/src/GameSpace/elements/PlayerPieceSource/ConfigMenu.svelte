<script lang="ts">
  import { type GameSpaceSyn } from '../../store/GameSpaceSyn';
  import Checkbox from '../../ui/Checkbox.svelte';
  import IntegerInput from '../../ui/IntegerInput.svelte';
  import { type PlayerPieceSourceElement } from './type';

  export let el: PlayerPieceSourceElement;
  export let onUpdate: (el: PlayerPieceSourceElement) => void;
  export let gameSpace: GameSpaceSyn;

  $: state = gameSpace.state;
</script>

<div class="flex flex-col space-y-4">
  <Checkbox
    value={el.showNames}
    label="Show names"
    onInput={(v) => onUpdate({ ...el, showNames: v })}
  />
  <Checkbox
    value={el.canOnlyPickOwnPiece}
    label="Can only pick own piece"
    onInput={(v) => onUpdate({ ...el, canOnlyPickOwnPiece: v })}
  />
  <Checkbox
    value={el.colorCoded}
    label="Color coded"
    onInput={(v) => onUpdate({ ...el, colorCoded: v })}
  />
  <IntegerInput value={el.limit} label="Limit" onInput={(limit) => onUpdate({ ...el, limit })} />
  <IntegerInput value={el.size} label="Size" onInput={(size) => onUpdate({ ...el, size })} />
</div>
