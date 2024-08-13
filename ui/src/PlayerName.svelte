<script lang="ts">
  import { encodeHashToBase64 } from "@holochain/client";
  import { type AgentPubKey } from "@holochain/client";
  import { getContext } from "svelte";
  import { GamezStore } from "./store";

  const { getStore }: any = getContext("gzStore");
  const store: GamezStore = getStore();

  export let agentPubKey: AgentPubKey;

  $: agentPubKeyB64 = encodeHashToBase64(agentPubKey)
  $: profile = store.profilesStore.profiles.get(agentPubKey);
  $: nickname = $profile.status=="complete" && $profile.value
    ? $profile.value.entry.nickname
    : agentPubKeyB64.slice(5,9) + "...";

</script>

<span>{nickname}</span>
