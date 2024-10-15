<script lang="ts">
  export let faces: number;
  export let result = 0;

  const colors = {
    2: [70, 10, 70],
    4: [60, 80, 50],
    6: [0, 0, 90],
    8: 150,
    10: 200,
    12: 350,
    20: [110, 60, 50],
  };

  $: color = colors[faces]
    ? Array.isArray(colors[faces])
      ? colors[faces]
      : [colors[faces], 50, 60]
    : [0, 0, 40];
</script>

<div
  class="w12 h12 rounded-md flexcc text-xl font-black m2 b-1 b-b-4 b-black/10 b-black/20 shadow-[0_2px_2px_1px_#0004]"
  style="background-color: hsl({color[0]}, {color[1]}%, {color[2]}%);"
>
  {result ? result : ''}
  <span class="text-xs opacity-50">/{faces}</span>
</div>
