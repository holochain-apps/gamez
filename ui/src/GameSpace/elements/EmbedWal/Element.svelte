<script lang="ts">
  import CaretDownIcon from '~icons/fa6-solid/caret-down';
  import ArrowUpRightFromSquareIcon from '~icons/fa6-solid/arrow-up-right-from-square';
  import TrashIcon from '~icons/fa6-solid/trash';
  import {
    weaveUrlToLocation,
    stringifyHrl,
    encodeContext,
    type WAL,
    weaveUrlFromWal,
  } from '@theweave/api';
  import { urlFromAppletHash, appletOrigin } from '@theweave/elements/dist/utils';
  import { type GameSpaceSyn } from '~/store';
  import type { EmbedWalElement } from './type';
  import { cx } from '~/lib/util';
  import clients from '~/clients';

  export let el: EmbedWalElement;
  export let gameSpace: GameSpaceSyn;
  let klass: string = '';
  export { klass as class };
  $$restProps; // This prevents Svelte warnings from unused props

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

  async function handleAddAttachment() {
    if (clients.weave) {
      const wal = await clients.weave.assets.userSelectAsset();
      if (wal) {
        const weaveUrl = weaveUrlFromWal(wal);
        gameSpace.change({
          type: 'update-element',
          element: { uuid: el.uuid, wals: [...el.wals, weaveUrl] },
        });
      }
    }
  }

  async function handleRemoveAttachment() {
    gameSpace.change({
      type: 'update-element',
      element: { uuid: el.uuid, wals: [] },
    });
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
    const info = await clients.weave.assets.assetInfo(wal);
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
    clients.weave.openAsset(displayAsset.wal);
  }
</script>

<div
  class={`${klass} bg-gray-100 rounded-md w-full h-full flex flex-col b b-main-300 shadow-lg overflow-hidden`}
>
  <!-- HEADER -->
  <div class="h8 flex-shrink-0 flex text-lg p1 bg-gray-200">
    <div class="flex-grow h-full flexcs">
      {#if displayAsset}
        <button
          class="flexcc h-full b b-black/0 hover:( bg-black/10 text-white) rounded-sm p1"
          on:click={handleOpenWal}
        >
          {#if displayAsset.icon}
            <img class="h-full mr1" src={displayAsset.icon} />
            <!-- <img
              class="h-full mr1"
              src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' style='fill: currentColor' viewBox='0 0 24 24'><path d='M3,15H1V3A2,2 0 0,1 3,1H19V3H3V15M12,23A1,1 0 0,1 11,22V19H7A2,2 0 0,1 5,17V7A2,2 0 0,1 7,5H21A2,2 0 0,1 23,7V17A2,2 0 0,1 21,19H16.9L13.2,22.71C13,22.89 12.76,23 12.5,23H12M9,9V11H19V9H9M9,13V15H17V13H9Z'></path></svg>"
            /> -->
          {/if}
          {displayAsset.name}
          <ArrowUpRightFromSquareIcon class="h-full ml2 text-main-400" />
        </button>
      {:else}
        <button
          class="flexcc h-full b b-black/0 hover:( bg-black/10 text-white) rounded-sm p1"
          on:click={handleAddAttachment}>Select asset</button
        >
      {/if}
    </div>
    <button on:click={handleRemoveAttachment} class="mr2 hover:(bg-red-500 text-white) rounded-sm">
      <TrashIcon class="h4" />
    </button>
    <button class="pr1" on:click={handleTogglePreview}>
      <CaretDownIcon class={cx('transition', { '-rotate-180': el.preview })} />
    </button>
  </div>
  <!-- PREVIEW -->
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
      <button
        class="w-full h-full flexcc cursor-pointer"
        on:click={() => handleAddAttachment()}
        style={`font-size: ${Math.min(Math.min(el.width, el.height) * 0.5, 200)}px;`}>📎</button
      >
    {/if}
  {/if}
</div>
