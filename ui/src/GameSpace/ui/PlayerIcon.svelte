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

  function getContrastingBlackOrWhite(color: string) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000' : '#fff';
  }

  $: borderSize = size / 12;
  $: contrastingColor = getContrastingBlackOrWhite(color);
</script>

<div
  class={`relative flexcc rounded-full b-black/10 shadow-md ${klass}`}
  style={`background-color: ${color}; ${style}; height: ${size}px; width: ${size}px; ${style}; border-width: ${borderSize}px;`}
>
  {#if pubKey}
    <AgentAvatar class="relative z-20" size={size - borderSize * 2} {pubKey} />
  {/if}
  <div class="absolute z-10 inset-0 flexcc opacity-80" style="color: {contrastingColor};"
    >{slot + 1}</div
  >
</div>
