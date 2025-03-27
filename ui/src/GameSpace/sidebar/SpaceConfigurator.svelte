<script lang="ts">
  import FillIcon from '~icons/fa6-solid/fill';
  import AgentAvatar from '~/center/static/AgentAvatar.svelte';
  import AgentName from '~/center/static/AgentName.svelte';
  import Input from '~/GameSpace/center/input/Input.svelte';
  import IntegerInput from '~/GameSpace/center/input/IntegerInput.svelte';
  import { tooltip } from '~/center/lib/tooltip';

  export let creator: string;
  export let name: string;
  export let onNameChange: (name: string) => void;
  export let maxPlayersSlots: number;
  export let onMaxPlayersSlotsChange: (maxPlayersSlots: number) => void;
  export let onApplyColors: () => void;
</script>

<div class="w-60 bg-main-800 h-full flex-shrink-0">
  <div class="h16 p2 relative bg-white/10 b b-black/10 flexcs">
    <div class="absolute right-2 top-1 opacity-50">Creator</div>
    <AgentAvatar pubKey={creator} size={32} />
    <AgentName class="ml2" pubKey={creator} />
  </div>
  <div class="p4 flex flex-col space-y-4">
    <div class="flexcc">
      <Input value={name} label="Name" onInput={onNameChange} />
    </div>
    <div class="flex">
      <IntegerInput
        value={maxPlayersSlots}
        label="Max players slots"
        onInput={onMaxPlayersSlotsChange}
      />
      <button
        use:tooltip={'Apply automatic colors'}
        on:click={onApplyColors}
        class="w-12 flex-shrink-0 flexcc bg-main-400 ml2 rounded-md text-white b b-black/10 hover:bg-main-500"
        ><FillIcon /></button
      >
    </div>
  </div>
</div>
