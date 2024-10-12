<script lang="ts">
  import '@holochain-open-dev/profiles/dist/elements/agent-avatar.js';

  export let size: number;
  export let pubKey: string;
  let klass: string = '';
  export { klass as class };
  export let style = '';
</script>

<div class={`${klass} rounded-full`} style={`width: ${size}px; height: ${size}px; ${style}`}>
  <agent-avatar
    class:disable-ptr-events={true}
    disable-tooltip={true}
    disable-copy={true}
    {size}
    agent-pub-key={pubKey}
  ></agent-avatar>
</div>
