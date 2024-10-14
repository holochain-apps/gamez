<script lang="ts">
  import TrashIcon from '~icons/fa6-solid/trash';
  import { type DiceElement } from './type';
  import Input from '../../ui/Input.svelte';

  export let el: DiceElement;
  export let onUpdate: (el: Partial<DiceElement>) => void;

  function dicesToString(dices: { faces: number }[]) {
    return dices.map((d) => `d${d.faces}`).join(' ');
  }

  function processInputString(diceString: string) {
    console.log(diceString);
  }
</script>

<div>
  <Input label="Dice" value={dicesToString(el.dice)} onInput={processInputString} />
</div>
