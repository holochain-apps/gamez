<script lang="ts">
  import type { AppletView } from '@theweave/api';
  import { Page as GameSpacePage } from '~/GameSpace';
  import { hashToB64 } from '~/lib/util';
  import { type WAL } from '@theweave/api';

  const { wal }: { wal: WAL } = $props();

  // export let view: Extract<AppletView, { type: 'asset' }>;
  const hash = $derived(hashToB64(wal.hrl[1] as Uint8Array));
</script>

<GameSpacePage {hash} asAsset={true} />
