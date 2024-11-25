<script lang="ts">
  import { encodeHashToBase64, decodeHashFromBase64 } from '@holochain/client';
  import { type AgentPubKey } from '@holochain/client';
  import { getContext } from '~/store';

  const { profilesStore } = getContext();

  export let pubKey: AgentPubKey | string;
  let klass = '';
  export { klass as class };

  $: agentPubKeyB64 = typeof pubKey == 'string' ? pubKey : encodeHashToBase64(pubKey);
  $: agentPubKeyHash = typeof pubKey == 'string' ? decodeHashFromBase64(pubKey) : pubKey;
  $: profile = profilesStore.profiles.get(agentPubKeyHash);
  $: nickname =
    $profile.status == 'complete' && $profile.value
      ? $profile.value.entry.nickname
      : agentPubKeyB64.slice(5, 9) + '...';
</script>

<span class={klass}>{nickname}</span>
