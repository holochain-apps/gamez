<script lang="ts">
  import { getContext, type GameSpace } from '../store';
  import R from '~/lib/routes.svelte';

  const { hash, useAssetView }: { hash: string; useAssetView: boolean } = $props();

  const S = getContext();

  const doc = $derived(S.gameSpaces[hash]);
</script>

Hey
