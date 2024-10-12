<script lang="ts">
  import { encodeHashToBase64, decodeHashFromBase64 } from '@holochain/client';
  import { type AgentPubKey } from '@holochain/client';
  import { getContext } from '~/GameSpace/store/store';

  const { profilesStore } = getContext();

  export let agentPubKey: AgentPubKey | string;
  let klass = '';
  export { klass as class };

  $: agentPubKeyB64 =
    typeof agentPubKey == 'string' ? agentPubKey : encodeHashToBase64(agentPubKey);
  $: agentPubKeyHash =
    typeof agentPubKey == 'string' ? decodeHashFromBase64(agentPubKey) : agentPubKey;
  $: profile = profilesStore.profiles.get(agentPubKeyHash);
  $: nickname =
    $profile.status == 'complete' && $profile.value
      ? $profile.value.entry.nickname
      : agentPubKeyB64.slice(5, 9) + '...';
</script>

<span class={klass}>{nickname}</span>
