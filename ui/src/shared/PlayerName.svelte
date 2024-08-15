<script lang="ts">
  import { encodeHashToBase64 } from '@holochain/client';
  import { type AgentPubKey } from '@holochain/client';

  import { getStoreContext } from '~/lib/context';

  const store = getStoreContext();

  export let agentPubKey: AgentPubKey;

  $: agentPubKeyB64 = encodeHashToBase64(agentPubKey);
  $: profile = store.profilesStore.profiles.get(agentPubKey);
  $: nickname =
    $profile.status == 'complete' && $profile.value
      ? $profile.value.entry.nickname
      : agentPubKeyB64.slice(5, 9) + '...';
</script>

<span>{nickname}</span>
