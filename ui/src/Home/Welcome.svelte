<script lang="ts">
import DiamondIcon from "~icons/fa6-solid/diamond";

export let suggestCreateGameType: boolean = true;

</script>

<div class="bg-main-400 text-white/80 p4">
  <h3 class="mb4 font-black">Welcome to Board Gamez!</h3>
  <p class="mb2">
    <DiamondIcon class="float-left mr2 text-main-700 mt.5"/>
    If you have just joined and you don't see any game types, or games, please
    be patient and allow the network to sync with your peers.
  </p>
  {#if suggestCreateGameType}
    <p>
      <DiamondIcon class="float-left mr2 text-main-700 mt.5"/>
      If you created this instance you may want to click on Chess, Go and
      World in "Create Game Types" or add your own game types.
    </p>
  {/if}
</div>