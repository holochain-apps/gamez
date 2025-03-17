<script lang="ts">
  export let textual: boolean = true;
  let klass = '';
  export { klass as class };
</script>

<div class={`flexcc size-full ${klass}`}>
  <div class="h16 w16 relative flexcc">
    <div
      class="b-6 b-main-800 b-t-main-600 b-b-main-600 w8 h8 animate-spin animate-duration-1500 rounded-full"
    ></div>
    <div
      class="b-10 b-main-800 b-t-main-600 w16 h16 animate-spin animate-duration-3000 rounded-full absolute"
    ></div>
  </div>
  {#if textual}
    <div class="ml4 text-lg animate-pulse">Loading...</div>
  {/if}
</div>
