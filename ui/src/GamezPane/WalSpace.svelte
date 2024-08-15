<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import '@shoelace-style/shoelace/dist/components/button/button.js';
  import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';

  import { type AssetSpec } from '~/shared/util';
  import { getStoreContext } from '~/lib/context';

  import WalAsset from './WalAsset.svelte';

  const store = getStoreContext();

  const dispatch = createEventDispatcher();

  let className = '';
  export { className as class };

  export let items: AssetSpec[] = [];
  let assets: WalAsset[] = [];

  // const addAttachment = async () => {
  //   const wal = await store.weaveClient.userSelectWal();
  //   if (wal) {
  //     items.push({ embed: true, weaveUrl: weaveUrlFromWal(wal), position: { x: 100*items.length, y: 100*items.length } });
  //     items = items;
  //   }
  // };
  let editable = false;

  export const setEditable = (e) => {
    if (editable !== e) {
      if (!e) {
        assets.forEach((a, i) => {
          items[i].position = a.position;
          items[i].size = a.size;
        });
        dispatch('assets-edited', items);
      }
      editable = e;
      assets.forEach((i) => i.setEditable(editable));
    }
  };

  $: console.log('WAL ASSETS', assets);
</script>

<div class="w-full h-full relative text-lg bg-black/10 rounded-lg relative {className}">
  {#each items as item, i}
    <WalAsset
      isEditable={editable}
      bind:this={assets[i]}
      position={item.position}
      size={item.size}
      weaveUrl={item.weaveUrl}
    ></WalAsset>
  {/each}
</div>

<style>
  .top-bar {
    height: 30px;
    background: #8595bf;
    display: flex;
  }
  .asset-container {
    position: relative;
  }
  .space {
    width: 100%;
    height: 100%;
    position: relative;
    font-size: 16px;
  }
</style>
