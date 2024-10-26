<script lang="ts">
  import { decodeHashFromBase64 } from '@holochain/client';
  import Avatar from '~/shared/Avatar.svelte';
  import Input from '../ui/Input.svelte';
  import Checkbox from '../ui/Checkbox.svelte';

  export let isSteward: boolean;
  export let creator: string;
  export let name: string;
  export let onNameChange: (name: string) => void;
  export let isStewarded: boolean;
  export let onIsStewardedChange: (isStewarded: boolean) => void;
</script>

<div class="w-60 bg-main-800 h-full flex-shrink-0">
  <div class="h16 p2 relative bg-white/10 b b-black/10 flexcs">
    <div class="absolute right-2 top-1 opacity-50">Creator</div>
    <Avatar showNickname={true} size={32} agentPubKey={decodeHashFromBase64(creator)} />
  </div>
  <div class="p4 flex flex-col space-y-4">
    <Input value={name} label="Name" disabled={!isSteward} onInput={onNameChange} />
    <Checkbox
      value={isStewarded}
      label="Stewarded?"
      disabled={!isSteward}
      onInput={onIsStewardedChange}
    />
  </div>
</div>
