<script lang="ts">
  import type { GameSpace } from '~/store';

  export let gameSpace: GameSpace;
  export let onImport: () => void;
</script>

<div class={'bg-white/10 p2 b b-white/10 rounded-md max-w-screen-sm mx-auto w-full flex'}>
  <div class="h16 w16 flex-shrink-0 mr2 relative">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Blank_Go_board.svg/600px-Blank_Go_board.svg.png?20140621020717"
      alt=""
    />
  </div>
  <div class="flex flex-grow h16 items-center content-">
    <h2 class="text-xl flex-grow text-black/70">{gameSpace.name}</h2>
    <div class="flex-grow"></div>
    <button
      on:click={onImport}
      class="h8 bg-main-500 hover:bg-main-600 b b-black/10 rounded-md uppercase text-sm tracking-wider px2 text-white"
      >Import</button
    >
  </div>
</div>
