<script lang="ts">
  import AgentAvatar from '~/shared/AgentAvatar.svelte';
  import AgentName from '~/shared/AgentName.svelte';
  import Input from '../ui/Input.svelte';
  // import Checkbox from '../ui/Checkbox.svelte';
  import IntegerInput from '../ui/IntegerInput.svelte';

  // export let isSteward: boolean;
  export let creator: string;
  export let name: string;
  export let onNameChange: (name: string) => void;
  // export let isStewarded: boolean;
  export let maxPlayersSlots: number;
  export let onMaxPlayersSlotsChange: (maxPlayersSlots: number) => void;
  export let canEdit: boolean;
  // export let onIsStewardedChange: (isStewarded: boolean) => void;
</script>

<div class="w-60 bg-main-800 h-full flex-shrink-0">
  <div class="h16 p2 relative bg-white/10 b b-black/10 flexcs">
    <div class="absolute right-2 top-1 opacity-50">Creator</div>
    <AgentAvatar pubKey={creator} size={32} />
    <AgentName class="ml2" pubKey={creator} />
  </div>
  <div class="p4 flex flex-col space-y-4">
    <Input value={name} label="Name" disabled={!canEdit} onInput={onNameChange} />
    <!-- <Checkbox
      value={isStewarded}
      label="Stewarded?"
      disabled={!isSteward}
      onInput={onIsStewardedChange}
    /> -->
    <IntegerInput
      value={maxPlayersSlots}
      label="Max players slots"
      disabled={!canEdit}
      onInput={onMaxPlayersSlotsChange}
    />
  </div>
</div>
