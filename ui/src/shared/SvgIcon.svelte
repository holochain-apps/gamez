<script lang="ts">
  import { svgIcons } from './svgIcons';

  export let icon: string;
  export let style: string = '';
  export let color: string = 'currentColor';
  export let size: string = '20px';

  $: iconStr = () => {
    let i = svgIcons[icon];
    if (!i) console.log('missing icon for ', icon);
    if (color) {
      i = i.replace('<svg', `<svg fill="${color}"`);
    }
    return `data:image/svg+xml;charset=utf-8,${i.replace('#', '%23')}`;
  };
  $: styleStr = `${size ? 'width:' + size : ''};`;
</script>

<div class="icon" {style}><img alt={icon} width={size} src={iconStr()} /></div>

<style>
  .icon {
    display: inline-block;
  }
  .icon img {
    vertical-align: middle;
  }
</style>
