<script lang="ts">
  import { encodeHashToBase64 } from '@holochain/client';
  import { type AgentPubKey } from '@holochain/client';
  import '@holochain-open-dev/profiles/dist/elements/agent-avatar.js';

  export let size: number;
  export let pubKey: AgentPubKey | string;
  let klass: string = '';
  export { klass as class };
  export let style = '';

  $: pubKeyB64 = typeof pubKey == 'string' ? pubKey : encodeHashToBase64(pubKey);
</script>

<div
  class={`${klass} rounded-full font-size-0`}
  style={`width: ${size}px; height: ${size}px; ${style}`}
>
  <agent-avatar
    class:disable-ptr-events={true}
    disable-tooltip={true}
    disable-copy={true}
    draggable={false}
    {size}
    agent-pub-key={pubKeyB64}
  ></agent-avatar>
</div>
