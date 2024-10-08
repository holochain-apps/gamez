<script lang="ts">
  import { encodeHashToBase64, decodeHashFromBase64 } from '@holochain/client';
  import '@holochain-open-dev/profiles/dist/elements/agent-avatar.js';
  import { getContext } from '~/GameSpace/store/store';
  import type { PlayerPieceElement } from './type';

  export let el: PlayerPieceElement;
  let klass: string = '';
  export { klass as class };

  const { profilesStore } = getContext();

  // $: agentHash = decodeHashFromBase64(el.agent);
  // $: profile = profilesStore.profiles.get(agentHash);
</script>

<code class={`${klass} w-100 h-100 bg-red-500`}>
  <!-- {JSON.stringify($profile, null, 2)} -->
  <!-- {#if $profile.status == 'complete'} -->
  <agent-avatar
    class:disable-ptr-events={true}
    disable-tooltip={true}
    disable-copy={true}
    size={Math.min(el.width, el.height)}
    agent-pub-key={el.agent}
  ></agent-avatar>
  <div></div>
  <!-- {/if} -->
</code>
