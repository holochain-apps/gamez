<script lang="ts">
  import { tooltip } from '~/center/lib/tooltip';
  import { encodeHashToBase64, decodeHashFromBase64 } from '@holochain/client';
  import { type AgentPubKey } from '@holochain/client';
  import clients from '~/clients';

  export let pubKey: AgentPubKey | string;

  $: agentPubKeyB64 = typeof pubKey == 'string' ? pubKey : encodeHashToBase64(pubKey);
  $: agentPubKeyHash = typeof pubKey == 'string' ? decodeHashFromBase64(pubKey) : pubKey;
  $: profile = clients.profilesStore.profiles.get(agentPubKeyHash);
  $: nickname =
    $profile.status == 'complete' && $profile.value
      ? $profile.value.entry.nickname
      : agentPubKeyB64.slice(5, 9) + '...';
</script>

<span use:tooltip={nickname}><slot /></span>
