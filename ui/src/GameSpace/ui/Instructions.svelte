<script lang="ts">
  import InfoIcon from '~icons/fa6-solid/info';

  const LS_KEY = 'show-instructions';

  let show = (() => {
    try {
      return !!JSON.parse(localStorage.getItem(LS_KEY));
    } catch (e) {
      return true;
    }
  })();

  $: {
    localStorage.setItem(LS_KEY, show ? 'true' : 'false');
  }
</script>

<div
  class="absolute top-14 right-2 rounded-md rounded-tr-[20px] shadow-lg bg-gray-200 z-100 b b-black/10"
>
  {#if show}
    <div class="w-100 p4">
      <div class="text-xl font-bold">Controls</div>
      <div class="text-lg font-bold">Surface</div>
      <div>Drag with left or middle button to pan</div>
      <div class="text-lg font-bold">Elements library (on edit mode)</div>
      <div>Drag and drop to board to add it</div>
      <div class="text-lg font-bold">Elements (on edit mode)</div>
      <div>Right Click to open configuration menu (you can delete from there)</div>
      <div>Shift while Hovering to show resize and rotate handles</div>
      <div>Drag and drop to move</div>
      <div class="text-right">
        <button on:click={() => (show = false)} class="underline text-blue-600">Dismiss</button>
      </div>
    </div>
  {/if}
  <button
    on:click={() => (show = !show)}
    class="absolute -top-1.5 -right-1.5 rounded-full bg-blue-600 text-white h8 w8 flexcc text-sm b b-black/10 cursor-pointer"
  >
    <InfoIcon class="ml.25 mb.5" />
  </button>
</div>
