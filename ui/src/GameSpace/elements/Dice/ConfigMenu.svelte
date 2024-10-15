<script lang="ts">
  import { type DiceElement } from './type';
  import Input from '../../ui/Input.svelte';

  export let el: DiceElement;
  export let onUpdate: (el: Partial<DiceElement>) => void;
  export let gameSpace: any = null;

  function diceToString(dices: { faces: number }[]) {
    return dices.map((d) => `d${d.faces}`).join(' ');
  }

  let diceStringInputValue = diceToString(el.dice);
  let stringHasErrors = false;
  let dice: { faces: number }[] = el.dice;

  function processInputString(diceString: string) {
    diceStringInputValue = diceString;
    const diceDefArray = diceString
      .trim()
      .split(/\s+/)
      .map((d) => d.match(/^(\d+)?d(\d+)$/));

    let diceErr = false;

    const newDice = diceDefArray.reduce<{ faces: number }[]>((acc, next) => {
      if (next && next[2]) {
        const count = parseInt(next[1] || '1', 10);
        const faces = parseInt(next[2], 10);
        for (let i = 0; i < count; i++) {
          acc.push({ faces });
        }
      } else {
        diceErr = true;
      }
      return acc;
    }, []);

    stringHasErrors = diceErr;
    dice = newDice;
  }

  function handleFinishEditing() {
    if (
      (!stringHasErrors && el.dice.length !== dice.length) ||
      el.dice.some((d, i) => d.faces !== dice[i].faces)
    ) {
      onUpdate({ dice });
    }
  }
</script>

<div class="py2">
  <Input
    error={stringHasErrors}
    label="Dice"
    on:blur={handleFinishEditing}
    value={diceStringInputValue}
    onInput={processInputString}
  />
</div>
