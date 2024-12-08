<script lang="ts">
  import MoveIcon from '~icons/fa6-solid/up-down-left-right';
  import { weaveUrlToLocation, stringifyHrl, encodeContext } from '@theweave/api';
  import { urlFromAppletHash, appletOrigin } from '@theweave/elements/dist/utils';
  import { getContext } from '~/store';
  import type { EmbedWalElement } from './type';

  export let el: EmbedWalElement;
  // export let gameSpace: any = null;
  let klass: string = '';
  export { klass as class };
  $$restProps; // This prevents Svelte warnings from unused props

  const { weaveClient } = getContext();

  // Track the previous wals to detect changes
  let previousWals: string[] = [];

  // Only recompute firstValidAsset if el.wals changes
  let firstValidAssetSrc: string | null = null;

  function walsAreEqual(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  $: if (!walsAreEqual(el.wals, previousWals)) {
    previousWals = el.wals; // Update the reference to avoid triggering again
    firstValidAsset()
      .then((src) => {
        firstValidAssetSrc = src;
      })
      .catch((err) => {
        console.error(err);
        firstValidAssetSrc = null;
      });
  }

  async function firstValidAsset() {
    console.log('Calculating first valid asset');
    const locations = el.wals.map(weaveUrlToLocation);
    const weaveLocation = locations.find((location) => location.type === 'asset');
    if (!weaveLocation) throw 'No valid asset available';
    const wal = weaveLocation.wal;
    const info = await weaveClient.assetInfo(wal);
    if (!info) throw 'Asset not found';
    const queryString = [
      'view=applet-view',
      'view-type=asset',
      'hrl=' + stringifyHrl(wal.hrl),
      wal.context ? 'context=' + encodeContext(wal.context) : '',
    ].join('&');
    const iframeSrc = info.appletDevPort
      ? `http://localhost:${
          info.appletDevPort
        }?${queryString}#${urlFromAppletHash(info.appletHash)}`
      : `${appletOrigin(info.appletHash)}?${queryString}`;
    return iframeSrc;
  }
</script>

<div class={`${klass} bg-gray-100 rounded-md w-full h-full flex`}>
  {#if el.url}
    <iframe
      title="Embedded URL"
      class="h-full w-full"
      src={el.url}
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  {:else if firstValidAssetSrc}
    <iframe
      title="Embedded WAL"
      class="h-full w-full"
      src={firstValidAssetSrc}
      frameborder="0"
      allow="clipboard-write;"
      allowfullscreen
    ></iframe>
  {:else}
    <div
      class="w-full h-full flexcc"
      style={`font-size: ${Math.min(Math.min(el.width, el.height) * 0.5, 200)}px;`}>📎</div
    >
  {/if}
  <div
    class="absolute -top-4 -right-4 rounded-full b b-black/10 shadow-md text-lg font-bold bg-red-500 text-white flexcc h8 w8 cursor-move"
  >
    <MoveIcon />
  </div>
</div>
