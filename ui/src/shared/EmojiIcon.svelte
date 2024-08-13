<script lang="ts">
  export let emoji: string;
  let className = '';
  export { className as class };
</script>

<div class="icon-size {className}">{emoji}</div>

<style>
  .icon-size {
    font-size: 16px;
  }
  .label-icon {
    margin-right: 2px;
  }
</style>
