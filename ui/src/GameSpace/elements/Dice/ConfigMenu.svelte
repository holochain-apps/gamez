<script lang="ts">
  import { type DiceElement } from './type';
  import Input from '../../ui/Input.svelte';

  export let el: DiceElement;
  export let onUpdate: (el: Partial<DiceElement>) => void;
  export let gameSpace: any = null;

  function diceToString(dices: { faces: number }[]) {
    return dices.map((d) => `d${d.faces}`).join(' ');
  }

  function processInputString(diceString: string) {
    diceStringInputValue = diceString;
    const diceArray = diceString
      .trim()
      .split(/\s+/)
      .map((d) => d.replace(/^d([0-9]+)$/, '$1'))
      .map((d) => parseInt(d, 10))
      .filter((d) => !isNaN(d))
      .map((d) => ({ faces: d }));

    if (
      el.dice.length !== diceArray.length ||
      el.dice.some((d, i) => d.faces !== diceArray[i].faces)
    ) {
      onUpdate({ dice: diceArray });
    }
  }

  $: convertedDiceString = diceToString(el.dice);
  let diceStringInputValue = diceToString(el.dice);
  let isEditing = false;

  function handleFinishEditing() {
    isEditing = false;
    diceStringInputValue = convertedDiceString;
  }
</script>

<div>
  <Input
    label="Dice"
    on:focus={() => (isEditing = true)}
    on:blur={handleFinishEditing}
    value={diceStringInputValue}
    onInput={processInputString}
  />
</div>
