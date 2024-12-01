<script lang="ts">
  import { COLORS, colorSequence, cx } from '~/lib/util';

  export let value: string;
  export let onChange: (value: string) => void;
</script>

<div class="w-full whitespace-nowrap">
  {#each COLORS as color, i}
    <button
      style={`background: ${color};`}
      class={cx('inline-block w-5 h-5 rounded-full b-2 b-black/10', {
        'b-black/30 shadow-md scale-130': color === value,
      })}
      on:click={() => onChange(color)}
    ></button>
    {#if i % 5 === 4}
      <br />
    {/if}
  {/each}
</div>
