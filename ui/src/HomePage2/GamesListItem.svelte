<script lang="ts">
  import EllipsisIcon from '~icons/fa6-solid/ellipsis';
  import { nav } from '~/lib/routes';
  import PlayerStatus from './PlayerStatus.svelte';
  import { GameSpaceSyn } from '~/GameSpace/store/GameSpaceSyn';

  export let gameSpace: GameSpaceSyn;
  $: state = gameSpace.state;
</script>

<div class="bg-white/10 p2 b b-white/10 rounded-md max-w-screen-sm mx-auto w-full flex">
  <div class="h32 w32 flex-shrink-0 mr2">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Blank_Go_board.svg/600px-Blank_Go_board.svg.png?20140621020717"
      alt=""
    />
  </div>
  <div class="flex flex-col flex-grow">
    <div class="flexcs w-full h-8">
      <h2 class="text-xl flex-grow text-black/70">{$state?.name}</h2>
      <button class="flexcc bg-main-500 hover:bg-main-600 rounded-md h8 w8 b b-black/10 text-white">
        <EllipsisIcon />
      </button>
    </div>
    <div class="flex-grow"></div>
    <div class="flex">
      <div class="flexcs flex-grow h8">
        <div
          class="text-sm mt1 mr2 bg-main-500 shadow-[inset_0_1px_0_#0003,inset_0_-1px_0_#fff8,inset_0_0_3px_#0005] bg-gradient-to-b from-white/10 to-white-0 rounded-full px2 py1 mr1 text-white/80"
          >6/8</div
        >
        <PlayerStatus agent={gameSpace.pubKey} inRoom={true} isPlaying={true} isCreator={true} />
        <PlayerStatus agent={gameSpace.pubKey} inRoom={false} isPlaying={true} isCreator={false} />
        <PlayerStatus agent={gameSpace.pubKey} inRoom={true} isPlaying={true} isCreator={false} />
        <PlayerStatus agent={gameSpace.pubKey} inRoom={true} isPlaying={true} isCreator={false} />
        <PlayerStatus agent={gameSpace.pubKey} inRoom={true} isPlaying={false} isCreator={false} />
        <PlayerStatus agent={gameSpace.pubKey} inRoom={true} isPlaying={false} isCreator={false} />
        <PlayerStatus agent={gameSpace.pubKey} inRoom={true} isPlaying={false} isCreator={false} />
      </div>
      <button
        on:click={() => nav({ id: 'gameSpace', gameSpaceHash: gameSpace.hash })}
        class="h-full bg-main-500 hover:bg-main-600 b b-black/10 rounded-md uppercase text-sm tracking-wider px2 text-white"
        >Enter room</button
      >
    </div>
  </div>
</div>
