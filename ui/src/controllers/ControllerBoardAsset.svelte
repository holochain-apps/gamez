<script lang="ts">
  import type { AppletView } from '@theweave/api';
  import { Page as GameSpacePage } from '~/GameSpace';
  import { hashToB64 } from '~/center/lib/util';

  export let view: Extract<AppletView, { type: 'asset' }>;
  $: hash = hashToB64(view.wal.hrl[1] as Uint8Array);
</script>

<GameSpacePage {hash} asAsset={true} />
