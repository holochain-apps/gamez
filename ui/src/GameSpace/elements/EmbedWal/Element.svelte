<script lang="ts">
  import CaretDownIcon from '~icons/fa6-solid/caret-down';
  import ArrowUpRightFromSquareIcon from '~icons/fa6-solid/arrow-up-right-from-square';
  import { weaveUrlToLocation, stringifyHrl, encodeContext, type WAL } from '@theweave/api';
  import { urlFromAppletHash, appletOrigin } from '@theweave/elements/dist/utils';
  import { getContext, type GameSpaceSyn } from '~/store';
  import type { EmbedWalElement } from './type';
  import { cx } from '~/lib/util';

  export let el: EmbedWalElement;
  export let gameSpace: GameSpaceSyn;
  let klass: string = '';
  export { klass as class };
  $$restProps; // This prevents Svelte warnings from unused props

  const { weaveClient } = getContext();

  // Track the previous wals to detect changes
  let previousWals: string[] = [];

  // Only recompute firstValidAsset if el.wals changes
  let displayAsset: {
    src: string;
    name: string;
    icon: string;
    wal: WAL;
  } | null = null;

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
      .then((val) => {
        displayAsset = val;
      })
      .catch((err) => {
        console.error(err);
        displayAsset = null;
      });
  }

  async function firstValidAsset() {
    console.log('Calculating first valid asset');
    const locations = el.wals.map(weaveUrlToLocation);
    const weaveLocation = locations.find((location) => location.type === 'asset');
    if (!weaveLocation) throw 'No valid asset available';
    const wal = weaveLocation.wal;
    const info = await weaveClient.assets.assetInfo(wal);
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
    return { src: iframeSrc, name: info.assetInfo.name, icon: info.assetInfo.icon_src, wal };
  }

  function handleTogglePreview() {
    const height = el.preview ? 30 : el.storedHeight;
    const storedHeight = el.preview ? el.height : el.storedHeight;
    const y = el.y + (el.preview ? -(storedHeight - 30) / 2 : (storedHeight - el.height) / 2);
    gameSpace.change({
      type: 'update-element',
      element: { uuid: el.uuid, preview: !el.preview, height, storedHeight, y },
    });
  }

  function handleOpenWal() {
    weaveClient.openAsset(displayAsset.wal);
  }
</script>

<div
  class={`${klass} bg-gray-100 rounded-md w-full h-full flex flex-col b b-main-300 shadow-lg overflow-hidden`}
>
  <div class="h8 flex-shrink-0 flex text-lg p1 bg-gray-200">
    <div class="flex-grow h-full flexcs">
      {#if displayAsset}
        <button
          class="flexcc h-full b b-black/0 hover:(b-black/10 bg-black/20 text-white) rounded-md p1"
          on:click={handleOpenWal}
        >
          {#if displayAsset.icon}
            <img class="h-full mr1" src={displayAsset.icon} />
          {/if}
          {displayAsset.name}
          <ArrowUpRightFromSquareIcon class="h-full ml2 text-main-400" />
        </button>
      {:else}
        No asset selected
      {/if}
    </div>
    <button class="pr1" on:click={handleTogglePreview}>
      <CaretDownIcon class={cx('transition', { '-rotate-180': el.preview })} />
    </button>
  </div>
  {#if el.preview}
    {#if displayAsset}
      <iframe
        title="Embedded WAL"
        class="h-full w-full flex-grow"
        src={displayAsset.src}
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
  {/if}
</div>
