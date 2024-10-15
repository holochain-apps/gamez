<script lang="ts">
  import { type DiceElement } from './type';
  import Input from '../../ui/Input.svelte';

  export let el: DiceElement;
  export let onUpdate: (el: Partial<DiceElement>) => void;
  export let gameSpace: any = null;

  function diceToString(dices: { faces: number }[]) {
    return dices
      .toSorted((a, b) => a.faces - b.faces)
      .reduce<[number, number][]>((acc, next, i) => {
        if (i === 0) {
          acc.push([1, next.faces]);
        } else {
          const last = acc[acc.length - 1];
          if (last[1] === next.faces) {
            last[0]++;
          } else {
            acc.push([1, next.faces]);
          }
        }
        return acc;
      }, [])
      .map(([count, faces]) => `${count === 1 ? '' : count}d${faces}`)
      .join(' ');
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
    dice = newDice.toSorted((a, b) => a.faces - b.faces);
  }

  function handleFinishEditing() {
    if (
      (!stringHasErrors && el.dice.length !== dice.length) ||
      el.dice.some((d, i) => d.faces !== dice[i].faces)
    ) {
      onUpdate({ dice });
      diceStringInputValue = diceToString(dice);
    }
  }
</script>

<div class="py2">
  <Input
    disabled={el.lock.config}
    error={stringHasErrors}
    label="Dice"
    on:blur={handleFinishEditing}
    value={diceStringInputValue}
    onInput={processInputString}
    on:keydown={({ key }) => key === 'Enter' && handleFinishEditing()}
  />
</div>
