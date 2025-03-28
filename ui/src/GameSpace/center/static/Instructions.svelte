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
  class="absolute top-14 right-2 rounded-md rounded-tr-[20px] shadow-lg bg-gray-200 z-1500 b b-black/10"
>
  {#if show}
    <div class="w-100 p4">
      <div>Drag elements to move them</div>
      <div>Right click on element to open configuration menu</div>
      <div>You can select and move, delete, resize or rotate elements</div>
      <div>You can currently only duplicate individual elements from the configuration menu</div>
      <div class="text-lg font-bold">Play Mode</div>
      <div>While in Play mode you can switch back to Edit mode from the bottom left button</div>
      <div class="text-lg font-bold">Edit Mode</div>
      <div>Drag and drop items to the board from the library to add them</div>
      <div
        >Elements movement, rotation, resizing, configuration, attachment and duplication may be
        locked on Play Mode; you can configure this on Edit Mode</div
      >
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
