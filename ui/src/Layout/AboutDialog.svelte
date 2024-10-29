<script lang="ts">
  import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';

  import { hashToB64 } from '~/lib/util';
  import { getContext } from '~/store';

  const { dnaHash } = getContext();

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      dialog.hide();
    }
  };
  let dialog;
  export const open = () => {
    dialog.show();
  };
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore missing-declaration -->
<sl-dialog label="Gamez!" bind:this={dialog} width={600} class="text-black/70!">
  <div class="about">
    <p>Gamez is a demonstration Holochain app built by the Holochain Foundation.</p>
    <p><b>Version:</b> UI {__APP_VERSION__}; DNA {__DNA_VERSION__}</p>
    <p>
      <b>Developers:</b>
      Check out this hApp's source-code
      <a href="https://github.com/holochain-apps/gamez">in our github repo</a>. This project's
      real-time syncronization is powered by <a href="https://github.com/holochain/syn">Syn</a>, a
      library that makes it really easy to build this kind of real-time collaboration into Holochain
      apps.
    </p>
    <p class="small"
      >Copyright © 2023-2024 Holochain Foundation. This software is distributed under the MIT
      License</p
    >
    <p class="small">DNA Hash: {$dnaHash ? hashToB64($dnaHash) : 'Loading...'}</p>
  </div>
</sl-dialog>

<style>
  .about {
    background-color: white;
  }
  .about p {
    margin-bottom: 10px;
  }
  .small {
    font-size: 80%;
  }
  a {
    text-decoration: underline;
  }
</style>
