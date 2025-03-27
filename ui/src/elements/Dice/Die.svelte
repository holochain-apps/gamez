<script lang="ts">
  export let faces: number;
  export let result = 0;
  let klass = '';
  export { klass as class };

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
  class={`
    relative
    flexcc
    w12 h12 m2
    b-1 b-b-4 b-black/10 b-black/20
    rounded-md
    font-black
    shadow-[0_2px_2px_1px_#0004]
    ${klass}`}
  style="background-color: hsl({color[0]}, {color[1]}%, {color[2]}%);"
>
  <div
    class="absolute z-30 inset-0 flexcc text-2xl text-black/100 opacity-80"
    style="text-shadow: 0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff"
    >{result ? result : ''}</div
  >
  <div class="absolute z-10 inset-0 flexcc text-[30px] opacity-50">{faces}</div>
</div>
