<script lang="ts">
  import { getContext, type GameSpace } from './store';
  const { hash }: { hash: string } = $props();
  import R from '~/lib/routes.svelte';

  const S = getContext();

  const doc = $derived(S.gameSpaces[hash]);
</script>

<div class="flex flex-col h-full">
  <button onclick={() => R.goBack()}>Back</button>
  <div class="flex-grow h-full">
    {#if doc}
      <textarea
        class="w-full h-full"
        onkeydown={(e) => {
          if (e.key === 's' && e.metaKey) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        onkeyup={(e) => {
          const value = e.currentTarget.value;
          let parsed = null;
          try {
            parsed = JSON.parse(value);
          } catch (e) {
            console.log('...');
            return;
          }
          doc.update(parsed as GameSpace);
        }}
        value={JSON.stringify(doc.doc, null, 2)}
      ></textarea>
    {:else}
      Loading...
    {/if}
  </div>
</div>
