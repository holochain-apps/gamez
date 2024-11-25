<script lang="ts">
  import AgentAvatar from '~/shared/AgentAvatar.svelte';
  import { type AgentPubKey } from '@holochain/client';

  export let pubKey: AgentPubKey | string | null;
  export let size: number;
  export let color: string;
  export let slot: number;
  let klass: string = '';
  export { klass as class };
  export let style = '';
</script>

<div
  class={`relative flexcc rounded-full b-black/10 shadow-md text-white b-2 ${klass}`}
  style={`background-color: ${color}; ${style}; height: ${size}px; width: ${size}px; ${style}`}
>
  {#if pubKey}
    <AgentAvatar class="relative z-20" size={size - 4} {pubKey} />
  {/if}
  <div class="absolute z-10 inset-0 flexcc mix-blend-difference opacity-50">{slot + 1}</div>
</div>
